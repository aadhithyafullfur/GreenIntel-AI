export interface ClassificationResult {
  filename: string;
  document_type: string;
  confidence: number;
  extracted_data?: Record<string, string | null>;
}

export interface UploadedDocument {
  id: string;
  file: File;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: ClassificationResult;
}
