import React, { useState, useRef } from 'react';
import { FileText, Check, Loader2, Sparkles } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  isLoading: boolean;
}

const PIPELINE_STAGES = [
  'Uploaded',
  'Extracting',
  'Classifying',
  'Extracting Metrics',
  'Evaluating Compliance',
  'Analysis Complete'
];

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, isLoading }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const validateAndAddFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const validatedFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        validatedFiles.push(file);
      }
    }
    if (validatedFiles.length > 0) {
      onFilesSelected(validatedFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
  };

  const onButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 py-9 px-4 flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-card-base/60 hover:bg-primary/5 hover:border-primary/60 hover:shadow-lg card-3d ${
          isDragActive
            ? 'border-primary bg-primary/10 scale-[1.01] shadow-xl'
            : 'border-border-base shadow-sm'
        } ${isLoading ? 'pointer-events-none opacity-85' : ''}`}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="application/pdf"
          className="hidden"
          onChange={handleChange}
        />

        {/* Ambient Radial Glow */}
        <div
          className={`absolute -inset-10 bg-gradient-to-tr from-primary/15 via-rose-500/10 to-transparent rounded-full blur-3xl transition-opacity duration-300 pointer-events-none ${
            isDragActive || isLoading ? 'opacity-100' : 'opacity-30'
          }`}
        />

        {/* Upload Icon or Spinning Loader */}
        <div
          className={`p-4 rounded-2xl border mb-3.5 transition-all duration-300 relative z-10 ${
            isDragActive
              ? 'bg-primary/20 border-primary/40 text-primary scale-110 shadow-md'
              : 'bg-card-base border-border-base text-text-muted shadow-sm'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          ) : (
            <FileText className="w-6 h-6 text-rose-500 dark:text-rose-400" strokeWidth={1.75} />
          )}
        </div>

        {/* Text Guidelines */}
        <div className="text-center space-y-1 relative z-10">
          <h3 className="text-xs font-bold text-text-main font-display">
            {isLoading
              ? 'Evaluating Sustainability Document...'
              : isDragActive
              ? 'Release to upload PDF document'
              : 'Drag & drop your PDF documents here'}
          </h3>
          <p className="text-[11px] text-text-muted font-sans font-medium">
            or{' '}
            <button
              type="button"
              className="text-primary font-extrabold hover:underline cursor-pointer focus:outline-none"
            >
              Browse files
            </button>
          </p>
        </div>

        {/* Badges */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[9px] font-extrabold text-text-muted uppercase tracking-wider z-10 border-t border-border-base/70 pt-3.5 w-full">
          <span className="flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-500" strokeWidth={2.5} />
            <span>PDF Reports Only</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-border-base" />
          <span className="flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-500" strokeWidth={2.5} />
            <span>IGBC Standard Audit</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-border-base" />
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" strokeWidth={2} />
            <span>AI Rule Pipeline</span>
          </span>
        </div>
      </div>

      {/* Visual 6-Stage Processing Pipeline Indicator */}
      <div className="p-3.5 rounded-2xl bg-card-base border border-border-base shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9.5px] font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-primary" /> Processing Pipeline Sequence
          </span>
          {isLoading && (
            <span className="text-[9px] font-bold text-primary animate-pulse bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase">
              Active Evaluation
            </span>
          )}
        </div>

        <div className="grid grid-cols-6 gap-1 pt-1">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCompleted = !isLoading;
            const isCurrent = isLoading && idx === 2; // Active step indicator representation

            return (
              <div key={stage} className="flex flex-col items-center space-y-1 text-center">
                <div
                  className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500'
                      : isCurrent
                      ? 'bg-primary animate-pulse shadow-sm shadow-primary/50'
                      : 'bg-border-base'
                  }`}
                />
                <span
                  className={`text-[8px] font-bold truncate max-w-full font-sans ${
                    isCompleted
                      ? 'text-text-main'
                      : isCurrent
                      ? 'text-primary'
                      : 'text-text-muted/60'
                  }`}
                  title={stage}
                >
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;


