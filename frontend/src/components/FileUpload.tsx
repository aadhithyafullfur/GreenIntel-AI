import React, { useState, useRef } from 'react';
import { FileText, Check } from 'lucide-react';

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
      className={`relative w-full rounded-xl border border-dashed transition-all duration-300 py-10 px-4 flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-50/30 hover:bg-slate-50/80 hover:shadow-md ${
        isDragActive
          ? 'border-blue-600 bg-blue-50/20 shadow-inner'
          : 'border-[#E2E8F0] hover:border-slate-400 shadow-sm'
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
        className={`absolute -inset-10 bg-gradient-to-tr from-blue-500/10 to-indigo-500/5 rounded-full blur-3xl transition-opacity duration-300 pointer-events-none ${
          isDragActive ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* PDF Upload Icon */}
      <div className={`p-3.5 rounded-full border mb-4 transition-all duration-300 ${
        isDragActive
          ? 'bg-blue-100 border-blue-300 text-blue-600 scale-110 shadow'
          : 'bg-white border-[#E2E8F0] text-[#64748B] shadow-sm'
      }`}>
        <FileText className="w-6 h-6 text-red-500" strokeWidth={1.5} />
      </div>

      {/* Drag & Drop texts */}
      <div className="text-center space-y-1.5 relative z-10">
        <h3 className="text-xs font-semibold text-[#0F172A] font-sans">
          {isDragActive ? 'Drop files to evaluate' : 'Drag & drop your PDF documents here'}
        </h3>
        <p className="text-[11px] text-[#64748B] font-sans">
          or <span className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">browse files</span>
        </p>
      </div>

      {/* Constraints & Support Badges */}
      <div className="mt-6 flex items-center gap-4 text-[9px] font-bold text-[#64748B] uppercase tracking-wider z-10 border-t border-slate-100 pt-4 w-full justify-center">
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

