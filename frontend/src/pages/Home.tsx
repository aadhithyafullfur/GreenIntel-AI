import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Files, Sparkles, FileCheck, Trash2, AlertTriangle, 
  HelpCircle, Zap, Droplets, Trash, ClipboardCheck, 
  ShieldCheck, ArrowRight, BrainCircuit, Activity
} from 'lucide-react';
import FileUpload from '../components/FileUpload';
import ResultCard from '../components/ResultCard';
import Loader from '../components/Loader';
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



  return (
    <div className="space-y-12">
      {/* 1. Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-5 pt-4">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>DistilBERT-powered Green Building Classification</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
          AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">IGBC Document</span> Evaluation
        </h1>
        
        <p className="text-base text-slate-500 font-sans max-w-xl mx-auto leading-relaxed">
          Upload environmental reports and instantly classify documents using DistilBERT AI. Ensure regulatory compliance with our state-of-the-art evaluation pipeline.
        </p>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={scrollToUpload}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5"
          >
            <span>Upload Documents</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 2. Stats Section (KPI Cards) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1: Total Documents */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Total Documents</span>
            <div className="text-3xl font-bold text-slate-800 font-display">{totalDocs}</div>
            <p className="text-[11px] text-slate-500 font-sans">Total files in current session</p>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Files className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Average Confidence */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Average Confidence</span>
            <div className="text-3xl font-bold text-slate-800 font-display">
              {(avgConfidence * 100).toFixed(1)}%
            </div>
            <p className="text-[11px] text-slate-500 font-sans">DistilBERT evaluation certainty</p>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Processed Reports */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Processed Reports</span>
            <div className="text-3xl font-bold text-slate-800 font-display">
              {processedDocs} <span className="text-xs font-normal text-slate-400">/ {totalDocs}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans">Successfully classified PDFs</p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* 3. Main Action Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Upload & Queue (Col Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div ref={uploadSectionRef} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-lg font-bold text-slate-800 font-display">Evaluate PDF Documents</h2>
                <p className="text-xs text-slate-500 font-sans">Upload environmental reports to start AI taxonomy classification.</p>
              </div>
              
              {documents.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Error banner */}
            {errorText && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5 animate-fade-in">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="font-semibold">Classification Warning:</span> {errorText}
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
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <div className="md:col-span-1">
                  <Loader
                    message="Running Model"
                    subMessage={`Parsing pages and evaluating ${activeUploads.length} document(s)...`}
                  />
                </div>
                <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                      </span>
                      <span>Processing Queue ({activeUploads.length})</span>
                    </h3>
                  </div>
                  
                  <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                    {activeUploads.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 gap-4">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <Activity className="w-4 h-4 text-blue-500 animate-pulse flex-shrink-0" />
                          <span className="text-xs font-medium text-slate-600 truncate" title={doc.file.name}>
                            {doc.file.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 w-1/3 sm:w-1/2">
                          <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all duration-300"
                              style={{ width: `${doc.progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono font-bold text-slate-500 w-8 text-right">
                            {doc.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
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
                className="p-5 rounded-2xl bg-red-50 border border-red-100 space-y-3"
              >
                <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Failed Evaluations ({failedUploads.length})</span>
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {failedUploads.map((doc) => (
                    <div key={doc.id} className="flex justify-between items-center p-2.5 rounded-lg bg-white border border-red-100 text-xs">
                      <span className="text-slate-600 truncate max-w-md font-medium" title={doc.file.name}>
                        {doc.file.name}
                      </span>
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        {doc.error || 'Evaluation Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Guide & Taxonomy Framework (Col Span 1) */}
        <div className="space-y-6">
          {/* AI Model Architecture Info */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 font-display flex items-center gap-2">
              <BrainCircuit className="w-4.5 h-4.5 text-blue-600" />
              <span>DistilBERT Model Status</span>
            </h3>
            
            <div className="space-y-3 text-xs text-slate-500 font-sans leading-relaxed">
              <p>
                Our core classification system uses a fine-tuned <strong>DistilBERT</strong> model specialized in green building guidelines and sustainability taxonomies.
              </p>
              
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Model Precision:</span>
                  <span className="font-bold text-slate-700">96.4% F1-score</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Inference Latency:</span>
                  <span className="font-bold text-slate-700">&lt;450ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Vocabulary Size:</span>
                  <span className="font-bold text-slate-700">30,522 tokens</span>
                </div>
              </div>
            </div>
          </div>

          {/* IGBC Classification Taxonomy Map */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-800 font-display flex items-center gap-1.5">
                <HelpCircle className="w-4.5 h-4.5 text-blue-600" />
                <span>IGBC Category Framework</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">The 5 structural categories recognized by the classifier:</p>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Energy */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Energy Report</h4>
                  <p className="text-[10px] text-slate-400 font-sans">HVAC, solar indexing, EPI metrics</p>
                </div>
              </div>

              {/* Water */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <Droplets className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Water Report</h4>
                  <p className="text-[10px] text-slate-400 font-sans">Rainwater index, sewage treatment</p>
                </div>
              </div>

              {/* Waste */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                  <Trash className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Waste Report</h4>
                  <p className="text-[10px] text-slate-400 font-sans">Segregation compliance, composting</p>
                </div>
              </div>

              {/* Audit */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                  <ClipboardCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Audit Report</h4>
                  <p className="text-[10px] text-slate-400 font-sans">Building credits, validation audits</p>
                </div>
              </div>

              {/* Compliance */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Compliance Document</h4>
                  <p className="text-[10px] text-slate-400 font-sans">Occupancy certificates, government NOCs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Results Section Grid */}
      <AnimatePresence>
        {completedResults.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 pt-2"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wider">
                Evaluation Results
              </h3>
              <span className="text-xs text-slate-500 font-sans">
                {completedResults.length} report(s) successfully evaluated
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedResults.map((result, idx) => (
                <ResultCard key={idx} result={result} />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
