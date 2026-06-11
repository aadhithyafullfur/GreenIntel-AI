import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Calendar, ArrowDownToLine, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const History: React.FC = () => {
  // Mock evaluations history
  const historyData = [
    {
      id: 'eval-1',
      filename: 'IGBC_Energy_Compliance_Final_Report_v2.pdf',
      type: 'Energy Report',
      score: 94,
      status: 'Excellent',
      date: '2026-06-10',
      checksPassed: '5/6 checks'
    },
    {
      id: 'eval-2',
      filename: 'Water_Recycling_Audit_GreenTower_2026.pdf',
      type: 'Water Report',
      score: 88,
      status: 'Compliant',
      date: '2026-06-08',
      checksPassed: '4/5 checks'
    },
    {
      id: 'eval-3',
      filename: 'Solid_Waste_Management_Plan_Phase3.pdf',
      type: 'Waste Report',
      score: 82,
      status: 'Compliant',
      date: '2026-05-24',
      checksPassed: '4/4 checks'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-base pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-text-main font-display">Evaluation History</h1>
          </div>
          <p className="text-[11px] text-text-muted font-sans">
            Review and download all your past sustainability document evaluations.
          </p>
        </div>
        
        <Link 
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all"
        >
          <span>Evaluate New Document</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="bg-card-base/40 border border-border-base rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border-base bg-card-base flex items-center justify-between">
          <span className="text-xs font-bold text-text-main uppercase tracking-wider">Historical Logs</span>
          <button className="text-[10px] font-bold text-red-500 hover:text-red-600 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded cursor-pointer">
            Clear Logs
          </button>
        </div>

        <div className="divide-y divide-border-base/40">
          {historyData.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-card-base/60 transition-colors"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-text-main truncate" title={item.filename}>
                    {item.filename}
                  </span>
                  <span className="text-[9.5px] font-semibold bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-md">
                    {item.type}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-[10.5px] text-text-muted font-sans">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-text-muted/75" />
                    <span>{item.date}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-border-base" />
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{item.checksPassed}</span>
                  </div>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center gap-4 justify-between md:justify-end">
                <div className="text-right">
                  <div className="text-sm font-bold text-text-main">{item.score}%</div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {item.status}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => alert("Downloading PDF summary report...")}
                    className="p-2 bg-card-base border border-border-base hover:border-primary/40 hover:bg-primary/5 text-text-main rounded-lg cursor-pointer transition-all"
                    title="Download Report"
                  >
                    <ArrowDownToLine className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => alert("Report deleted from logs.")}
                    className="p-2 bg-card-base border border-border-base hover:border-red-500/40 hover:bg-red-500/5 text-text-muted hover:text-red-500 rounded-lg cursor-pointer transition-all"
                    title="Delete Log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
