'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CSVError } from '@/types/csv';
import { downloadCSV } from '@/utils/csv';
import { CSVValidationService } from '@/services/csv-validation.service';

interface CSVUploadProps {
  onUpload: (file: File) => Promise<{ success: number; errors?: CSVError[] }>;
  type: 'items' | 'bom';
  isUploading?: boolean;
}

export function CSVUpload({
  onUpload,
  type,
  isUploading = false,
}: CSVUploadProps) {
  const [errors, setErrors] = useState<CSVError[]>([]);
  const [successCount, setSuccessCount] = useState<number>(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrors([]);
      const result = await onUpload(file);
      if (result.errors?.length) {
        setErrors(result.errors);
      }
      setSuccessCount(result.success);
    } catch (error) {
      if (error instanceof Error) {
        setErrors([{ row: 0, message: error.message }]);
      }
    } finally {
      e.target.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const template = type === 'items' 
      ? CSVValidationService.generateItemTemplate()
      : CSVValidationService.generateBOMTemplate();
    
    downloadCSV(`${type}-template.csv`, template);
  };

  const handleDownloadErrors = () => {
    if (errors.length > 0) {
      const errorReport = CSVValidationService.generateErrorReport(errors);
      downloadCSV(`${type}-error-report.csv`, errorReport);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button onClick={handleDownloadTemplate} variant="outline">
          Download Template
        </Button>
      </div>
      <div className="flex gap-4">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {isUploading && <span>Uploading...</span>}
      </div>
      {successCount > 0 && (
        <Alert>
          <AlertDescription>
            Successfully uploaded {successCount} {type}.
          </AlertDescription>
        </Alert>
      )}
      {errors.length > 0 && (
        <div className="space-y-2">
          <Alert variant="destructive">
            <AlertDescription>
              {errors.length} error(s) found in CSV file.
              {successCount > 0 && ` ${successCount} records were uploaded successfully.`}
            </AlertDescription>
          </Alert>
          <Button onClick={handleDownloadErrors} variant="outline" size="sm">
            Download Error Report
          </Button>
        </div>
      )}
    </div>
  );
}
