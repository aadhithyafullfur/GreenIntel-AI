import React from 'react';
import Home from './pages/Home';
import { Brain, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] bg-grid-pattern text-[#0F172A] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* Top Sticky Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand Group */}
          <div className="flex items-center gap-3 group">
            {/* Logo Icon Wrapper */}
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 shadow-sm transition-transform group-hover:scale-[1.02]">
              <Brain className="w-5 h-5 text-white" />
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-[#0F172A] flex items-center gap-2">
                <span>GreenIntel AI</span>
                <span className="text-[10px] font-medium bg-blue-50 border border-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md">
                  Enterprise
                </span>
              </span>
              <span className="text-[9px] text-[#64748B] font-medium tracking-wider uppercase">
                Compliance Intelligence
              </span>
            </div>
          </div>

          {/* Right Header Controls: IGBC Badge & Status */}
          <div className="flex items-center gap-4">
            {/* IGBC Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-md text-[10.5px] font-semibold text-[#0F172A]">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>IGBC Certified Standard</span>
            </div>

            {/* Active Status Badge */}
            <div className="flex items-center gap-2 text-[10.5px] font-medium text-[#0F172A] bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-md shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>IGBC Evaluation Platform</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Home />
      </main>

      {/* Enterprise Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-6 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="text-xs text-[#64748B] font-medium">
            © {new Date().getFullYear()} GreenIntel AI. All rights reserved.
          </p>
          <p className="text-[10px] text-[#64748B]/70 font-normal">
            Designed for Indian Green Building Council (IGBC) taxonomy standards. Compliance Intelligence and Automated Evaluation.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;

