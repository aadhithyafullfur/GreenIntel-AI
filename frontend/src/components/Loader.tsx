import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoaderProps {
  message?: string;
  subMessage?: string;
}

const Loader: React.FC<LoaderProps> = ({
  message = "Analyzing PDF Documents",
  subMessage = "Extracting text and running DistilBERT classifier..."
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="relative w-16 h-16 mb-5 flex items-center justify-center">
        {/* Glowing background halo */}
        <div className="absolute inset-0 rounded-full bg-blue-500/8 blur-xl animate-pulse"></div>

        {/* Core spinning loader */}
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" strokeWidth={2} />
        
        {/* Core sparkling icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
        </div>
      </div>

      <div className="text-center max-w-sm space-y-1.5">
        <h3 className="text-base font-semibold text-slate-800 font-display tracking-tight">
          {message}
        </h3>
        <p className="text-xs text-slate-500 font-sans leading-relaxed">
          {subMessage}
        </p>
      </div>
    </div>
  );
};

export default Loader;
