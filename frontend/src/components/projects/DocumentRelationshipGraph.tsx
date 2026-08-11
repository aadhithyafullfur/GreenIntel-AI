import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Droplets, Trash, ClipboardCheck } from 'lucide-react';
import type { Project } from '../../types/project';

interface DocumentRelationshipGraphProps {
  project: Project;
  documents: any[];
}

export const DocumentRelationshipGraph: React.FC<DocumentRelationshipGraphProps> = ({
  project,
  documents
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const getIcon = (docType: string) => {
    switch (docType?.toLowerCase()) {
      case 'energy report': return <Zap className="w-4 h-4 text-orange-500" />;
      case 'water report': return <Droplets className="w-4 h-4 text-cyan-500" />;
      case 'waste report': return <Trash className="w-4 h-4 text-emerald-500" />;
      case 'audit report': return <ClipboardCheck className="w-4 h-4 text-purple-500" />;
      default: return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="bg-card-base border border-border-base rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-text-main font-display flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span>Interactive Project Document Relationship Network</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5 font-sans">
            Visual topology mapping project workspace hierarchy to document categories, metrics & IGBC compliance checks.
          </p>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="p-8 border border-dashed border-border-base rounded-2xl text-center text-xs text-text-muted">
          No documents uploaded yet to map relationship network.
        </div>
      ) : (
        <div className="relative p-6 rounded-2xl bg-neutral-950/40 border border-black/10 dark:border-white/5 space-y-8 overflow-x-auto custom-scrollbar">
          {/* Level 1: Project Root Node */}
          <div className="flex justify-center">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-xl shadow-primary/20 border border-white/20"
            >
              <Building2 className="w-5 h-5" />
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider block opacity-90">
                  Root Project ({project.project_id})
                </span>
                <span className="text-sm font-extrabold font-display">{project.name}</span>
              </div>
            </motion.div>
          </div>

          {/* Vertical Connecting Line */}
          <div className="w-0.5 h-6 bg-primary/40 mx-auto" />

          {/* Level 2: Document Nodes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => {
              const isSelected = selectedDocId === doc._id;
              const passed = doc.passed_checks || 0;
              const failed = doc.failed_checks || 0;

              return (
                <motion.div
                  key={doc._id}
                  onClick={() => setSelectedDocId(isSelected ? null : doc._id)}
                  whileHover={{ y: -3 }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10'
                      : 'bg-card-base border-border-base hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-neutral-100 dark:bg-white/5 border border-black/5 dark:border-white/10 shrink-0">
                        {getIcon(doc.document_type)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider block truncate">
                          {doc.document_type || 'Document'}
                        </span>
                        <h4 className="text-xs font-bold text-text-main truncate" title={doc.filename}>
                          {doc.filename}
                        </h4>
                      </div>
                    </div>

                    <span className="text-xs font-extrabold font-display px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      {doc.compliance_score || 0}%
                    </span>
                  </div>

                  {/* Node Sub-Items (Metrics & Checks) */}
                  <div className="mt-3 pt-3 border-t border-border-base/60 flex items-center justify-between text-[10px] text-text-muted">
                    <span className="flex items-center gap-1 text-emerald-500 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> {passed} Passed
                    </span>
                    {failed > 0 && (
                      <span className="flex items-center gap-1 text-red-500 font-medium">
                        <AlertTriangle className="w-3 h-3" /> {failed} Failed
                      </span>
                    )}
                    <span className="font-mono">{doc.created_at?.slice(0, 10)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
