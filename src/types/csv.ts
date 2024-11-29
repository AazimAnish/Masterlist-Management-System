export interface CSVError {
  rowIndex: number;
  field: string;
  value: string;
  message: string;
  suggestion?: string;
}

export interface CSVUploadResponse<T> {
  success: boolean;
  data?: T[];
  errors?: CSVError[];
  totalRows: number;
  successRows: number;
  failedRows: number;
}

export interface CSVUploadState {
  isUploading: boolean;
  progress: number;
  errors?: CSVError[];
  success?: boolean;
}
