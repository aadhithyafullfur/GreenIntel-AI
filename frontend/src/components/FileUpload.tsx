import React, { useState, useRef } from 'react';
import { UploadCloud, Check } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  isLoading: boolean;
}

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
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={onButtonClick}
      className={`relative w-full rounded-xl border border-dashed transition-all duration-200 py-6 px-4 flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-50/50 hover:bg-slate-50/80 ${
        isDragActive
          ? 'border-blue-500 bg-blue-50/30 shadow-sm'
          : 'border-slate-300 hover:border-slate-400/80 shadow-sm'
      } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
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

      {/* Decorative Glow */}
      <div 
        className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl transition-opacity duration-200 ${
          isDragActive ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Upload Icon */}
      <div className={`p-2.5 rounded-lg border mb-3 transition-all duration-200 ${
        isDragActive
          ? 'bg-blue-100/50 border-blue-200 text-blue-600 scale-105'
          : 'bg-white border-slate-200 text-slate-400'
      }`}>
        <UploadCloud className="w-5 h-5" strokeWidth={1.5} />
      </div>

      {/* Drag & Drop texts */}
      <div className="text-center space-y-1 relative z-10">
        <h3 className="text-xs font-semibold text-slate-700 font-display">
          {isDragActive ? 'Drop your files to evaluate' : 'Drag & drop your PDF documents here'}
        </h3>
        <p className="text-[11px] text-slate-500 font-sans">
          or <span className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">browse files</span>
        </p>
      </div>

      {/* Constraints & Support Badges */}
      <div className="mt-4 flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-wider z-10 border-t border-slate-100 pt-3 w-full justify-center">
        <span className="flex items-center gap-1">
          <Check className="w-3 h-3 text-emerald-500" strokeWidth={2.5} />
          <span>PDF Reports only</span>
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-200/50" />
        <span className="flex items-center gap-1">
          <Check className="w-3 h-3 text-emerald-500" strokeWidth={2.5} />
          <span>Multiple Files</span>
        </span>
      </div>
    </div>
  );
};

export default FileUpload;

