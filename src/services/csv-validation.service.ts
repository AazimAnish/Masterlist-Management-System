import { z } from 'zod';
import { Item } from '@/types/item';
import { BOMEntry, CSVValidationError } from '@/types/bom';

// CSV Row Schema with strict typing
const csvBOMSchema = z.object({
  item_id: z.string().min(1, 'Item ID is required'),
  component_id: z.string().min(1, 'Component ID is required'),
  quantity: z.coerce
    .number()
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity must not exceed 100'),
});

type CSVBOMRow = z.infer<typeof csvBOMSchema>;

export class CSVValidationService {
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

        // If all validations pass, create a new BOM entry
        const newBOMEntry: BOMEntry = {
          item_id: validatedRow.item_id,
          component_id: validatedRow.component_id,
          quantity: validatedRow.quantity,
          uom: 'Nos',
          scrap_percentage: 0,
          notes: '',
          created_by: 'system_user',
          last_updated_by: 'system_user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          is_active: true
        };

        validRows.push(newBOMEntry);
      } catch (error) {
        errors.push({
          row: index + 2, // Add 2 to account for header row and 0-based index
          message: error instanceof Error ? error.message : 'Invalid row data',
          data: row
        });
      }
    });

    return { validRows, errors };
  }

  static generateErrorReport(errors: CSVValidationError[]): string {
    return errors.map(error => 
      `Row ${error.row}: ${error.message}\nData: ${JSON.stringify(error.data)}`
    ).join('\n\n');
  }

  static validatePendingItems(items: Item[]): Item[] {
    return items.filter(item => {
      if (item.type === 'sell' && !item.components?.length) {
        return true;
      }
      if (item.type === 'purchase' && !item.usedIn?.length) {
        return true;
      }
      if (item.type === 'component' && 
          (!item.components?.length || !item.usedIn?.length)) {
        return true;
      }
      return false;
    });
  }
}
