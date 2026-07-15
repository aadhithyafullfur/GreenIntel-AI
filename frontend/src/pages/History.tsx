import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Calendar, ArrowDownToLine, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface EvaluationLog {
  id: string;
  filename: string;
  type: string;
  score: number;
  status: string;
  date: string;
  checksPassed: string;
}

const History: React.FC = () => {
  const [historyData, setHistoryData] = useState<EvaluationLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/evaluations/history');
      setHistoryData(response.data);
    } catch (err: any) {
      console.error("Failed to load history:", err);
      setError(err.response?.data?.detail || "Failed to load evaluation history from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearLogs = async () => {
    const confirmClear = window.confirm("Are you sure you want to clear all evaluation logs? This action is permanent and cannot be undone.");
    if (!confirmClear) return;

    try {
      await api.post('/api/evaluations/clear-logs');
      alert("Logs cleared successfully.");
      setHistoryData([]);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to clear logs.");
    }
  };

  const handleDeleteLog = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this specific evaluation log?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/api/evaluations/${id}`);
      alert("Evaluation log deleted successfully.");
      setHistoryData(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete log.");
    }
  };

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
          {historyData.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="text-[10px] font-bold text-red-500 hover:text-white hover:bg-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded cursor-pointer transition-colors"
            >
              Clear Logs
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs font-semibold text-text-muted font-sans">
            Loading evaluation logs...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs font-semibold text-red-500 font-sans">
            {error}
          </div>
        ) : historyData.length === 0 ? (
          <div className="p-8 text-center bg-card-base/50 min-h-[200px] flex flex-col items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-text-muted mb-2" />
            <h3 className="text-xs font-bold text-text-main">No evaluation history available.</h3>
            <p className="text-[11px] text-text-muted mt-1 max-w-xs font-sans">
              Evaluate your sustainability documents to start building your compliance logs history.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-base/40">
            {historyData.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
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
                      onClick={() => handleDeleteLog(item.id)}
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
        )}
      </div>
    </div>
  );
};

export default History;
