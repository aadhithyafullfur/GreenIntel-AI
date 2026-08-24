import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, FileText, CheckCircle2, ShieldCheck,
  Sparkles, Bookmark, AlertTriangle, MapPin,
  Check, AlertCircle, Layers, Wrench
} from 'lucide-react';
import type { ClassificationResult } from '../types/document';
import api from '../services/api';

interface FullScreenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ClassificationResult;
}

type TabType = 'overview' | 'data' | 'compliance' | 'issues' | 'evidence' | 'recommendations';

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

const getSeverityBadge = (severity: string) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return 'bg-red-500/15 text-red-500 border-red-500/30';
    case 'HIGH':
      return 'bg-rose-500/15 text-rose-500 border-rose-500/30';
    case 'MEDIUM':
      return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
    case 'LOW':
      return 'bg-blue-500/15 text-blue-500 border-blue-500/30';
    default:
      return 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30';
  }
};

export const FullScreenReportModal: React.FC<FullScreenReportModalProps> = ({ isOpen, onClose, report }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const modalRef = useRef<HTMLDivElement>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const isLoggedIn = !!localStorage.getItem('greenintel_token');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsBookmarked(false);
      setActiveTab('overview');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !report) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleBookmark = async () => {
    if (!isLoggedIn) {
      alert("Authentication is required to save reports. Please log in or create an account.");
      return;
    }

    try {
      await api.post('/api/reports', {
        title: report.document_type + " Evaluation (" + report.filename + ")",
        filename: report.filename,
        score: report.compliance_score || 0,
        metrics: `${Object.keys(report.extracted_data || {}).length} parameters extracted`,
        evaluation_id: null
      });
      setIsBookmarked(true);
      alert("Report saved to your bookmarks successfully!");
    } catch (err: unknown) {
      console.error(err);
      alert("Failed to bookmark report.");
    }
  };

  const percentage = (report.confidence * 100).toFixed(1);
  const theme = getTheme(report.document_type);
  const IconComponent = theme.icon;

  const checks = report.checks || [];
  const issues = report.issues || [];
  const recommendations = report.recommendations || [];

  const passedChecksCount = report.passed_checks ?? checks.filter(c => c.status === 'Compliant' || c.status === 'Excellent').length;
  const partialChecksCount = report.partial_checks ?? checks.filter(c => c.status === 'Partially Compliant').length;
  const failedChecksCount = report.failed_checks ?? checks.filter(c => c.status === 'Non-Compliant').length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={handleBackdropClick}
        >
          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className="bg-card-base border border-border-base rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 text-text-main"
          >
            {/* Top Command Header */}
            <header className="sticky top-0 bg-card-base border-b border-border-base px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase tracking-wider">
                      Document Analysis Workspace
                    </span>
                    <span className="text-xs text-text-muted font-medium">
                      ID: {report._id || report.id || 'DOC-LIVE'}
                    </span>
                  </div>
                  <h2 className="text-base font-extrabold text-text-main truncate mt-0.5" title={report.filename}>
                    {report.filename}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border ${theme.bg}`}>
                  <IconComponent className="w-3.5 h-3.5" />
                  {report.document_type}
                </span>

                <span className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  {percentage}% Confidence
                </span>

                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isBookmarked
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      : 'bg-neutral-100 dark:bg-white/5 text-text-muted hover:text-text-main border-black/5 dark:border-white/10'
                  }`}
                  title={isBookmarked ? "Report Saved" : "Save Report"}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={onClose}
                  className="p-2 text-text-muted hover:text-text-main bg-neutral-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl transition-all cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Navigation Tabs Bar */}
            <div className="flex items-center gap-1 px-6 pt-3 border-b border-border-base bg-neutral-500/[0.03] overflow-x-auto custom-scrollbar">
              {[
                { id: 'overview', label: 'Overview', icon: Layers },
                { id: 'data', label: 'Extracted Data', icon: FileText, count: Object.keys(report.extracted_data || {}).length },
                { id: 'compliance', label: 'Compliance Analysis', icon: ShieldCheck, count: checks.length },
                { id: 'issues', label: 'Document Issues', icon: AlertTriangle, count: issues.length, badgeColor: issues.length > 0 ? 'bg-rose-500 text-white' : '' },
                { id: 'evidence', label: 'Evidence & Location', icon: MapPin },
                { id: 'recommendations', label: 'Recommendations', icon: Wrench, count: recommendations.length }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                      isActive
                        ? 'border-primary text-primary bg-card-base'
                        : 'border-transparent text-text-muted hover:text-text-main hover:bg-neutral-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${tab.badgeColor || 'bg-black/10 dark:bg-white/10 text-text-muted'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

              {/* 1. OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Summary Score Card Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-purple-500/10 border border-border-base">
                    <div className="md:col-span-2 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-rose-500 flex flex-col items-center justify-center text-white shadow-lg shrink-0">
                        <span className="text-2xl font-extrabold leading-none">{report.compliance_score ?? '--'}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Score</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold uppercase text-text-muted">Overall Evaluation</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                            report.overall_status === 'Excellent' || report.overall_status === 'Compliant'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : report.overall_status === 'Partially Compliant'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          }`}>
                            {report.overall_status || 'Evaluated'}
                          </span>
                        </div>
                        <h3 className="text-lg font-extrabold text-text-main mt-1 font-display">
                          {report.filename}
                        </h3>
                        <p className="text-xs text-text-muted mt-0.5">
                          Classification Confidence: <span className="font-bold text-text-main">{percentage}%</span>
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-2 grid grid-cols-3 gap-2">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center flex flex-col items-center justify-center">
                        <Check className="w-4 h-4 text-emerald-500 mb-1" />
                        <span className="text-lg font-extrabold text-emerald-500 leading-none">{passedChecksCount}</span>
                        <span className="text-[10px] font-bold text-text-muted mt-1 uppercase">Passed</span>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center flex flex-col items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-amber-500 mb-1" />
                        <span className="text-lg font-extrabold text-amber-500 leading-none">{partialChecksCount}</span>
                        <span className="text-[10px] font-bold text-text-muted mt-1 uppercase">Partial</span>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center flex flex-col items-center justify-center">
                        <X className="w-4 h-4 text-rose-500 mb-1" />
                        <span className="text-lg font-extrabold text-rose-500 leading-none">{failedChecksCount}</span>
                        <span className="text-[10px] font-bold text-text-muted mt-1 uppercase">Failed</span>
                      </div>
                    </div>
                  </div>

                  {/* Overview Text Box */}
                  <div className="p-5 rounded-2xl bg-card-base border border-border-base space-y-2">
                    <h4 className="text-xs font-extrabold uppercase text-text-muted tracking-wider flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      Executive Summary & IGBC Alignment
                    </h4>
                    <p className="text-xs text-text-main leading-relaxed">
                      {report.generated_report || `This ${report.document_type} ('${report.filename}') has been automatically parsed and evaluated against standard IGBC rating taxonomy. The AI information extraction pipeline extracted ${Object.keys(report.extracted_data || {}).length} structured parameters, resulting in a compliance score of ${report.compliance_score}/100.`}
                    </p>
                  </div>
                </div>
              )}

              {/* 2. EXTRACTED DATA TAB */}
              {activeTab === 'data' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase text-text-muted tracking-wider">
                      Extracted Document Parameters ({Object.keys(report.extracted_data || {}).length})
                    </h3>
                    <span className="text-[10px] text-text-muted">Real PyMuPDF + Llama 3.3 70B Extraction</span>
                  </div>

                  {Object.keys(report.extracted_data || {}).length === 0 ? (
                    <p className="text-xs text-text-muted py-8 text-center border border-dashed border-border-base rounded-2xl">
                      No extracted data fields found.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(report.extracted_data || {}).map(([key, val]) => (
                        <div key={key} className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border-base hover:border-primary/40 transition-colors">
                          <span className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider block">
                            {formatFieldName(key)}
                          </span>
                          <span className="text-sm font-extrabold text-text-main mt-1 block font-mono">
                            {val !== null && val !== undefined ? String(val) : 'Not Disclosed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. COMPLIANCE ANALYSIS TAB */}
              {activeTab === 'compliance' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase text-text-muted tracking-wider">
                    IGBC Rule Evaluation Matrix ({checks.length} Checks)
                  </h3>

                  {checks.length === 0 ? (
                    <p className="text-xs text-text-muted py-8 text-center border border-dashed border-border-base rounded-2xl">
                      No compliance checks generated.
                    </p>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-border-base">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-black/[0.04] dark:bg-white/[0.05] border-b border-border-base font-extrabold text-text-muted uppercase text-[10px]">
                          <tr>
                            <th className="p-3.5">Rule / Metric</th>
                            <th className="p-3.5">Extracted Value</th>
                            <th className="p-3.5">Requirement / Benchmark</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5">Evaluation Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-base font-medium">
                          {checks.map((chk, idx) => (
                            <tr key={idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                              <td className="p-3.5 font-bold text-text-main">
                                {chk.metric}
                              </td>
                              <td className="p-3.5 font-mono text-primary font-bold">
                                {chk.value ?? 'N/A'}
                              </td>
                              <td className="p-3.5 text-text-muted">
                                {chk.requirement || 'Standard Benchmark'}
                              </td>
                              <td className="p-3.5">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                  chk.status === 'Excellent' || chk.status === 'Compliant'
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    : chk.status === 'Partially Compliant'
                                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                }`}>
                                  {chk.status}
                                </span>
                              </td>
                              <td className="p-3.5 text-text-muted leading-relaxed">
                                {chk.reason}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 4. DOCUMENT ISSUES TAB */}
              {activeTab === 'issues' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase text-text-muted tracking-wider">
                      Detected Issues ({issues.length})
                    </h3>
                    <span className="text-[10px] text-text-muted">What is wrong & how to correct it</span>
                  </div>

                  {issues.length === 0 ? (
                    <div className="p-8 border border-emerald-500/20 rounded-2xl bg-emerald-500/5 text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                      <h4 className="text-sm font-extrabold text-emerald-500">Zero Compliance Issues Found!</h4>
                      <p className="text-xs text-text-muted">
                        This document meets or exceeds all IGBC sustainability evaluation criteria.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {issues.map((issue) => (
                        <div key={issue.issue_id} className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-border-base space-y-3 hover:border-primary/40 transition-colors">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-primary font-mono bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                {issue.issue_id}
                              </span>
                              <h4 className="text-sm font-extrabold text-text-main">
                                {issue.metric}
                              </h4>
                            </div>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${getSeverityBadge(issue.severity)}`}>
                              {issue.severity} SEVERITY
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-black/[0.03] dark:bg-white/[0.04] p-3 rounded-xl">
                            <div>
                              <span className="text-[10px] font-bold text-text-muted uppercase block">Extracted Current Value:</span>
                              <span className="font-bold text-rose-500 font-mono">{issue.current_value}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-text-muted uppercase block">Expected Requirement Threshold:</span>
                              <span className="font-bold text-emerald-500 font-mono">{issue.expected_value}</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold uppercase text-text-muted block">Problem Description:</span>
                            <p className="text-xs text-text-main leading-relaxed">
                              {issue.explanation}
                            </p>
                          </div>

                          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
                            <span className="text-[10px] font-extrabold uppercase text-primary block">Recommended Action:</span>
                            <p className="text-xs text-text-main font-semibold">
                              {issue.recommended_action}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 5. EVIDENCE & LOCATION TAB */}
              {activeTab === 'evidence' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase text-text-muted tracking-wider">
                    Source Evidence & Location Pinpointer ({checks.length} Evidence Records)
                  </h3>

                  <div className="space-y-3">
                    {checks.map((chk, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-border-base space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="text-xs font-extrabold text-text-main">{chk.metric}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-200 dark:bg-white/10 text-text-muted">
                              {chk.section || 'Document Analysis'}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-extrabold text-primary">
                            {chk.page_number ? `Page ${chk.page_number}` : 'Page information unavailable'}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-black/[0.04] dark:bg-black/40 border border-black/10 dark:border-white/10 font-mono text-xs text-text-main italic">
                          "{chk.evidence_quote || 'Source sentence quotation not explicitly extracted.'}"
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
                          <span>Extracted Value: <strong className="text-text-main font-mono">{chk.value ?? 'N/A'}</strong></span>
                          <span>Requirement: <strong className="text-text-main">{chk.requirement || 'N/A'}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. RECOMMENDATIONS TAB */}
              {activeTab === 'recommendations' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase text-text-muted tracking-wider">
                    Actionable Improvement Plan ({recommendations.length} Steps)
                  </h3>

                  {recommendations.length === 0 ? (
                    <p className="text-xs text-text-muted py-8 text-center border border-dashed border-border-base rounded-2xl">
                      No specific recommendations needed for this document.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border-base">
                          <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-xs text-text-main font-semibold leading-relaxed pt-0.5">
                            {rec}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenReportModal;
