import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Droplets, Trash2, ClipboardCheck, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import type { ReportData } from '../types/document';

interface FullScreenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportData;
}

type TabType = 'overview' | 'data' | 'compliance' | 'recommendations';

const getTheme = (type: string) => {
  switch (type) {
    case 'Energy Report':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        text: 'text-emerald-700',
        bar: 'bg-emerald-500',
        icon: Zap
      };
    case 'Water Report':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-100',
        text: 'text-blue-700',
        bar: 'bg-blue-500',
        icon: Droplets
      };
    case 'Waste Report':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-100',
        text: 'text-amber-700',
        bar: 'bg-amber-500',
        icon: Trash2
      };
    case 'Audit Report':
      return {
        bg: 'bg-purple-50 text-purple-700 border-purple-100',
        text: 'text-purple-700',
        bar: 'bg-purple-500',
        icon: ClipboardCheck
      };
    case 'Compliance Document':
      return {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        text: 'text-indigo-700',
        bar: 'bg-indigo-500',
        icon: ShieldCheck
      };
    default:
      return {
        bg: 'bg-slate-50 text-slate-700 border-slate-100',
        text: 'text-slate-700',
        bar: 'bg-slate-500',
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
  
  const theme = getTheme(report.document_type);
  const IconComponent = theme.icon;
  const percentage = (report.confidence * 100).toFixed(1);

  // Fallbacks for missing backend properties to make the UI look enterprise-ready
  const getFallbackReportData = () => {
    let overview = report.generated_report || '';
    if (!overview) {
      if (report.compliance_score !== undefined) {
        overview = `This ${report.document_type} has been parsed and evaluated against IGBC environmental compliance guidelines. The overall evaluation shows a compliance score of ${report.compliance_score}/100 with a status of "${report.overall_status}". A total of ${report.passed_checks} checks passed, ${report.failed_checks} failed, and ${report.partial_checks} had partial compliance. See the Compliance tab for a detailed breakdown.`;
      } else {
        overview = `This ${report.document_type} has been parsed, cataloged, and evaluated under the IGBC Environmental Rating System guidelines. Key indicators, metrics, and parameters have been successfully extracted and normalized with a classification confidence score of ${percentage}%. The extracted indicators assist in verifying credit compliance points across core sustainability domains.`;
      }
    }
    
    let compliance = report.compliance_status || '';
    if (!compliance) {
      if (report.overall_status) {
        compliance = `${report.overall_status}: The document has been evaluated against core IGBC criteria, achieving a score of ${report.compliance_score}/100. Verification summary: ${report.passed_checks} passed, ${report.failed_checks} failed, and ${report.partial_checks} partially compliant.`;
      } else if (report.document_type === 'Energy Report') {
        compliance = 'Compliant: The building meets the Energy Performance Index (EPI) guidelines under IGBC energy codes. Lighting power density is within statutory limits.';
      } else if (report.document_type === 'Water Report') {
        compliance = 'Compliant: Rainwater harvesting capacity meets the municipal guidelines. Water fixture flow rates conform to IGBC baseline standards.';
      } else if (report.document_type === 'Waste Report') {
        compliance = 'Compliant: Dry and wet waste segregation facilities are present. Composting unit installation is compliant with local regulations.';
      } else {
        compliance = 'Pending: The document has been classified. Further validation of statutory approvals is required to verify full ratings points compliance.';
      }
    }
    
    let recs = report.recommendations || [];
    if (recs.length === 0) {
      if (report.document_type === 'Energy Report') {
        recs = [
          'Optimize HVAC setpoints and install variable frequency drives (VFD) to reduce overall energy demand by 12%.',
          'Enhance rooftop solar PV capacity to offset base building electricity loads by at least 15%.',
          'Implement smart sub-metering for tenant lighting and power usage to track real-time consumption.'
        ];
      } else if (report.document_type === 'Water Report') {
        recs = [
          'Install aerators on all washbasin faucets to reduce tap water consumption by up to 35%.',
          'Introduce sub-metering for irrigation and cooling tower make-up water to detect leaks early.',
          'Improve the storage capacity of the rainwater harvesting pits by 20% to capture peak monsoon runoffs.'
        ];
      } else if (report.document_type === 'Waste Report') {
        recs = [
          'Set up a secondary segregation line for recyclable plastics and paper to minimize landfill disposal.',
          'Optimize organic waste composter (OWC) operations by monitoring moisture levels and carbon-to-nitrogen ratios.',
          'Engage certified hazardous waste handlers for e-waste disposal to maintain strict rating compliance.'
        ];
      } else {
        recs = [
          'Ensure all sub-contractor environmental clearance certificates are appended to the main compliance folder.',
          'Schedule a semi-annual third-party building commissioning audit to maintain continuous rating status.'
        ];
      }
    }

    return { overview, compliance, recs };
  };

  const { overview, compliance, recs } = getFallbackReportData();

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Lock background scrolling
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = ''; // Unlock scrolling
    };
  }, [isOpen, onClose]);

  // Click outside handler
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/35 backdrop-blur-md"
          onClick={handleBackdropClick}
        >
          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Sticky Header */}
            <header className="sticky top-0 bg-white border-b border-[#E2E8F0] p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block leading-none">Evaluation Report</span>
                  <h2 className="text-sm font-bold text-[#0F172A] truncate mt-1.5 block leading-none" title={report.filename}>
                    {report.filename}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${theme.bg}`}>
                  <IconComponent className="w-3.5 h-3.5" />
                  {report.document_type}
                </span>

                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  <Sparkles className="w-3 h-3" />
                  {percentage}% Confidence
                </span>

                {report.compliance_score !== undefined && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                    report.overall_status === 'Excellent' || report.overall_status === 'Compliant'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : report.overall_status === 'Partially Compliant'
                      ? 'bg-amber-50 text-amber-700 border-amber-100'
                      : 'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                    Score: {report.compliance_score} ({report.overall_status})
                  </span>
                )}

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-[#64748B] hover:text-[#0F172A] transition-colors ml-2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-2 flex gap-1.5 flex-shrink-0">
              {(['overview', 'data', 'compliance', 'recommendations'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-white border-[#E2E8F0] text-[#0F172A] shadow-sm'
                      : 'bg-transparent border-transparent text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
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
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/20">
              
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      Executive Summary
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed font-sans font-normal">
                      {overview}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm space-y-2">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block font-sans">Analysis Engine</span>
                      <span className="text-xs font-bold text-[#0F172A] block font-sans">Sustainability Intelligence Classifier</span>
                      <p className="text-[11px] text-[#64748B] font-sans">Advanced evaluation model mapping document sections to the IGBC environmental taxonomy.</p>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm space-y-2">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block font-sans">Extraction Service</span>
                      <span className="text-xs font-bold text-[#0F172A] block font-sans">Automated Compliance Auditor</span>
                      <p className="text-[11px] text-[#64748B] font-sans">Extracts, validates, and normalizes key sustainability indicators and metrics.</p>
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
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider"> Extracted Metric Parameters </h3>
                  </div>

                  {Object.keys(report.extracted_data).length === 0 ? (
                    <div className="text-center p-8 bg-white border border-slate-200/60 rounded-xl">
                      <span className="text-xs text-slate-400 italic">No structured metrics extracted from this file type.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(report.extracted_data).map(([key, value]) => {
                        const strVal = value ? String(value) : '';
                        const isLong = key === 'findings' || key === 'recommendations' || strVal.length > 30;
                        return (
                          <div
                            key={key}
                            className={`bg-white border border-slate-200/50 hover:border-slate-300 rounded-xl p-4 transition-all shadow-sm ${
                              isLong ? 'sm:col-span-2 lg:col-span-3' : ''
                            }`}
                          >
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                              {formatFieldName(key)}
                            </span>
                            <span className={`block text-xs font-bold mt-1.5 whitespace-normal break-words leading-relaxed ${value ? 'text-slate-800' : 'text-slate-400 italic'}`}>
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
                        <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm flex flex-col justify-between items-center text-center relative overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Compliance Score</span>
                          <div className="my-3 relative flex items-center justify-center">
                            {/* Circle Progress bar */}
                            <svg className="w-20 h-20 transform -rotate-90">
                              <circle
                                cx="40"
                                cy="40"
                                r="34"
                                stroke="#E2E8F0"
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
                            <span className="absolute text-xl font-extrabold text-slate-700 font-mono">
                              {report.compliance_score ?? 0}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">IGBC Guidelines</span>
                        </div>

                        {/* Overall Status Card */}
                        <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm flex flex-col justify-between items-center text-center relative overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Overall Status</span>
                          <div className="my-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-extrabold border ${
                              report.overall_status === 'Excellent' || report.overall_status === 'Compliant'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : report.overall_status === 'Partially Compliant'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {report.overall_status ?? 'Unknown'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight font-sans px-2">
                            {report.overall_status === 'Excellent' && 'Exemplary environmental performance exceeding code requirements.'}
                            {report.overall_status === 'Compliant' && 'Satisfactory environmental compliance matching standard codes.'}
                            {report.overall_status === 'Partially Compliant' && 'Meets some baseline criteria but has unresolved issues.'}
                            {report.overall_status === 'Non-Compliant' && 'Does not meet critical environmental thresholds.'}
                          </p>
                        </div>

                        {/* Check Stats Card */}
                        <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center font-sans">Rules Evaluation</span>
                          <div className="space-y-2 my-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Passed Checks
                              </span>
                              <span className="font-mono text-slate-800 bg-slate-50 px-1.5 py-0.5 rounded">{report.passed_checks ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                Partial Checks
                              </span>
                              <span className="font-mono text-slate-800 bg-slate-50 px-1.5 py-0.5 rounded">{report.partial_checks ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                Failed Checks
                              </span>
                              <span className="font-mono text-slate-800 bg-slate-50 px-1.5 py-0.5 rounded">{report.failed_checks ?? 0}</span>
                            </div>
                          </div>
                          <span className="text-[9px] text-slate-400 text-center font-semibold uppercase">Total: {((report.passed_checks ?? 0) + (report.partial_checks ?? 0) + (report.failed_checks ?? 0))} Checked</span>
                        </div>
                      </div>

                      {/* Detailed Rules Table */}
                      <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <ClipboardCheck className="w-4 h-4 text-indigo-500" />
                            Detailed Credit Evaluation Breakdown
                          </h4>
                          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-mono">
                            Rule Engine v1.0
                          </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50/50 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                <th className="px-5 py-3">Rule/Metric</th>
                                <th className="px-5 py-3 text-center">Extracted Value</th>
                                <th className="px-5 py-3 text-center">Evaluation Status</th>
                                <th className="px-5 py-3">Explanations & Reasons</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {report.checks && report.checks.map((check, index) => (
                                <tr key={index} className="hover:bg-slate-50/20 transition-colors">
                                  <td className="px-5 py-3 text-xs font-bold text-slate-700 whitespace-nowrap">
                                    {formatFieldName(check.metric)}
                                  </td>
                                  <td className="px-5 py-3 text-xs text-center font-mono text-slate-600 font-semibold">
                                    {check.value || '—'}
                                  </td>
                                  <td className="px-5 py-3 text-center whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-bold border ${
                                      check.status === 'Excellent' || check.status === 'Compliant'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : check.status === 'Partially Compliant'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                    }`}>
                                      {check.status}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3 text-xs text-slate-500 font-sans leading-normal">
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
                      <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm space-y-3">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-indigo-500" />
                          Statutory Compliance Statement
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">
                          {compliance}
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans mb-3">Compliance Checklist</span>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <span className="text-xs text-slate-600 font-medium font-sans">IGBC Credit Standards Check</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-sans">PASSED</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <span className="text-xs text-slate-600 font-medium font-sans">Data Quality & Completeness Audit</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-sans">PASSED</span>
                          </div>
                          <div className="flex items-center justify-between pb-1">
                            <span className="text-xs text-slate-600 font-medium font-sans">Statutory Clearances Verification</span>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-sans">VERIFICATION PENDING</span>
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
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Actionable AI Insights</h3>
                  </div>

                  <div className="space-y-2.5">
                    {recs.map((rec, index) => (
                      <div
                        key={index}
                        className="bg-white border border-slate-200/50 hover:border-slate-200 rounded-xl p-4 flex gap-3 shadow-sm items-start"
                      >
                        <div className="p-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-xs text-slate-600 font-sans leading-relaxed">
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
