import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Upload, FileText, Cpu, ShieldCheck } from 'lucide-react';
import type { TimelineStep } from '../../types/analytics';

interface TimelineWidgetProps {
  steps: TimelineStep[];
}

const getStepIcon = (step: string) => {
  switch (step.toLowerCase()) {
    case 'upload': return Upload;
    case 'extraction': return FileText;
    case 'classification': return Cpu;
    case 'evaluation': return ShieldCheck;
    case 'completed': return CheckCircle2;
    default: return Clock;
  }
};

export const TimelineWidget: React.FC<TimelineWidgetProps> = ({ steps }) => {
  const [selectedStepIndex, setSelectedStepIndex] = useState(steps.length - 1);

  if (!steps || steps.length === 0) return null;

  const currentStep = steps[selectedStepIndex] || steps[0];
  const StepIcon = getStepIcon(currentStep.step);

  return (
    <div className="w-full h-full flex flex-col justify-between p-2">
      {/* Step Sequence Horizontal Tracker */}
      <div className="relative flex items-center justify-between my-2 px-2">
        {/* Connecting Background Bar */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[3px] bg-neutral-200 dark:bg-white/10 z-0" />

        {steps.map((st, idx) => {
          const Icon = getStepIcon(st.step);
          const isSelected = idx === selectedStepIndex;
          const isCompleted = st.status === 'completed';

          return (
            <button
              key={st.step}
              onClick={() => setSelectedStepIndex(idx)}
              className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
            >
              <motion.div
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${isSelected
                    ? 'bg-gradient-to-tr from-orange-500 to-rose-500 border-white text-white shadow-lg shadow-primary/30'
                    : isCompleted
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                      : 'bg-neutral-100 dark:bg-white/5 border-black/10 dark:border-white/10 text-text-muted'
                  }`}
              >
                <Icon className="w-4 h-4" />
              </motion.div>
              <span className={`text-[10px] font-bold mt-1.5 transition-colors ${isSelected ? 'text-primary' : 'text-text-muted group-hover:text-text-main'
                }`}>
                {st.step}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Step Info Detail Box */}
      <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-between gap-4 mt-2">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <StepIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-main">
                {currentStep.title}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {currentStep.status.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              {currentStep.detail}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-text-muted block uppercase font-bold tracking-wider">Latency</span>
          <span className="text-xs font-mono font-extrabold text-text-main">{currentStep.time}</span>
        </div>
      </div>
    </div>
  );
};
