import { z } from 'zod';
import { CSVError } from '@/types/csv';
import { itemSchema } from '@/validations/item.schema';
import { bomSchema } from '@/validations/bom.schema';

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
