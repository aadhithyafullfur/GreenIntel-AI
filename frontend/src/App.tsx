import React from 'react';
import Home from './pages/Home';
import { Brain, ShieldCheck } from 'lucide-react';
import ThemeToggle from './components/ThemeToggle';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-base bg-grid-pattern text-text-main flex flex-col font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-350">
      {/* Top Sticky Navigation */}
      <header className="sticky top-0 z-50 bg-card-base/80 dark:bg-bg-base/80 backdrop-blur-xl border-b border-border-base transition-colors duration-350">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand Group */}
          <div className="flex items-center gap-3 group">
            {/* Logo Icon Wrapper */}
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-primary shadow-sm shadow-primary/20 transition-transform group-hover:scale-[1.02]">
              <Brain className="w-5 h-5 text-white" />
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-text-main flex items-center gap-2">
                <span>GreenIntel AI</span>
                <span className="text-[10px] font-medium bg-primary/10 border border-primary/25 text-primary px-1.5 py-0.5 rounded-md">
                  Enterprise
                </span>
              </span>
              <span className="text-[9px] text-text-muted font-medium tracking-wider uppercase">
                Compliance Intelligence
              </span>
            </div>
          </div>

          {/* Right Header Controls: Badges & ThemeToggle */}
          <div className="flex items-center gap-3">
            {/* IGBC Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-card-base border border-border-base rounded-lg text-[10.5px] font-semibold text-text-main shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>IGBC Certified Standard</span>
            </div>

            {/* Active Status Badge */}
            <div className="flex items-center gap-2 text-[10.5px] font-medium text-text-main bg-card-base border border-border-base px-3 py-1.5 rounded-lg shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>IGBC Evaluation Platform</span>
            </div>

            {/* Theme Toggle Button */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Home />
      </main>

      {/* Enterprise Footer */}
      <footer className="bg-card-base/40 dark:bg-bg-base/40 border-t border-border-base py-6 text-center transition-colors duration-350">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="text-xs text-text-muted font-medium">
            © {new Date().getFullYear()} GreenIntel AI. All rights reserved.
          </p>
          <p className="text-[10px] text-text-muted/70 font-normal">
            Designed for Indian Green Building Council (IGBC) taxonomy standards. Compliance Intelligence and Automated Evaluation.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;

