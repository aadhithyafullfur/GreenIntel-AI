export interface ExtractedData {
  [key: string]: string | number | null;
}

export interface ComplianceCheck {
  metric: string;
  value: string | number | null;
  status: 'Compliant' | 'Non-Compliant' | 'Partially Compliant' | 'Excellent';
  reason: string;
  score?: number;
}

export interface ReportData {
  filename: string;
  document_type: string;
  confidence: number;
  extracted_data: ExtractedData;
  generated_report?: string;
  compliance_status?: string;
  compliance_score?: number;
  overall_status?: 'Compliant' | 'Non-Compliant' | 'Partially Compliant' | 'Excellent';
  checks?: ComplianceCheck[];
  recommendations?: string[];
  passed_checks?: number;
  failed_checks?: number;
  partial_checks?: number;
}

export interface ClassificationResult extends ReportData { }

export interface UploadedDocument {
  id: string;
  file: File;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: ClassificationResult;
}
