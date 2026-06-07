import React from 'react';
import Home from './pages/Home';
import { BrainCircuit } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] bg-grid-pattern text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* Top Sticky Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand Group */}
          <div className="flex items-center gap-3 group">
            {/* Eco-Tech Brain Icon Wrapper */}
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 shadow-md shadow-blue-500/10 transition-transform group-hover:scale-105">
              <div className="absolute inset-0.5 rounded-[10px] bg-white flex items-center justify-center">
                <BrainCircuit className="w-5.5 h-5.5 text-blue-600" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-800 flex items-center gap-1.5 font-display">
                <span>IGBC Document Evaluation</span>
                <span className="text-[10px] font-semibold bg-blue-50 border border-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md">
                  V1.0
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                AI Classification Portal
              </span>
            </div>
          </div>

          {/* Right Header Controls: Model Status & User Profile */}
          <div className="flex items-center gap-4">
            {/* Active Status Badge */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>DistilBERT + Groq: Online</span>
            </div>

            {/* User Profile Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1.5px] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-blue-600">
                AD
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Home />
      </main>

      {/* Enterprise Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="text-xs text-slate-400 font-medium">
            © {new Date().getFullYear()} IGBC Document Evaluation System. All rights reserved.
          </p>
          <p className="text-[10px] text-slate-400/80 font-normal">
            Designed for Indian Green Building Council (IGBC) taxonomy standards. Powered by PyMuPDF extraction & DistilBERT transformers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
