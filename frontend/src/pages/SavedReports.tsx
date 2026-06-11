import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, FileText, ArrowDownToLine, Share2, Trash } from 'lucide-react';

const SavedReports: React.FC = () => {
  const savedItems = [
    {
      id: 'saved-1',
      title: 'Phase 2 Energy Conservation Audit',
      filename: 'IGBC_Energy_Compliance_Final_Report_v2.pdf',
      dateSaved: 'June 10, 2026',
      score: 94,
      metrics: '5 key parameters extracted'
    },
    {
      id: 'saved-2',
      title: 'Water Recycling & Treatment Assessment',
      filename: 'Water_Recycling_Audit_GreenTower_2026.pdf',
      dateSaved: 'June 09, 2026',
      score: 88,
      metrics: '4 key parameters extracted'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-border-base pb-4 space-y-1">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-text-main font-display">Saved Reports</h1>
        </div>
        <p className="text-[11px] text-text-muted font-sans">
          Access your bookmarked evaluation reports and compliance checks.
        </p>
      </div>

      {savedItems.length === 0 ? (
        <div className="border border-dashed border-border-base rounded-xl p-8 text-center bg-card-base/50 min-h-[300px] flex flex-col items-center justify-center">
          <Bookmark className="w-8 h-8 text-text-muted mb-2" />
          <h3 className="text-xs font-bold text-text-main">No Saved Reports</h3>
          <p className="text-[11px] text-text-muted mt-1 max-w-xs font-sans">
            Bookmark reports directly from your evaluation dashboard to save them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card-base/40 border border-border-base rounded-xl p-5 hover:border-primary/40 transition-all shadow-sm space-y-4 relative"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1 min-w-0">
                  <h3 className="text-xs font-bold text-text-main truncate" title={item.title}>
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10.5px] text-text-muted font-mono font-sans truncate">
                    <FileText className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
                    <span>{item.filename}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  {item.score}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10.5px] text-text-muted font-sans border-t border-border-base/40 pt-3">
                <span>Saved {item.dateSaved}</span>
                <span className="font-semibold text-text-main">{item.metrics}</span>
              </div>

              {/* Action row */}
              <div className="flex items-center gap-2 pt-1">
                <button 
                  onClick={() => alert("Downloading PDF summary report...")}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-[11px] font-semibold rounded-lg cursor-pointer transition-all"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  <span>Download Report</span>
                </button>
                
                <button 
                  onClick={() => alert("Copying share link to clipboard...")}
                  className="p-1.5 bg-card-base border border-border-base hover:border-primary/40 hover:bg-primary/5 text-text-main rounded-lg cursor-pointer transition-all"
                  title="Share Report"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => alert("Report removed from saved bookmarks.")}
                  className="p-1.5 bg-card-base border border-border-base hover:border-red-500/40 hover:bg-red-500/5 text-text-muted hover:text-red-500 rounded-lg cursor-pointer transition-all"
                  title="Delete Bookmark"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedReports;
