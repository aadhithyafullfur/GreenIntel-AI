import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Zap, Droplets, Trash2, ShieldCheck, ClipboardCheck, 
  Sparkles, CheckCircle2, FileIcon
} from 'lucide-react';
import type { ClassificationResult } from '../types/document';

interface ResultCardProps {
  result: ClassificationResult;
}

const getTheme = (type: string) => {
  switch (type) {
    case 'Energy Report':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        text: 'text-emerald-700',
        bar: 'bg-emerald-600',
        icon: Zap,
        desc: 'Details building Energy Performance Index (EPI), solar generation potential, HVAC systems, and lighting efficiency.'
      };
    case 'Water Report':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-100',
        text: 'text-blue-700',
        bar: 'bg-blue-600',
        icon: Droplets,
        desc: 'Covers rainwater harvesting systems, water demand-reduction indices, wastewater treatment, and plumbing efficiency.'
      };
    case 'Waste Report':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-100',
        text: 'text-amber-700',
        bar: 'bg-amber-600',
        icon: Trash2,
        desc: 'Assesses wet/dry waste segregation, composting systems, construction debris management, and recycling protocols.'
      };
    case 'Audit Report':
      return {
        bg: 'bg-purple-50 text-purple-700 border-purple-100',
        text: 'text-purple-700',
        bar: 'bg-purple-600',
        icon: ClipboardCheck,
        desc: 'Third-party green building compliance records, energy/water audits, building commissioning, and materials verification.'
      };
    case 'Compliance Document':
      return {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        text: 'text-indigo-700',
        bar: 'bg-indigo-600',
        icon: ShieldCheck,
        desc: 'Statutory approvals, environmental clearance certificates, municipal approvals, and structural stability certifications.'
      };
    default:
      return {
        bg: 'bg-slate-50 text-slate-700 border-slate-100',
        text: 'text-slate-700',
        bar: 'bg-slate-600',
        icon: FileText,
        desc: 'Standard documentation submitted for environmental rating assessment.'
      };
  }
};

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const { filename, document_type, confidence } = result;
  const percentage = (confidence * 100).toFixed(1);
  const theme = getTheme(document_type);
  const IconComponent = theme.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      {/* Visual Top Highlight Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${theme.bar}`} />

      <div className="space-y-4">
        {/* Header: PDF Icon + Filename + Success Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex-shrink-0">
              <FileIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-sans">Document Name</p>
              <h4 className="text-sm font-semibold text-slate-800 truncate mt-0.5" title={filename}>
                {filename}
              </h4>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex-shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Classified</span>
          </div>
        </div>

        {/* Classification Pill + Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${theme.bg}`}>
              <IconComponent className="w-3.5 h-3.5" />
              {document_type}
            </span>
            
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
              <Sparkles className="w-3 h-3" />
              AI Agent
            </span>
          </div>
          
          <p className="text-xs text-slate-500 font-sans leading-relaxed min-h-[54px] line-clamp-3">
            {theme.desc}
          </p>
        </div>
      </div>

      {/* Footer: Confidence Metrics */}
      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] font-sans">AI Confidence Score</span>
          <span className={`font-mono font-bold ${theme.text}`}>
            {percentage}%
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className={`h-full rounded-full ${theme.bar}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ResultCard;
