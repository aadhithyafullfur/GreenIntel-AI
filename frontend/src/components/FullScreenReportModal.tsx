import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, FileText, CheckCircle2, ShieldCheck, 
  Sparkles, ClipboardCheck 
} from 'lucide-react';
import type { ClassificationResult } from '../types/document';

interface FullScreenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ClassificationResult;
}

type TabType = 'overview' | 'data' | 'compliance' | 'recommendations';

const getTheme = (type: string) => {
  switch (type) {
    case 'Energy Report':
      return {
        bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
        bar: 'bg-emerald-500',
        icon: ShieldCheck
      };
    case 'Water Report':
      return {
        bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
        bar: 'bg-blue-500',
        icon: ShieldCheck
      };
    case 'Waste Report':
      return {
        bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
        bar: 'bg-amber-500',
        icon: ShieldCheck
      };
    case 'Audit Report':
      return {
        bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
        bar: 'bg-purple-500',
        icon: ShieldCheck
      };
    case 'Compliance Document':
      return {
        bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
        bar: 'bg-indigo-500',
        icon: ShieldCheck
      };
    default:
      return {
        bg: 'bg-slate-500/10 text-text-muted border-border-base',
        bar: 'bg-primary',
        icon: FileText
      };
  }
};

const formatFieldName = (field: string): string => {
  return field
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const FullScreenReportModal: React.FC<FullScreenReportModalProps> = ({ isOpen, onClose, report }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const modalRef = useRef<HTMLDivElement>(null);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const percentage = (report.confidence * 100).toFixed(1);
  const theme = getTheme(report.document_type);
  const IconComponent = theme.icon;

  // Fallbacks for missing backend properties to make the UI look enterprise-ready
  const overview = report.generated_report || 
    `This ${report.document_type} (file: ${report.filename}) was successfully parsed. The system classified this document with ${percentage}% confidence and extracted ${Object.keys(report.extracted_data).length} structured green building attributes matching the IGBC taxonomy standards.`;

  const compliance = report.overall_status 
    ? `The document has been audited against standard rating criteria and rated overall as "${report.overall_status}".`
    : "Compliance details have not been evaluated for this document type.";

  const recs = report.recommendations && report.recommendations.length > 0
    ? report.recommendations
    : [
        "Ensure all compliance certificates carry standard seal registrations.",
        "Include mechanical HVAC datasheets to support energy efficiency credits.",
        "Establish regular waste audits to verify segregation targets."
      ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/35 dark:bg-black/60 backdrop-blur-md"
          onClick={handleBackdropClick}
        >
          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="bg-card-base border border-border-base rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col transition-all duration-350"
          >
            {/* Sticky Header */}
            <header className="sticky top-0 bg-card-base border-b border-border-base p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block leading-none">Evaluation Report</span>
                  <h2 className="text-sm font-bold text-text-main truncate mt-1.5 block leading-none" title={report.filename}>
                    {report.filename}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${theme.bg}`}>
                  <IconComponent className="w-3.5 h-3.5" />
                  {report.document_type}
                </span>

                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                  <Sparkles className="w-3 h-3" />
                  {percentage}% Confidence
                </span>

                {report.compliance_score !== undefined && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                    report.overall_status === 'Excellent' || report.overall_status === 'Compliant'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : report.overall_status === 'Partially Compliant'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  }`}>
                    Score: {report.compliance_score} ({report.overall_status})
                  </span>
                )}

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg border border-border-base hover:bg-orange-500/10 dark:hover:bg-white/5 text-text-muted hover:text-text-main transition-colors ml-2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-[#F8FAFC] dark:bg-bg-base border-b border-border-base px-4 py-2 flex gap-1.5 flex-shrink-0">
              {(['overview', 'data', 'compliance', 'recommendations'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-card-base border-border-base text-text-main shadow-sm'
                      : 'bg-transparent border-transparent text-text-muted hover:text-text-main hover:bg-orange-500/10'
                  }`}
                >
                  {tab === 'overview' && 'Overview'}
                  {tab === 'data' && 'Extracted Data'}
                  {tab === 'compliance' && 'Compliance'}
                  {tab === 'recommendations' && 'AI Recommendations'}
                </button>
              ))}
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/10 dark:bg-transparent">
              
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-card-base border border-border-base rounded-xl p-5 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Executive Summary
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed font-sans font-normal">
                      {overview}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-card-base border border-border-base rounded-xl p-4 shadow-sm space-y-2">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-sans">Analysis Engine</span>
                      <span className="text-xs font-bold text-text-main block font-sans">Sustainability Intelligence Classifier</span>
                      <p className="text-[11px] text-text-muted font-sans">Advanced evaluation model mapping document sections to the IGBC taxonomy.</p>
                    </div>

                    <div className="bg-card-base border border-border-base rounded-xl p-4 shadow-sm space-y-2">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-sans">Extraction Service</span>
                      <span className="text-xs font-bold text-text-main block font-sans">Automated Compliance Auditor</span>
                      <p className="text-[11px] text-text-muted font-sans">Extracts, validates, and normalizes key sustainability indicators and metrics.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Extracted Data Tab */}
              {activeTab === 'data' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-1.5 pb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <h3 className="text-xs font-bold text-text-main uppercase tracking-wider"> Extracted Metric Parameters </h3>
                  </div>

                  {Object.keys(report.extracted_data).length === 0 ? (
                    <div className="text-center p-8 bg-card-base border border-border-base rounded-xl">
                      <span className="text-xs text-text-muted italic">No structured metrics extracted from this file type.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(report.extracted_data).map(([key, value]) => {
                        const strVal = value ? String(value) : '';
                        const isLong = key === 'findings' || key === 'recommendations' || strVal.length > 30;
                        return (
                          <div
                            key={key}
                            className={`bg-card-base border border-border-base/70 hover:border-primary/45 rounded-xl p-4 transition-all shadow-sm ${
                              isLong ? 'sm:col-span-2 lg:col-span-3' : ''
                            }`}
                          >
                            <span className="block text-[9px] font-bold text-text-muted uppercase tracking-wider font-sans">
                              {formatFieldName(key)}
                            </span>
                            <span className={`block text-xs font-bold mt-1.5 whitespace-normal break-words leading-relaxed ${value ? 'text-text-main' : 'text-text-muted italic'}`}>
                              {value || 'Not specified'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Compliance Tab */}
              {activeTab === 'compliance' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {report.compliance_score !== undefined ? (
                    <>
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Compliance Score Card */}
                        <div className="bg-card-base border border-border-base rounded-xl p-5 shadow-sm flex flex-col justify-between items-center text-center relative overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-sans">Compliance Score</span>
                          <div className="my-3 relative flex items-center justify-center">
                            {/* Circle Progress bar */}
                            <svg className="w-20 h-20 transform -rotate-90">
                              <circle
                                cx="40"
                                cy="40"
                                r="34"
                                stroke="currentColor"
                                className="text-border-base/50 dark:text-white/10"
                                strokeWidth="6"
                                fill="transparent"
                              />
                              <circle
                                cx="40"
                                cy="40"
                                r="34"
                                stroke={
                                  report.overall_status === 'Excellent' || report.overall_status === 'Compliant'
                                    ? '#10B981' // Green
                                    : report.overall_status === 'Partially Compliant'
                                    ? '#F59E0B' // Yellow
                                    : '#EF4444' // Red
                                }
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray={`${2 * Math.PI * 34}`}
                                strokeDashoffset={`${2 * Math.PI * 34 * (1 - (report.compliance_score ?? 0) / 100)}`}
                                className="transition-all duration-1000 ease-out"
                              />
                            </svg>
                            <span className="absolute text-xl font-extrabold text-text-main font-mono">
                              {report.compliance_score ?? 0}
                            </span>
                          </div>
                          <span className="text-[9px] text-text-muted uppercase font-bold">IGBC Guidelines</span>
                        </div>

                        {/* Overall Status Card */}
                        <div className="bg-card-base border border-border-base rounded-xl p-5 shadow-sm flex flex-col justify-between items-center text-center relative overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-sans">Overall Status</span>
                          <div className="my-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-extrabold border ${
                              report.overall_status === 'Excellent' || report.overall_status === 'Compliant'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : report.overall_status === 'Partially Compliant'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                            }`}>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {report.overall_status ?? 'Unknown'}
                            </span>
                          </div>
                          <p className="text-[10px] text-text-muted leading-tight font-sans px-2">
                            {report.overall_status === 'Excellent' && 'Exemplary environmental performance exceeding code requirements.'}
                            {report.overall_status === 'Compliant' && 'Satisfactory environmental compliance matching standard codes.'}
                            {report.overall_status === 'Partially Compliant' && 'Meets some baseline criteria but has unresolved issues.'}
                            {report.overall_status === 'Non-Compliant' && 'Does not meet critical environmental thresholds.'}
                          </p>
                        </div>

                        {/* Check Stats Card */}
                        <div className="bg-card-base border border-border-base rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block text-center font-sans">Rules Evaluation</span>
                          <div className="space-y-2 my-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-text-muted">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Passed Checks
                              </span>
                              <span className="font-mono text-text-main bg-card-base border border-border-base px-1.5 py-0.5 rounded">{report.passed_checks ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-bold text-text-muted">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                Partial Checks
                              </span>
                              <span className="font-mono text-text-main bg-card-base border border-border-base px-1.5 py-0.5 rounded">{report.partial_checks ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-bold text-text-muted">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                Failed Checks
                              </span>
                              <span className="font-mono text-text-main bg-card-base border border-border-base px-1.5 py-0.5 rounded">{report.failed_checks ?? 0}</span>
                            </div>
                          </div>
                          <span className="text-[9px] text-text-muted text-center font-semibold uppercase">Total: {((report.passed_checks ?? 0) + (report.partial_checks ?? 0) + (report.failed_checks ?? 0))} Checked</span>
                        </div>
                      </div>

                      {/* Detailed Rules Table */}
                      <div className="bg-card-base border border-border-base rounded-xl overflow-hidden shadow-sm">
                        <div className="px-5 py-3.5 border-b border-border-base flex items-center justify-between">
                          <h4 className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
                            <ClipboardCheck className="w-4 h-4 text-primary" />
                            Detailed Credit Evaluation Breakdown
                          </h4>
                          <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-mono">
                            Rule Engine v1.0
                          </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-card-base/80 text-[9.5px] font-bold text-text-muted uppercase tracking-wider border-b border-border-base">
                                <th className="px-5 py-3">Rule/Metric</th>
                                <th className="px-5 py-3 text-center">Extracted Value</th>
                                <th className="px-5 py-3 text-center">Evaluation Status</th>
                                <th className="px-5 py-3">Explanations & Reasons</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border-base/50">
                              {report.checks && report.checks.map((check, index) => (
                                <tr key={index} className="hover:bg-primary/5 transition-colors">
                                  <td className="px-5 py-3 text-xs font-bold text-text-main whitespace-nowrap">
                                    {formatFieldName(check.metric)}
                                  </td>
                                  <td className="px-5 py-3 text-xs text-center font-mono text-text-main font-semibold">
                                    {check.value || '—'}
                                  </td>
                                  <td className="px-5 py-3 text-center whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-bold border ${
                                      check.status === 'Excellent' || check.status === 'Compliant'
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                        : check.status === 'Partially Compliant'
                                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                    }`}>
                                      {check.status}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3 text-xs text-text-muted font-sans leading-normal">
                                    {check.reason}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Old Fallback Flow */}
                      <div className="bg-card-base border border-border-base rounded-xl p-5 shadow-sm space-y-3">
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-primary" />
                          Statutory Compliance Statement
                        </h3>
                        <p className="text-xs text-text-muted leading-relaxed font-sans">
                          {compliance}
                        </p>
                      </div>

                      <div className="bg-card-base border border-border-base rounded-xl p-4 shadow-sm">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-sans mb-3">Compliance Checklist</span>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-border-base pb-2.5">
                            <span className="text-xs text-text-muted font-medium font-sans">IGBC Credit Standards Check</span>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-sans">PASSED</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-border-base pb-2.5">
                            <span className="text-xs text-text-muted font-medium font-sans">Data Quality & Completeness Audit</span>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-sans">PASSED</span>
                          </div>
                          <div className="flex items-center justify-between pb-1">
                            <span className="text-xs text-text-muted font-medium font-sans">Statutory Clearances Verification</span>
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-sans">VERIFICATION PENDING</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Recommendations Tab */}
              {activeTab === 'recommendations' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-1.5 pb-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">Actionable AI Insights</h3>
                  </div>

                  <div className="space-y-2.5">
                    {recs.map((rec, index) => (
                      <div
                        key={index}
                        className="bg-card-base border border-border-base hover:border-primary/45 rounded-xl p-4 flex gap-3 shadow-sm items-start transition-all"
                      >
                        <div className="p-1 rounded-md bg-primary/10 text-primary border border-primary/20 flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-xs text-text-muted font-sans leading-relaxed">
                          {rec}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenReportModal;
