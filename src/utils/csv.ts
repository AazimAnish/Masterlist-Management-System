import Papa from 'papaparse';
import { CSVError, CSVParseResult } from '@/types/csv';

export function downloadCSV(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export async function parseCSV<T>(file: File): Promise<CSVParseResult<T>> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim().toLowerCase(),
            complete: (results) => {
                const errors: CSVError[] = [];

                // Add parsing errors
                results.errors.forEach((error) => {
                    errors.push({
                        row: (error.row ?? 0) + 2, // Add 2 for header and 0-based index
                        message: error.message,
                    });
                });

                // Check for missing required headers
                if (results.meta.fields?.length === 0) {
                    errors.push({
                        row: 1,
                        message: 'No headers found in CSV file',
                    });
                }

                resolve({
                    data: results.data as T[],
                    errors,
                });
            },
            error: (error) => {
                reject(new Error(`Failed to parse CSV: ${error.message}`));
            },
        });
    });
}

export function validateHeaders(headers: string[]): CSVError[] {
    const errors: CSVError[] = [];
    
    if (headers.length === 0) {
        errors.push({
            row: 1,
            message: 'No headers found in CSV file',
        });
    }

    // Check for duplicate headers
    const duplicates = headers.filter(
        (header, index) => headers.indexOf(header) !== index
    );

    if (duplicates.length > 0) {
        errors.push({
            row: 1,
            message: `Duplicate headers found: ${duplicates.join(', ')}`,
        });
    }

    return errors;
}

export function generateErrorReport(errors: CSVError[]): string {
    const headers = ['Row', 'Field', 'Error', 'Suggestion'];
    const rows = errors.map(error => [
        (error.row || '').toString(),
        error.field || '',
        error.message,
        error.suggestion || ''
    ]);
    
    return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
}