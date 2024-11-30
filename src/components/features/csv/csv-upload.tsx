'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface CSVUploadProps {
  onUpload: (file: File) => Promise<void>;
  onDownloadTemplate?: () => void;
  onDownloadErrors?: () => void;
  accept?: string;
  templateName?: string;
}

export function CSVUpload({
  onUpload,
  onDownloadTemplate,
  onDownloadErrors,
  accept = '.csv',
  templateName = 'Download Template',
}: CSVUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await onUpload(file);
    } finally {
      setIsUploading(false);
      e.target.value = '';
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
        {onDownloadErrors && (
          <Button onClick={onDownloadErrors} variant="outline">
            Download Errors
          </Button>
        )}
      </div>
      <div className="flex gap-4">
        <Input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
    </div>
  );
}
