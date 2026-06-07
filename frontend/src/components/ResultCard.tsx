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
        bg: 'bg-emerald-50/60 text-emerald-700 border-emerald-100/80',
        text: 'text-emerald-700',
        bar: 'bg-emerald-500',
        icon: Zap,
        desc: 'Details building Energy Performance Index (EPI), solar generation potential, HVAC systems, and lighting efficiency.'
      };
    case 'Water Report':
      return {
        bg: 'bg-blue-50/60 text-blue-700 border-blue-100/80',
        text: 'text-blue-700',
        bar: 'bg-blue-500',
        icon: Droplets,
        desc: 'Covers rainwater harvesting systems, water demand-reduction indices, wastewater treatment, and plumbing efficiency.'
      };
    case 'Waste Report':
      return {
        bg: 'bg-amber-50/60 text-amber-700 border-amber-100/80',
        text: 'text-amber-700',
        bar: 'bg-amber-500',
        icon: Trash2,
        desc: 'Assesses wet/dry waste segregation, composting systems, construction debris management, and recycling protocols.'
      };
    case 'Audit Report':
      return {
        bg: 'bg-purple-50/60 text-purple-700 border-purple-100/80',
        text: 'text-purple-700',
        bar: 'bg-purple-500',
        icon: ClipboardCheck,
        desc: 'Third-party green building compliance records, energy/water audits, building commissioning, and materials verification.'
      };
    case 'Compliance Document':
      return {
        bg: 'bg-indigo-50/60 text-indigo-700 border-indigo-100/80',
        text: 'text-indigo-700',
        bar: 'bg-indigo-500',
        icon: ShieldCheck,
        desc: 'Statutory approvals, environmental clearance certificates, municipal approvals, and structural stability certifications.'
      };
    default:
      return {
        bg: 'bg-slate-50 text-slate-700 border-slate-100',
        text: 'text-slate-700',
        bar: 'bg-slate-500',
        icon: FileText,
        desc: 'Standard documentation submitted for environmental rating assessment.'
      };
  }
};

const formatFieldName = (field: string): string => {
  return field
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const { filename, document_type, confidence, extracted_data } = result;
  const percentage = (confidence * 100).toFixed(1);
  const theme = getTheme(document_type);
  const IconComponent = theme.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden"
    >
      {/* Visual Top Highlight Line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${theme.bar}`} />

      <div className="space-y-3">
        {/* Header: PDF Icon + Filename + Success Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 flex-shrink-0">
              <FileIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block leading-none">Document Name</span>
              <h4 className="text-xs font-bold text-slate-800 truncate mt-0.5 block leading-none" title={filename}>
                {filename}
              </h4>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex-shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            <span>Classified</span>
          </div>
        </div>

        {/* Classification Pill + Description */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${theme.bg}`}>
              <IconComponent className="w-3 h-3" />
              {document_type}
            </span>
            
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
              <Sparkles className="w-2.5 h-2.5" />
              AI Extracted
            </span>
          </div>
          
          <p className="text-[11px] text-slate-500 leading-normal min-h-[32px] line-clamp-2">
            {theme.desc}
          </p>
        </div>

        {/* Extracted Information Dynamic Grid of Cards */}
        {extracted_data && Object.keys(extracted_data).length > 0 && (
          <div className="space-y-1.5 mt-1">
            <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span>Extracted Metrics</span>
            </h5>
            
            <div className="grid grid-cols-2 gap-1.5 max-h-[180px] overflow-y-auto pr-1 bg-slate-50/50 rounded-lg p-2 border border-slate-100/80 custom-scrollbar">
              {Object.entries(extracted_data).map(([key, value]) => {
                const strVal = value ? String(value) : '';
                const isLong = key === 'findings' || key === 'recommendations' || strVal.length > 20;
                return (
                  <div 
                    key={key} 
                    className={`bg-white border border-slate-200/50 hover:border-slate-200 rounded-md p-1.5 transition-all duration-150 ${
                      isLong ? 'col-span-2' : 'col-span-1'
                    }`}
                  >
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate" title={formatFieldName(key)}>
                      {formatFieldName(key)}
                    </span>
                    <span className={`block text-[10.5px] font-bold mt-0.5 whitespace-normal break-words leading-tight ${value ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                      {value || '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer: Confidence Metrics */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1">
        <div className="flex justify-between items-center text-[10px]">
          <span className="font-bold text-slate-400 uppercase tracking-wider">AI Confidence</span>
          <span className={`font-mono font-bold ${theme.text}`}>
            {percentage}%
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6, delay: 0.05, ease: "easeOut" }}
            className={`h-full rounded-full ${theme.bar}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ResultCard;

