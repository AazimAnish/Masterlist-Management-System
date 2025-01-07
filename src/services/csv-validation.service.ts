import { z } from 'zod';
import { Item } from '@/types/item';
import { BOMEntry, CSVValidationError } from '@/types/bom';
import { CSVError } from '@/types/csv';

// CSV Row Schema with strict typing for Items
const csvItemSchema = z.object({
    internal_item_name: z.string().min(1, 'Internal item name is required'),
    type: z.enum(['sell', 'purchase', 'component'], {
        required_error: 'Type is required',
        invalid_type_error: 'Invalid type selected',
    }),
    uom: z.enum(['kgs', 'nos'], {
        required_error: 'UoM is required',
        invalid_type_error: 'Invalid UoM selected',
    }),
    min_buffer: z.coerce.number().nullable(),
    max_buffer: z.coerce.number().nullable(),
    additional_attributes: z.object({
        avg_weight_needed: z.coerce.boolean().default(false),
        scrap_type: z.string().optional(),
    }).optional(),
});

// CSV Row Schema with strict typing for BOM
const csvBOMSchema = z.object({
    item_id: z.string().min(1, 'Item ID is required'),
    component_id: z.string().min(1, 'Component ID is required'),
    quantity: z.coerce
        .number()
        .min(1, 'Quantity must be at least 1')
        .max(100, 'Quantity must not exceed 100'),
});

type CSVItemRow = z.infer<typeof csvItemSchema>;
type CSVBOMRow = z.infer<typeof csvBOMSchema>;

export class CSVValidationService {
    static validateItemsCSV(
        csvData: any[],
        existingItems: Item[]
    ): { validRows: Item[]; errors: CSVError[] } {
        const validRows: Item[] = [];
        const errors: CSVError[] = [];

        csvData.forEach((row, index) => {
            try {
                // First validate the basic structure
                const validatedRow = csvItemSchema.parse(row);

                // Validate business rules
                // Check for unique internal_item_name + tenant combination
                const isDuplicate = existingItems.some(
                    item => 
                        item.internal_item_name === validatedRow.internal_item_name &&
                        !item.is_deleted
                );

                if (isDuplicate) {
                    throw new Error('Item name must be unique');
                }

                // Validate scrap_type for sell items
                if (validatedRow.type === 'sell' && !validatedRow.additional_attributes?.scrap_type) {
                    throw new Error('Scrap type is required for sell items');
                }

                // Validate min_buffer for sell and purchase items
                if ((validatedRow.type === 'sell' || validatedRow.type === 'purchase') && 
                    validatedRow.min_buffer === null) {
                    throw new Error('Min buffer is required for sell and purchase items');
                }

                // Validate max_buffer >= min_buffer
                if (validatedRow.max_buffer !== null && 
                    validatedRow.min_buffer !== null && 
                    validatedRow.max_buffer < validatedRow.min_buffer) {
                    throw new Error('Max buffer must be greater than or equal to min buffer');
                }

                // Create a new item with system-generated fields
                const newItem: Item = {
                    id: crypto.randomUUID(),
                    ...validatedRow,
                    tenant_id: 1,
                    created_by: 'system_user',
                    last_updated_by: 'system_user',
                    is_deleted: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    min_buffer: validatedRow.min_buffer ?? 0,
                    max_buffer: validatedRow.max_buffer ?? 0,
                    additional_attributes: {
                        ...validatedRow.additional_attributes,
                        avg_weight_needed: validatedRow.additional_attributes?.avg_weight_needed ?? false,
                    },
                };

                validRows.push(newItem);
            } catch (error) {
                errors.push({
                    row: index + 2, // Add 2 to account for header row and 0-based index
                    message: error instanceof Error ? error.message : 'Invalid row data',
                    field: this.getErrorField(error),
                    value: row[this.getErrorField(error)],
                    suggestion: this.getErrorSuggestion(error),
                });
            }
        });

        return { validRows, errors };
    }

    static validateBOMCSV(
        csvData: any[],
        existingItems: Item[],
        existingBOMs: BOMEntry[]
    ): { validRows: BOMEntry[]; errors: CSVValidationError[] } {
        const validRows: BOMEntry[] = [];
        const errors: CSVValidationError[] = [];

        csvData.forEach((row, index) => {
            try {
                // First validate the basic structure
                const validatedRow = csvBOMSchema.parse(row);
                
                // Find the referenced items
                const item = existingItems.find(i => i.id === validatedRow.item_id);
                const component = existingItems.find(i => i.id === validatedRow.component_id);

                // Validate business rules
                if (!item || !component) {
                    throw new Error('Referenced items do not exist');
                }

                if (item.type === 'purchase') {
                    throw new Error('Purchase items cannot be used as main items in BOM');
                }

                if (component.type === 'sell') {
                    throw new Error('Sell items cannot be used as components in BOM');
                }

                // Check for duplicate combinations
                const isDuplicate = existingBOMs.some(
                    bom => bom.item_id === validatedRow.item_id && 
                          bom.component_id === validatedRow.component_id
                ) || validRows.some(
                    vr => vr.item_id === validatedRow.item_id && 
                         vr.component_id === validatedRow.component_id
                );

                if (isDuplicate) {
                    throw new Error('This item and component combination already exists');
                }

                // Create a new BOM entry with system-generated fields
                const newBOMEntry: BOMEntry = {
                    id: crypto.randomUUID(),
                    ...validatedRow,
                    uom: component.uom,
                    scrap_percentage: 0,
                    notes: '',
                    created_by: 'system_user',
                    last_updated_by: 'system_user',
                    is_active: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                validRows.push(newBOMEntry);
            } catch (error) {
                errors.push({
                    row: index + 2,
                    message: error instanceof Error ? error.message : 'Invalid row data',
                    data: row,
                });
            }
        });

        return { validRows, errors };
    }

    static generateErrorReport(errors: CSVError[]): string {
        const headers = ['Row', 'Field', 'Value', 'Error', 'Suggestion'];
        const rows = errors.map(error => [
            error.row?.toString() || '',
            error.field || '',
            error.value?.toString() || '',
            error.message || '',
            error.suggestion || '',
        ]);

        return [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');
    }

    static generateItemTemplate(): string {
        const headers = [
            'internal_item_name',
            'type',
            'uom',
            'min_buffer',
            'max_buffer',
            'avg_weight_needed',
            'scrap_type',
        ];

        const example = [
            'Example Item',
            'sell',
            'nos',
            '5',
            '10',
            'true',
            'scrap_a',
        ];

        return [
            headers.join(','),
            example.join(','),
        ].join('\n');
    }

    static generateBOMTemplate(): string {
        const headers = [
            'item_id',
            'component_id',
            'quantity',
        ];

        const example = [
            'item_123',
            'component_456',
            '5',
        ];

        return [
            headers.join(','),
            example.join(','),
        ].join('\n');
    }

    private static getErrorField(error: unknown): string {
        if (error instanceof z.ZodError) {
            return error.errors[0]?.path[0]?.toString() || 'unknown';
        }
        return 'unknown';
    }

    private static getErrorSuggestion(error: unknown): string {
        if (error instanceof z.ZodError) {
            const field = error.errors[0]?.path[0]?.toString();
            switch (field) {
                case 'internal_item_name':
                    return 'Provide a unique name for the item';
                case 'type':
                    return 'Use one of: sell, purchase, component';
                case 'uom':
                    return 'Use one of: kgs, nos';
                case 'min_buffer':
                    return 'Provide a number >= 0';
                case 'max_buffer':
                    return 'Provide a number >= min_buffer';
                case 'scrap_type':
                    return 'Required for sell items';
                default:
                    return 'Check the field value and try again';
            }
        }
        return 'Check the data and try again';
    }
}
