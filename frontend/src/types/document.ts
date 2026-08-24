export interface ExtractedData {
  [key: string]: string | number | null;
}

export interface ComplianceCheck {
  metric: string;
  key?: string;
  value: string | number | null;
  requirement?: string;
  status: 'Compliant' | 'Non-Compliant' | 'Partially Compliant' | 'Excellent';
  reason: string;
  score?: number;
  section?: string;
  page_number?: number | null;
  evidence_quote?: string;
}

export interface DocumentIssue {
  issue_id: string;
  metric: string;
  current_value: string;
  expected_value: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
  recommended_action: string;
  section?: string;
  page_number?: number | null;
  evidence_quote?: string;
  document_id?: string;
  filename?: string;
  document_type?: string;
}

export interface ReportData {
  _id?: string;
  id?: string;
  project_id?: string;
  filename: string;
  document_type: string;
  confidence: number;
  extracted_data: ExtractedData;
  generated_report?: string;
  compliance_status?: string;
  compliance_score?: number;
  overall_status?: 'Compliant' | 'Non-Compliant' | 'Partially Compliant' | 'Excellent';
  checks?: ComplianceCheck[];
  issues?: DocumentIssue[];
  issues_count?: number;
  critical_issues?: number;
  high_issues?: number;
  medium_issues?: number;
  low_issues?: number;
  recommendations?: string[];
  passed_checks?: number;
  failed_checks?: number;
  partial_checks?: number;
  created_at?: string;
  processing_stage?: string;
}

export type ClassificationResult = ReportData;

export interface UploadedDocument {
  id: string;
  file: File;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: ClassificationResult;
}
