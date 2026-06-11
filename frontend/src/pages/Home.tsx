import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Trash2, AlertCircle, 
  HelpCircle, Zap, Droplets, Trash, ClipboardCheck, 
  ShieldCheck, ArrowRight, Brain, Activity,
  TrendingUp, Sparkles
} from 'lucide-react';
import FileUpload from '../components/FileUpload';
import ResultCard from '../components/ResultCard';
import type { UploadedDocument } from '../types/document';
import { uploadSingleDocument } from '../services/api';
import api from '../services/api';

interface DashboardStats {
  documents_processed: number;
  compliance_evaluations: number;
  reports_generated: number;
  classification_accuracy: number;
}

const Home: React.FC = () => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    documents_processed: 0,
    compliance_evaluations: 0,
    reports_generated: 0,
    classification_accuracy: 0.0
  });
  
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/evaluations/stats');
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleFilesSelected = async (files: File[]) => {
    setErrorText(null);
    setIsProcessing(true);

    const newDocs: UploadedDocument[] = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
      file,
      progress: 0,
      status: 'idle',
    }));

    setDocuments((prev) => [...newDocs, ...prev]);

    const uploadPromises = newDocs.map(async (doc) => {
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

        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id ? { ...d, status: 'error', error: errMsg } : d
          )
        );

        setErrorText('Some documents failed to evaluate. Please check the status indicators below.');
      }
    });

    await Promise.all(uploadPromises);
    setIsProcessing(false);
    // Refresh dashboard stats to show the newly processed documents
    fetchStats();
  };

  const handleClearAll = () => {
    setDocuments([]);
    setErrorText(null);
  };

  // Helper selectors for currently uploaded session items
  const activeUploads = documents.filter((d) => d.status === 'uploading');
  const completedResults = documents
    .filter((d) => d.status === 'success' && d.result)
    .map((d) => d.result!);

  const failedUploads = documents.filter((d) => d.status === 'error');

  return (
    <div className="space-y-6">
      {/* 1. Hero Section: Premium, Minimal, Above the fold */}
      <section className="relative overflow-hidden bg-card-base border border-border-base rounded-xl p-6 md:p-8 shadow-sm orange-glow transition-all duration-350">
        {/* Decorative Grid Accent */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] pointer-events-none" />
        
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 dark:bg-primary/20" />
        
        <div className="relative z-10 max-w-3xl space-y-3.5">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            <Brain className="w-3.5 h-3.5" />
            <span>Document Intelligence Platform</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-main tracking-tight font-display">
            GreenIntel AI
          </h1>
          
          <p className="text-xs md:text-sm text-text-muted font-semibold font-sans">
            AI-Powered IGBC Document Evaluation and Compliance Intelligence Platform
          </p>
          
          <p className="text-xs text-text-muted leading-relaxed max-w-2xl font-normal font-sans">
            Upload sustainability documents and receive automated classification, compliance assessment, and professional evaluation reports mapped against the Indian Green Building Council (IGBC) taxonomy.
          </p>
          
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={scrollToUpload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-lg shadow-sm shadow-primary/10 hover:shadow-md hover:shadow-primary/15 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Upload Document</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Stats Section (4-column sleek KPI grid) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Documents Processed */}
        <div className="bg-card-base p-4 rounded-xl border border-border-base shadow-sm flex items-center justify-between hover:border-primary/45 transition-all duration-200">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-sans">Documents Processed</span>
            <div className="text-xl font-bold text-text-main font-display flex items-baseline gap-1">
              {stats.documents_processed}
              <span className="text-xs font-normal text-text-muted">total</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-orange-500/10 text-primary border border-primary/20">
            <FileText className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 2: Compliance Evaluations */}
        <div className="bg-card-base p-4 rounded-xl border border-border-base shadow-sm flex items-center justify-between hover:border-primary/45 transition-all duration-200">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-sans">Compliance Evaluations</span>
            <div className="text-xl font-bold text-text-main font-display">
              {stats.compliance_evaluations}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 3: Reports Generated */}
        <div className="bg-card-base p-4 rounded-xl border border-border-base shadow-sm flex items-center justify-between hover:border-primary/45 transition-all duration-200">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-sans">Reports Saved</span>
            <div className="text-xl font-bold text-text-main font-display">
              {stats.reports_generated}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ClipboardCheck className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 4: Classification Accuracy */}
        <div className="bg-card-base p-4 rounded-xl border border-border-base shadow-sm flex items-center justify-between hover:border-primary/45 transition-all duration-200">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-sans">Classification Accuracy</span>
            <div className="text-xl font-bold text-text-main font-display flex items-center gap-1.5">
              {stats.classification_accuracy > 0 ? (stats.classification_accuracy * 100).toFixed(1) + '%' : '0.0%'}
              <span className="inline-flex items-center text-[9px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 rounded">
                <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                Target
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-500/10 dark:bg-purple-400/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* 3. Main content dashboard split layout */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload Box, Queue, and Taxonomy map */}
        <div className="lg:col-span-1 space-y-4">
          {/* Upload Card */}
          <div ref={uploadSectionRef} className="bg-card-base p-5 rounded-xl border border-border-base shadow-sm space-y-4 transition-all duration-350">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-xs font-bold text-text-main uppercase tracking-wider">Evaluate Documents</h2>
                <p className="text-[11px] text-text-muted font-sans">Submit environmental audits or reports.</p>
              </div>
              
              {documents.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] font-semibold text-red-500 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15 rounded-lg border border-red-500/20 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Error Banner */}
            {errorText && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-600 dark:text-red-400 flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-500 mt-0.5" />
                <div>
                  <span className="font-bold">Evaluation Issue:</span> {errorText}
                </div>
              </div>
            )}

            {/* Premium File Upload Component */}
            <FileUpload onFilesSelected={handleFilesSelected} isLoading={isProcessing} />
          </div>

          {/* Active Uploads / Processing Queue list */}
          <AnimatePresence>
            {activeUploads.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-card-base p-4 rounded-xl border border-border-base shadow-sm space-y-3 transition-all duration-350"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span>Processing Queue ({activeUploads.length})</span>
                  </h3>
                </div>
                
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                  {activeUploads.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg bg-card-base/50 border border-border-base gap-3 text-xs">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Activity className="w-3.5 h-3.5 text-primary animate-pulse flex-shrink-0" />
                        <span className="text-[11px] font-medium text-text-main truncate" title={doc.file.name}>
                          {doc.file.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 w-1/2">
                        <div className="flex-1 bg-border-base rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-300"
                            style={{ width: `${doc.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-text-muted w-8 text-right font-sans">
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
                className="p-4 rounded-xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 space-y-2"
              >
                <h3 className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <span>Failed Evaluations ({failedUploads.length})</span>
                </h3>
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1 custom-scrollbar">
                  {failedUploads.map((doc) => (
                    <div key={doc.id} className="flex justify-between items-center p-2 rounded bg-card-base border border-border-base text-[10.5px] gap-2">
                      <span className="text-text-main truncate flex-1 font-medium font-sans" title={doc.file.name}>
                        {doc.file.name}
                      </span>
                      <span className="text-[9px] font-bold text-red-500 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 flex-shrink-0 font-sans">
                        {doc.error || 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* IGBC Classification Taxonomy Map */}
          <div className="bg-card-base p-5 rounded-xl border border-border-base shadow-sm space-y-3 transition-all duration-350">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span>IGBC Framework Taxonomy</span>
              </h3>
              <p className="text-[10.5px] text-text-muted font-sans">Automated classification mapping standards:</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              {/* Energy */}
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-card-base/50 border border-border-base hover:border-emerald-500/30 transition-colors duration-150">
                <Zap className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className="font-semibold text-text-main truncate font-sans">Energy Report</span>
              </div>

              {/* Water */}
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-card-base/50 border border-border-base hover:border-blue-500/30 transition-colors duration-150">
                <Droplets className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span className="font-semibold text-text-main truncate font-sans">Water Report</span>
              </div>

              {/* Waste */}
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-card-base/50 border border-border-base hover:border-amber-500/30 transition-colors duration-150">
                <Trash className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span className="font-semibold text-text-main truncate font-sans">Waste Report</span>
              </div>

              {/* Audit */}
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-card-base/50 border border-border-base hover:border-purple-500/30 transition-colors duration-150">
                <ClipboardCheck className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                <span className="font-semibold text-text-main truncate font-sans">Audit Report</span>
              </div>

              {/* Compliance */}
              <div className="col-span-2 flex items-center gap-1.5 p-2 rounded-lg bg-card-base/50 border border-border-base hover:border-indigo-500/30 transition-colors duration-150">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span className="font-semibold text-text-main truncate font-sans">Compliance Document</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Evaluation Results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border-base pb-2">
            <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">
              Evaluation Results
            </h3>
            <span className="text-[11px] text-text-muted font-medium font-sans">
              {completedResults.length} report{completedResults.length !== 1 ? 's' : ''} evaluated
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            {completedResults.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border border-dashed border-border-base rounded-xl p-8 text-center bg-card-base/50 flex flex-col items-center justify-center min-h-[380px] shadow-sm transition-all duration-350"
              >
                <div className="p-3 rounded-lg bg-card-base border border-border-base text-text-muted mb-3 shadow-sm">
                  <FileText className="w-5 h-5 text-text-muted" />
                </div>
                <h3 className="text-xs font-bold text-text-main">No Evaluations Performed</h3>
                <p className="text-[11px] text-text-muted max-w-xs mt-1 leading-relaxed font-sans">
                  Upload green building documents to classify standard taxonomy and extract key metrics.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {documents
                  .filter((d) => d.status === 'success' && d.result)
                  .map((doc) => (
                    <ResultCard key={doc.id} result={doc.result!} />
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
