import Papa, { ParseError } from 'papaparse';
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

export function parseCSV<T>(file: File): Promise<CSVParseResult<T>> {
  return new Promise((resolve, reject) => {
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