import Papa, { ParseResult, ParseLocalConfig } from 'papaparse';
import { CSVError } from '@/types/csv';

export async function parseCSV<T>(file: File): Promise<T[]> {
  // Validate file type
  if (!file.type && !file.name.endsWith('.csv')) {
    throw new Error('Invalid file type. Please upload a CSV file.');
  }

  // Validate file size (e.g., 10MB limit)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size too large. Please upload a file smaller than 10MB.');
  }

  return new Promise<T[]>((resolve, reject) => {
    const config: ParseLocalConfig<T, File> = {
      header: true,
      skipEmptyLines: 'greedy', // Skip empty lines more aggressively
      transformHeader: (header: string) => header.trim().toLowerCase(), // Normalize headers
      transform: (value: string) => value.trim(), // Trim cell values
      complete: (results: ParseResult<T>, file: File) => {
        if (results.errors.length > 0) {
          reject(new Error(results.errors.map(err => err.message).join(', ')));
        } else if (results.data.length === 0) {
          reject(new Error('The CSV file is empty.'));
        } else {
          resolve(results.data);
        }
      },
      error: (error: Error, file: File) => {
        reject(error);
      }
    };

    Papa.parse<T>(file, config);
  });
}

export function downloadCSV(data: any[], headers: string[], filename: string) {
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]?.toString() ?? '';
        return value.includes(',') ? `"${value}"` : value;
      }).join(',')
    )
  ];
  
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateErrorReport(errors: CSVError[]) {
  return errors.map(error => ({
    Row: error.rowIndex + 1,
    Field: error.field,
    Value: error.value,
    Error: error.message,
    Suggestion: error.suggestion || '',
  }));
}