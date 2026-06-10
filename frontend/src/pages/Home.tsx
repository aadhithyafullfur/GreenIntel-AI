import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Files, Sparkles, Trash2, AlertTriangle, 
  HelpCircle, Zap, Droplets, Trash, ClipboardCheck, 
  ShieldCheck, ArrowRight, BrainCircuit, Activity
} from 'lucide-react';
import FileUpload from '../components/FileUpload';
import ResultCard from '../components/ResultCard';
import type { UploadedDocument } from '../types/document';
import { uploadSingleDocument } from '../services/api';

const Home: React.FC = () => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleFilesSelected = async (files: File[]) => {
    setErrorText(null);
    setIsProcessing(true);

    // Create uploaded documents state objects
    const newDocs: UploadedDocument[] = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
      file,
      progress: 0,
      status: 'idle',
    }));

    // Add new files to existing list
    setDocuments((prev) => [...newDocs, ...prev]);

    // Upload each document in parallel
    const uploadPromises = newDocs.map(async (doc) => {
      // Update status to uploading
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, status: 'uploading' } : d))
      );

      try {
        const result = await uploadSingleDocument(doc.file, (progress) => {
          setDocuments((prev) =>
            prev.map((d) => (d.id === doc.id ? { ...d, progress } : d))
          );
        });

        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id
              ? { ...d, status: 'success', progress: 100, result }
              : d
          )
        );
      } catch (err: any) {
        console.error('Classification error for ' + doc.file.name, err);
        const errMsg = err.response?.data?.detail || `Failed to evaluate "${doc.file.name}".`;

        // Set error message for individual file
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id ? { ...d, status: 'error', error: errMsg } : d
          )
        );

        // Set global error notification text
        setErrorText('Some documents failed to evaluate. Please check the status indicators below.');
      }
    });

    // Wait for all uploads in this batch to finish
    await Promise.all(uploadPromises);
    setIsProcessing(false);
  };

  const handleClearAll = () => {
    setDocuments([]);
    setErrorText(null);
  };

  // Helper selectors
  const activeUploads = documents.filter((d) => d.status === 'uploading');
  const completedResults = documents
    .filter((d) => d.status === 'success' && d.result)
    .map((d) => d.result!);

  const failedUploads = documents.filter((d) => d.status === 'error');

  // Compute category statistics for the dashboard
  const totalDocs = documents.length;
  const processedDocs = completedResults.length;
  const avgConfidence = completedResults.length > 0
    ? completedResults.reduce((sum, item) => sum + item.confidence, 0) / completedResults.length
    : 0;
  const avgComplianceScore = completedResults.length > 0
    ? completedResults.reduce((sum, item) => sum + (item.compliance_score ?? 0), 0) / completedResults.length
    : 0;



  return (
    <div className="space-y-6 md:space-y-8">
      {/* 1. Header / Hero Section (Compact & Left Aligned) */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 border-b border-slate-200/50 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>IGBC Taxonomy Pipeline</span>
          </div>
          
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Environmental Evaluation Portal
          </h1>
          
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed font-sans">
            Upload environmental reports to instantly classify document categories and automatically extract structured green building metrics using Groq API.
          </p>
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={scrollToUpload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all hover:-translate-y-0.5"
          >
            <span>Upload Documents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 2. Stats Section (4-column stats grid) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Documents Processed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Processed Docs</span>
            <div className="text-lg font-bold text-slate-800 font-display">{processedDocs} <span className="text-xs font-normal text-slate-400">/ {totalDocs}</span></div>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Files className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 2: Average Confidence */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Avg. Confidence</span>
            <div className="text-lg font-bold text-slate-800 font-display">
              {avgConfidence > 0 ? (avgConfidence * 100).toFixed(1) + '%' : '—'}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 3: Classifier F1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Classifier F1</span>
            <div className="text-lg font-bold text-slate-800 font-display">96.4%</div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 4: Compliance Score */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Compliance Score</span>
            <div className="text-lg font-bold text-slate-800 font-display">
              {avgComplianceScore > 0 ? Math.round(avgComplianceScore) + '/100' : '—'}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* 3. Main 2-Column Content Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload, Processing Queue & Taxonomy Info (Col Span 1) */}
        <div className="lg:col-span-1 space-y-4">
          {/* Upload Card */}
          <div ref={uploadSectionRef} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-sm font-bold text-slate-800 font-display">Evaluate Reports</h2>
                <p className="text-[11px] text-slate-500 font-sans">Upload PDFs to classify & extract metrics.</p>
              </div>
              
              {documents.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-100 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Error banner */}
            {errorText && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2 animate-fade-in">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="font-bold">Evaluation issue:</span> {errorText}
                </div>
              </div>
            )}

            {/* Upload Area */}
            <FileUpload onFilesSelected={handleFilesSelected} isLoading={isProcessing} />
          </div>

          {/* Active Uploads / Processing Queue list */}
          <AnimatePresence>
            {activeUploads.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span>Processing Queue ({activeUploads.length})</span>
                  </h3>
                </div>
                
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                  {activeUploads.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100/60 gap-3 text-xs">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Activity className="w-3.5 h-3.5 text-blue-500 animate-pulse flex-shrink-0" />
                        <span className="text-[11px] font-medium text-slate-600 truncate" title={doc.file.name}>
                          {doc.file.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 w-1/2">
                        <div className="flex-1 bg-slate-200 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${doc.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-500 w-8 text-right font-sans">
                          {doc.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Queue / Failed Uploads */}
          <AnimatePresence>
            {failedUploads.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-xl bg-red-50/50 border border-red-100 space-y-2"
              >
                <h3 className="text-[10px] font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  <span>Failed Evaluations ({failedUploads.length})</span>
                </h3>
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1 custom-scrollbar">
                  {failedUploads.map((doc) => (
                    <div key={doc.id} className="flex justify-between items-center p-2 rounded bg-white border border-red-100 text-[10.5px] gap-2">
                      <span className="text-slate-600 truncate flex-1 font-medium font-sans" title={doc.file.name}>
                        {doc.file.name}
                      </span>
                      <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 flex-shrink-0 font-sans">
                        {doc.error || 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* IGBC Classification Taxonomy Map */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm space-y-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-slate-800 font-display flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>IGBC Framework Taxonomy</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">Supported green building document classifications:</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              {/* Energy */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <Zap className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className="font-semibold text-slate-700 truncate font-sans">Energy Report</span>
              </div>

              {/* Water */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <Droplets className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span className="font-semibold text-slate-700 truncate font-sans">Water Report</span>
              </div>

              {/* Waste */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <Trash className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span className="font-semibold text-slate-700 truncate font-sans">Waste Report</span>
              </div>

              {/* Audit */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <ClipboardCheck className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                <span className="font-semibold text-slate-700 truncate font-sans">Audit Report</span>
              </div>

              {/* Compliance */}
              <div className="col-span-2 flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span className="font-semibold text-slate-700 truncate font-sans">Compliance Document</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Evaluation Results (Col Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <h3 className="text-xs font-bold text-slate-700 font-display uppercase tracking-wider">
              Evaluation Results
            </h3>
            <span className="text-[11px] text-slate-400 font-medium font-sans">
              {completedResults.length} report(s) evaluated
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            {completedResults.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/10 flex flex-col items-center justify-center min-h-[360px]"
              >
                <div className="p-3 rounded-xl bg-white shadow-sm border border-slate-200 text-slate-400 mb-3">
                  <Files className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-xs font-bold text-slate-700">No evaluations in this session</h3>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1 font-sans">
                  Upload green building documents to start the taxonomy classification and automatic field extraction.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {completedResults.map((result, idx) => (
                  <ResultCard key={result.filename + '-' + idx} result={result} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default Home;
