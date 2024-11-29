import { z } from 'zod';
import { CSVError } from '@/types/csv';
import { itemSchema } from '@/validations/item.schema';
import { bomSchema } from '@/validations/bom.schema';
import { Item } from '@/types/item';
import { BOMEntry } from '@/types/bom';

export class CSVValidationService {
  static validateItems(data: any[]): CSVError[] {
    const errors: CSVError[] = [];
    
    data.forEach((row, index) => {
      try {
        itemSchema.parse(row);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            errors.push({
              rowIndex: index,
              field: err.path.join('.'),
              value: row[err.path[0]] || '',
              message: err.message,
              suggestion: this.getSuggestion(err),
            });
          });
        }
      }
    });

    return errors;
  }

  static validateBOM(data: any[], availableItems: Item[]): CSVError[] {
    const errors: CSVError[] = [];
    const processedItems = new Set<string>();
    
    data.forEach((row, index) => {
      try {
        // Basic schema validation
        const validatedRow = bomSchema.parse(row);
        
        // Business rules validation
        const businessErrors = this.validateBOMBusinessRules(
          validatedRow,
          availableItems,
          processedItems
        );
        
        if (businessErrors.length > 0) {
          errors.push(...businessErrors.map(error => ({
            ...error,
            rowIndex: index,
          })));
        } else {
          processedItems.add(validatedRow.item_id);
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            errors.push({
              rowIndex: index,
              field: err.path.join('.'),
              value: row[err.path[0]] || '',
              message: err.message,
              suggestion: this.getSuggestion(err),
            });
          });
        }
      }
    });

    return errors;
  }

  private static validateBOMBusinessRules(
    entry: BOMEntry,
    availableItems: Item[],
    processedItems: Set<string>
  ): CSVError[] {
    const errors: CSVError[] = [];

    // Check if item exists
    const item = availableItems.find(i => i.id === entry.item_id);
    if (!item) {
      errors.push({
        field: 'item_id',
        value: entry.item_id,
        message: 'Item not found',
        suggestion: 'Please use a valid item ID',
        rowIndex: 0, // Will be updated in the calling function
      });
    }

    // Check if component exists
    const component = availableItems.find(i => i.id === entry.component_id);
    if (!component) {
      errors.push({
        field: 'component_id',
        value: entry.component_id,
        message: 'Component not found',
        suggestion: 'Please use a valid component ID',
        rowIndex: 0,
      });
    }

    // Check for self-reference
    if (entry.item_id === entry.component_id) {
      errors.push({
        field: 'component_id',
        value: entry.component_id,
        message: 'Item cannot be its own component',
        suggestion: 'Please use a different component ID',
        rowIndex: 0,
      });
    }

    // Validate quantity based on UoM
    if (component && component.uom !== entry.uom) {
      errors.push({
        field: 'uom',
        value: entry.uom,
        message: 'UoM mismatch with component',
        suggestion: `Please use ${component.uom}`,
        rowIndex: 0,
      });
    }

    // Validate scrap percentage
    if (entry.scrap_percentage && (entry.scrap_percentage < 0 || entry.scrap_percentage > 100)) {
      errors.push({
        field: 'scrap_percentage',
        value: entry.scrap_percentage.toString(),
        message: 'Invalid scrap percentage',
        suggestion: 'Please enter a value between 0 and 100',
        rowIndex: 0,
      });
    }

    return errors;
  }

  private static getSuggestion(error: z.ZodError['errors'][0]): string {
    switch (error.code) {
      case 'invalid_type':
        return `Expected ${error.expected}, got ${error.received}`;
      case 'invalid_enum_value':
        return `Valid options are: ${(error as any).options?.join(', ')}`;
      default:
        return '';
    }
  }
}
