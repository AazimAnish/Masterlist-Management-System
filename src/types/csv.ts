export interface CSVError {
  row?: number;
  message: string;
  rowIndex?: number;
  field?: string;
  value?: string;
  suggestion?: string;
}

export interface CSVUploadResponse<T> {
  errors?: CSVError[];
  data?: T[];
}

export interface CSVParseResult<T> {
  data: T[];
  errors: CSVError[];
  
}

export interface CSVRow {
  [key: string]: string | undefined;
}
