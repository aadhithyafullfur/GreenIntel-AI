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
      className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 py-10 px-6 flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-white ${
        isDragActive
          ? 'border-blue-500 bg-blue-50/50 shadow-md scale-[1.005]'
          : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50 shadow-sm hover:shadow'
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
        className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl transition-opacity duration-300 ${
          isDragActive ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Upload Icon */}
      <div className={`p-4 rounded-full border mb-4 transition-all duration-300 ${
        isDragActive
          ? 'bg-blue-100 border-blue-200 text-blue-600 scale-110'
          : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:text-blue-500'
      }`}>
        <UploadCloud className="w-8 h-8" strokeWidth={1.75} />
      </div>

      {/* Drag & Drop texts */}
      <div className="text-center space-y-1.5 relative z-10">
        <h3 className="text-base font-semibold text-slate-800 font-display">
          {isDragActive ? 'Drop your files to evaluate' : 'Drag & drop your PDF documents here'}
        </h3>
        <p className="text-sm text-slate-500 font-sans">
          or <span className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">browse files</span> from your computer
        </p>
      </div>

      {/* Constraints & Support Badges */}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider z-10 border-t border-slate-100 pt-4 w-full justify-center">
        <span className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-500" strokeWidth={3} />
          <span>PDF Reports only</span>
        </span>
        <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-slate-200" />
        <span className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-500" strokeWidth={3} />
          <span>Multiple Files Supported</span>
        </span>
      </div>
    </div>
  );
};

export default FileUpload;
