import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, FileText } from 'lucide-react';
import type { ClassificationResult } from '../../types/document';

interface DocumentComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: ClassificationResult[];
}

export const DocumentComparisonModal: React.FC<DocumentComparisonModalProps> = ({
  isOpen,
  onClose,
  documents
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    documents.slice(0, 3).map(d => d._id || d.id || d.filename)
  );

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter(i => i !== id));
      }
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const activeDocs = documents.filter(d => selectedIds.includes(d._id || d.id || d.filename));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 15 }}
            className="relative w-full max-w-6xl bg-card-base border border-border-base rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-text-main"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-base bg-gradient-to-r from-orange-500/10 via-rose-500/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-text-main font-display">
                    Document Compliance Comparison Matrix
                  </h2>
                  <p className="text-xs text-text-muted">
                    Compare compliance scores, rule checks, issue severities, and extracted metrics side-by-side.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-text-muted hover:text-text-main bg-neutral-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Selector Pills */}
            <div className="px-6 py-3 border-b border-border-base bg-black/[0.02] dark:bg-white/[0.02] flex items-center gap-2 overflow-x-auto custom-scrollbar">
              <span className="text-xs font-bold text-text-muted uppercase shrink-0 mr-2">Select Documents (max 4):</span>
              {documents.map((doc) => {
                const id = doc._id || doc.id || doc.filename;
                const isSelected = selectedIds.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggleSelect(id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                        : 'bg-neutral-100 dark:bg-white/5 text-text-muted border-black/5 dark:border-white/10 hover:text-text-main'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[140px]">{doc.filename}</span>
                  </button>
                );
              })}
            </div>

            {/* Comparison Matrix Table */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {activeDocs.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-12 border border-dashed border-border-base rounded-2xl">
                  Please select at least one document to compare.
                </p>
              ) : (
                <div className="overflow-x-auto border border-border-base rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-black/[0.04] dark:bg-white/[0.05] border-b border-border-base">
                      <tr>
                        <th className="p-4 font-extrabold uppercase text-text-muted text-[10px] w-48">Metric / Parameter</th>
                        {activeDocs.map((doc) => (
                          <th key={doc._id || doc.id || doc.filename} className="p-4 border-l border-border-base min-w-[200px]">
                            <span className="text-[10px] font-extrabold uppercase text-primary block">{doc.document_type}</span>
                            <span className="text-xs font-extrabold text-text-main block truncate" title={doc.filename}>{doc.filename}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-base font-medium">
                      {/* Row 1: Compliance Score */}
                      <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                        <td className="p-4 font-extrabold text-text-main">Overall Compliance Score</td>
                        {activeDocs.map((doc) => (
                          <td key={doc._id || doc.id || doc.filename} className="p-4 border-l border-border-base font-mono font-extrabold text-base text-primary">
                            {doc.compliance_score ?? '--'}/100
                          </td>
                        ))}
                      </tr>

                      {/* Row 2: Status */}
                      <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                        <td className="p-4 font-extrabold text-text-main">Overall Status</td>
                        {activeDocs.map((doc) => (
                          <td key={doc._id || doc.id || doc.filename} className="p-4 border-l border-border-base">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                              doc.overall_status === 'Excellent' || doc.overall_status === 'Compliant'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : doc.overall_status === 'Partially Compliant'
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            }`}>
                              {doc.overall_status || 'Evaluated'}
                            </span>
                          </td>
                        ))}
                      </tr>

                      {/* Row 3: Passed Checks */}
                      <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                        <td className="p-4 font-extrabold text-text-main">Passed Checks</td>
                        {activeDocs.map((doc) => (
                          <td key={doc._id || doc.id || doc.filename} className="p-4 border-l border-border-base font-bold text-emerald-500">
                            {doc.passed_checks ?? (doc.checks || []).filter(c => c.status === 'Compliant' || c.status === 'Excellent').length} Passed
                          </td>
                        ))}
                      </tr>

                      {/* Row 4: Failed & Partial Checks */}
                      <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                        <td className="p-4 font-extrabold text-text-main">Failed / Partial Checks</td>
                        {activeDocs.map((doc) => (
                          <td key={doc._id || doc.id || doc.filename} className="p-4 border-l border-border-base font-bold text-rose-500">
                            {doc.failed_checks || 0} Failed, {doc.partial_checks || 0} Partial
                          </td>
                        ))}
                      </tr>

                      {/* Row 5: Total Issues */}
                      <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                        <td className="p-4 font-extrabold text-text-main">Detected Issues Count</td>
                        {activeDocs.map((doc) => (
                          <td key={doc._id || doc.id || doc.filename} className="p-4 border-l border-border-base font-bold text-amber-500">
                            {(doc.issues || []).length} Issues
                          </td>
                        ))}
                      </tr>

                      {/* Row 6: Classification Confidence */}
                      <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                        <td className="p-4 font-extrabold text-text-main">AI Confidence Score</td>
                        {activeDocs.map((doc) => (
                          <td key={doc._id || doc.id || doc.filename} className="p-4 border-l border-border-base font-mono">
                            {(doc.confidence * 100).toFixed(1)}%
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DocumentComparisonModal;
