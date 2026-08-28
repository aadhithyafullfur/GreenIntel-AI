import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Trash2, Sparkles, FileText, CheckCircle2, AlertTriangle,
  RefreshCw, ExternalLink, AlertCircle, Bot
} from 'lucide-react';
import {
  sendProjectChatMessage,
  getProjectChatHistory,
  clearProjectChatHistory
} from '../../services/projectService';
import type { Project, ProjectChatMessage } from '../../types/project';

interface ProjectChatbotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  documents: any[];
  onOpenDocumentModal?: (doc: any) => void;
  onHighlightDocs?: (docIds: string[]) => void;
}

const QUICK_QUESTIONS = [
  'Which documents passed?',
  'Show failed checks',
  'What are the biggest issues?',
  'Give me a project summary',
  'Lowest scoring document',
  'What should I fix first?',
  'Compare document scores'
];

export const ProjectChatbotPanel: React.FC<ProjectChatbotPanelProps> = ({
  isOpen,
  onClose,
  project,
  documents,
  onOpenDocumentModal,
  onHighlightDocs
}) => {
  const [messages, setMessages] = useState<ProjectChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load chat history when opened
  useEffect(() => {
    if (isOpen && project?.project_id) {
      loadHistory();
    }
  }, [isOpen, project?.project_id]);

  const triggerDashboardHighlights = (query: string) => {
    if (!onHighlightDocs || !documents.length) return;

    const lower = query.toLowerCase();
    if (lower.includes('failed') || lower.includes('issue') || lower.includes('fix') || lower.includes('lowest')) {
      const failedOrLow = documents
        .filter((d) => (d.compliance_score || 0) < 80 || (d.failed_checks || 0) > 0)
        .map((d) => d._id);
      onHighlightDocs(failedOrLow);
    } else if (lower.includes('pass') || lower.includes('compliant')) {
      const passed = documents
        .filter((d) => (d.compliance_score || 0) >= 80 && (d.failed_checks || 0) === 0)
        .map((d) => d._id);
      onHighlightDocs(passed);
    } else {
      onHighlightDocs([]);
    }
  };

  const loadHistory = async () => {
    setIsInitializing(true);
    try {
      const history = await getProjectChatHistory(project.project_id);
      if (history && history.length > 0) {
        const formattedMsgs: ProjectChatMessage[] = [];
        history.forEach((h: any) => {
          formattedMsgs.push({
            id: `u-${h.id}`,
            sender: 'user',
            text: h.user_message,
            timestamp: h.timestamp
          });
          formattedMsgs.push({
            id: `a-${h.id}`,
            sender: 'ai',
            text: h.assistant_response,
            sources: h.sources || [],
            timestamp: h.timestamp
          });
        });
        setMessages(formattedMsgs);
      } else {
        // Initial welcome message
        setMessages([
          {
            id: 'welcome-msg',
            sender: 'ai',
            text: `Hello! I am your **AI Project Assistant** for **${project.name}**.\n\nI can analyze your uploaded reports, compliance results, identified issues, and extracted metrics based ONLY on this project's actual documents.`,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setIsInitializing(false);
    }
  };


  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || inputValue).trim();
    if (!textToSend || isLoading) return;

    triggerDashboardHighlights(textToSend);

    if (!project?.project_id) {
      console.error("Chat error: project_id is missing");
      const errNoProjectMsg: ProjectChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'Invalid or missing project ID. Please select a valid project workspace.',
        isError: true,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errNoProjectMsg]);
      return;
    }

    console.log("Chat project ID:", project.project_id, "| Message:", textToSend);
    setInputValue('');

    const userMsg: ProjectChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build history payload for context
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await sendProjectChatMessage(project.project_id, textToSend, historyPayload);

      const aiMsg: ProjectChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.answer || "I don't have enough information from the uploaded project documents to answer that.",
        sources: res.sources || [],
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat API error:', err);
      const displayError = err?.message || 'Unable to analyze the project right now. Please try again.';

      const errorAiMsg: ProjectChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `Error: ${displayError}`,
        isError: true,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorAiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear chat history for this project?')) return;
    try {
      await clearProjectChatHistory(project.project_id);
      setMessages([
        {
          id: 'welcome-msg-reset',
          sender: 'ai',
          text: `Chat history cleared. How can I assist you with **${project.name}**?`,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error('Failed to clear chat history:', err);
    }
  };

  const handleSourceClick = (filename: string) => {
    if (!onOpenDocumentModal) return;
    const foundDoc = documents.find(
      (d) => d.filename?.toLowerCase() === filename.toLowerCase() || d.document_type?.toLowerCase() === filename.toLowerCase()
    );
    if (foundDoc) {
      onOpenDocumentModal(foundDoc);
    }
  };

  const renderFormattedMarkdown = (text: string) => {
    // Simple markdown-to-styled-elements renderer
    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-xs leading-relaxed font-sans text-neutral-200">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          if (!trimmed) return <div key={idx} className="h-1" />;

          // Headers
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-xs font-extrabold text-primary uppercase tracking-wider mt-3 mb-1">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
            return (
              <h3 key={idx} className="text-sm font-extrabold text-white uppercase tracking-wider mt-3 mb-1 border-b border-white/10 pb-1">
                {trimmed.replace(/#+\s*/, '')}
              </h3>
            );
          }

          // Lists
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const content = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-primary font-bold">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
              </div>
            );
          }

          // Pass/Fail Status Lines
          if (trimmed.startsWith('✓')) {
            return (
              <div key={idx} className="flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed.substring(1)) }} />
              </div>
            );
          }

          if (trimmed.startsWith('⚠')) {
            return (
              <div key={idx} className="flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed.substring(1)) }} />
              </div>
            );
          }

          if (trimmed.startsWith('✕')) {
            return (
              <div key={idx} className="flex items-center gap-2 px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed.substring(1)) }} />
              </div>
            );
          }

          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
          );
        })}
      </div>
    );
  };

  const formatInlineMarkdown = (str: string) => {
    let formatted = str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-neutral-300">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-black/40 text-primary font-mono text-[11px]">$1</code>');
    return formatted;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-lg h-full bg-neutral-900 border-l border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-neutral-900/90 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white font-display">AI Project Assistant</h3>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Ready</span>
                </div>
                <p className="text-[11px] text-neutral-400 truncate max-w-[220px]">
                  {project.name} ({documents.length} docs)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClearHistory}
                className="p-2 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 bg-neutral-950/60 border-b border-white/5 overflow-x-auto custom-scrollbar flex items-center gap-2">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-orange-400" /> Prompts:
            </span>
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 border border-white/10 hover:border-orange-500/30 text-neutral-300 whitespace-nowrap transition-all cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-neutral-950/40">
            {isInitializing ? (
              <div className="flex items-center justify-center h-full text-neutral-500 text-xs gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                <span>Initializing Project Context...</span>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs space-y-2 border ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white border-orange-400/20 rounded-br-none shadow-lg shadow-orange-500/10'
                        : msg.isError
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 rounded-bl-none'
                        : 'bg-neutral-900 border-white/10 text-neutral-200 rounded-bl-none shadow-md'
                    }`}
                  >
                    {msg.sender === 'ai' ? (
                      renderFormattedMarkdown(msg.text)
                    ) : (
                      <p className="font-sans leading-relaxed">{msg.text}</p>
                    )}

                    {/* Sources Cards */}
                    {msg.sender === 'ai' && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-white/10 space-y-1.5">
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Sources ({msg.sources.length}):
                        </span>
                        <div className="space-y-1">
                          {msg.sources.map((src, sIdx) => (
                            <div
                              key={sIdx}
                              onClick={() => handleSourceClick(src.filename)}
                              className="p-2 rounded-lg bg-black/40 hover:bg-orange-500/10 border border-white/10 hover:border-orange-500/30 text-[11px] flex items-center justify-between cursor-pointer group transition-all"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                <span className="font-medium text-white group-hover:text-orange-400 truncate">
                                  {src.filename}
                                </span>
                                {src.page && (
                                  <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-neutral-400">
                                    Page {src.page}
                                  </span>
                                )}
                              </div>
                              <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-orange-400 shrink-0 ml-2" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-600 mt-1 px-1">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              ))
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-900 border border-white/10 text-xs text-orange-400 max-w-[75%]">
                <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                <span className="font-medium animate-pulse">Analyzing project documents...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-neutral-900 border-t border-white/10 space-y-2">
            <div className="relative flex items-center">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about your project..."
                rows={1}
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-black/60 border border-white/10 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 text-white placeholder-neutral-500 text-xs resize-none outline-none custom-scrollbar"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 p-2 rounded-lg bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white disabled:opacity-30 transition-all cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-neutral-500 px-1">
              <span>Grounded on actual project files</span>
              <span>Press Enter to send</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
