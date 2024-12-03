'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CSVError } from '@/types/csv';
import { downloadCSV, generateErrorReport } from '@/utils/csv';

interface CSVUploadProps {
  onUpload: (file: File) => Promise<void>;
  onDownloadTemplate?: () => void;
  templateName?: string;
}

export function CSVUpload({
  onUpload,
  onDownloadTemplate,
  templateName = 'Download Template',
}: CSVUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<CSVError[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setErrors([]);
      await onUpload(file);
    } catch (error) {
      if (error instanceof Error) {
        setErrors([{ row: 0, message: error.message }]);
      }
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDownloadErrors = () => {
    if (errors.length > 0) {
      downloadCSV('error-report.csv', generateErrorReport(errors));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {onDownloadTemplate && (
          <Button onClick={onDownloadTemplate} variant="outline">
            {templateName}
          </Button>
        )}
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
      {errors.length > 0 && (
        <div className="space-y-2">
          <Alert variant="destructive">
            <AlertDescription>
              {errors.length} error(s) found in CSV file.
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
