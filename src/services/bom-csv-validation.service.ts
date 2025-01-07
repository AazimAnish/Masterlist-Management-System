import { z } from 'zod';
import { Item } from '@/types/item';
import { BOMEntry, CSVValidationError } from '@/types/bom';

const csvBOMSchema = z.object({
  id: z.string().optional(),
  item_id: z.string().min(1, 'Item ID is required'),
  component_id: z.string().min(1, 'Component ID is required'),
  quantity: z.coerce
    .number()
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity must not exceed 100'),
  created_by: z.string().optional(),
  last_updated_by: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export class BOMCSVValidationService {
  static validateBOMCSV(
    csvData: any[],
    existingItems: Item[],
    existingBOMs: BOMEntry[]
  ): { validRows: BOMEntry[]; errors: CSVValidationError[] } {
    const validRows: BOMEntry[] = [];
    const errors: CSVValidationError[] = [];

    csvData.forEach((row, index) => {
      try {
        // Clean and map CSV fields
        const mappedRow = {
          id: row.id?.toString(),
          item_id: row.item_id?.toString().trim(),
          component_id: row.component_id?.toString().trim(),
          quantity: Number(row.quantity),
          created_by: row.created_by || 'system_user',
          last_updated_by: row.last_updated_by || 'system_user',
          createdAt: row.createdAt || new Date().toISOString(),
          updatedAt: row.updatedAt || new Date().toISOString(),
        };

        // Skip empty rows
        if (!mappedRow.item_id && !mappedRow.component_id && !mappedRow.quantity) {
          return;
        }

        // Validate basic structure
        const validatedRow = csvBOMSchema.parse(mappedRow);

        // Find referenced items
        const item = existingItems.find(i => i.id === validatedRow.item_id);
        const component = existingItems.find(i => i.id === validatedRow.component_id);

        // Additional business validations
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

        // Create new BOM entry
        const newBOMEntry: BOMEntry = {
          ...validatedRow,
          created_by: validatedRow.created_by || 'system_user',
          last_updated_by: validatedRow.last_updated_by || 'system_user',
          createdAt: validatedRow.createdAt || new Date().toISOString(),
          updatedAt: validatedRow.updatedAt || new Date().toISOString(),
        };

        validRows.push(newBOMEntry);
      } catch (error) {
        let errorMessage = 'Invalid row data';
        
        if (error instanceof z.ZodError) {
          errorMessage = error.errors.map(e => 
            `${e.path.join('.')}: ${e.message}`
          ).join(', ');
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        errors.push({
          row: index + 2,
          message: errorMessage,
          data: row
        });
      }
    });

    return { validRows, errors };
  }

  static generateTemplateCSV(): string {
    const headers = ['id', 'item_id', 'component_id', 'quantity', 'created_by', 'last_updated_by', 'createdAt', 'updatedAt'];
    const sampleRow = ['1', '1', '2', '10', 'system_user', 'system_user', '2024-02-01T12:00:00Z', '2024-02-01T12:00:00Z'];
    
    return [
      headers.join(','),
      sampleRow.join(',')
    ].join('\n');
  }
} 