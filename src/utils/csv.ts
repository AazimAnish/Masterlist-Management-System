import Papa, { ParseError } from 'papaparse';
import { read, utils } from 'xlsx-js-style';
import { CSVError, CSVParseResult } from '@/types/csv';

export const CSV_HEADERS = [
  'internal_item_name',
  'type',
  'uom',
  'description'
];

export function generateCSVTemplate(): string {
  return CSV_HEADERS.join(',') + '\n';
}

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function parseCSV<T>(file: File): Promise<CSVParseResult<T>> {
  return new Promise((resolve, reject) => {
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = utils.sheet_to_json(firstSheet);

          // Transform Excel data to match Item interface
          const transformedData = jsonData.map((row: any) => ({
            id: row.id?.toString() || crypto.randomUUID(),
            internal_item_name: row.internal_item_name,
            tenant_id: Number(row.tenant_id) || 1,
            item_description: row.item_description || '',
            type: row.type,
            uom: row.uom,
            min_buffer: Number(row.min_buffer) || 0,
            max_buffer: Number(row.max_buffer) || 0,
            created_by: row.created_by || 'system_user',
            last_updated_by: row.last_updated_by || 'system_user',
            is_deleted: row.is_deleted === 'TRUE' ? true : false,
            createdAt: row.createdAt || new Date().toISOString(),
            updatedAt: row.updatedAt || new Date().toISOString(),
            additional_attributes: {
              avg_weight_needed: row.additional_attributes__avg_weight_needed === 'TRUE' ? true : false,
              scrap_type: row.additional_attributes__scrap_type || '',
            },
          }));

          resolve({
            data: transformedData as T[],
            errors: []
          });
        } catch (error) {
          console.error('Excel parsing error:', error);
          reject(new Error('Failed to parse Excel file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsBinaryString(file);
    } else {
      // Handle CSV files with existing Papa Parse logic
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const errors: CSVError[] = results.errors.map((err: ParseError) => ({
            row: err.row !== undefined ? err.row + 1 : 0,
            message: err.message || 'Unknown error'
          }));

          resolve({
            data: results.data as T[],
            errors
          });
        },
        error: (error) => {
          reject(new Error(error.message));
        }
      });
    }
  });
}

export function generateErrorReport(errors: CSVError[]): string {
  const errorRows = errors.map(error => ({
    Row: error.row,
    Error: error.message
  }));
  
  return Papa.unparse(errorRows);
}

// Helper function to validate CSV headers
export function validateHeaders(headers: string[]): CSVError[] {
  const errors: CSVError[] = [];
  const requiredHeaders = new Set(CSV_HEADERS);
  
  headers.forEach((header, index) => {
    if (!requiredHeaders.has(header)) {
      errors.push({
        row: 1, // Header row
        message: `Invalid header: ${header}`
      });
    }
  });
  
  CSV_HEADERS.forEach(required => {
    if (!headers.includes(required)) {
      errors.push({
        row: 1,
        message: `Missing required header: ${required}`
      });
    }
  });
  
  return errors;
}