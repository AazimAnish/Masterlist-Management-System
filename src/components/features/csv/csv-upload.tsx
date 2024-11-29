'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CSVUploadState, CSVError } from '@/types/csv';
import { Upload, Download, AlertCircle } from 'lucide-react';

interface CSVUploadProps {
  onUpload: (file: File) => Promise<void>;
  onDownloadTemplate: () => void;
  onDownloadErrors?: (errors: CSVError[]) => void;
  accept?: string;
  templateName: string;

}

export function CSVUpload({
  onUpload,
  onDownloadTemplate,
  onDownloadErrors,
  accept = '.csv',
  templateName,
}: CSVUploadProps) {
  const [state, setState] = useState<CSVUploadState>({
    isUploading: false,
    progress: 0,
    errors: undefined,
    success: undefined,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setState({ ...state, isUploading: true, progress: 0 });
      await onUpload(file);
      setState({ ...state, isUploading: false, progress: 100, success: true });
    } catch (error) {
      if (error instanceof Error) {
        setState({
          ...state,
          isUploading: false,
          progress: 0,
          success: false,
          errors: (error as any).errors,
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => onDownloadTemplate()}
          className="space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Download Template</span>
        </Button>

        <Button
          onClick={() => fileInputRef.current?.click()}
          className="space-x-2"
          disabled={state.isUploading}
        >
          <Upload className="h-4 w-4" />
          <span>{state.isUploading ? 'Uploading...' : 'Upload CSV'}</span>
        </Button>

        {state.errors && state.errors.length > 0 && onDownloadErrors && (
          <Button
            variant="outline"
            onClick={() => onDownloadErrors(state.errors!)}
            className="space-x-2 text-red-600"
          >
            <Download className="h-4 w-4" />
            <span>Download Errors</span>
          </Button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={handleFileSelect}
      />

      {state.isUploading && (
        <Progress value={state.progress} className="w-full" />
      )}

      {state.errors && state.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload Failed</AlertTitle>
          <AlertDescription>
            {state.errors.length} errors found. Please download the error report,
            fix the issues, and try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
