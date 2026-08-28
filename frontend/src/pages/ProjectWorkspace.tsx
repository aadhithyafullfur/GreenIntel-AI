import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, Upload, FileText, BarChart3, ShieldCheck, Clock, Brain, Settings,
  Sparkles, ArrowLeft, Trash2, Eye, CheckCircle2, AlertCircle,
  MapPin, AlertTriangle, Layers, Download, Bot
} from 'lucide-react';
import {
  getProjectDetails,
  getProjectDocuments,
  uploadProjectDocuments,
  deleteProjectDocument,
  analyzeProject,
  getProjectAnalytics,
  getProjectTimeline,
  getProjectInsights,
  deleteProject,
  downloadProjectReportPDF
} from '../services/projectService';
import type {
  Project,
  ProjectAnalytics,
  ProjectTimelineEvent,
  ProjectInsight
} from '../types/project';
import FileUpload from '../components/FileUpload';
import FullScreenReportModal from '../components/FullScreenReportModal';
import { ProjectAnalyticsDashboard } from '../components/projects/ProjectAnalyticsDashboard';
import { DocumentComparisonModal } from '../components/projects/DocumentComparisonModal';
import { ProjectChatbotPanel } from '../components/projects/ProjectChatbotPanel';
import { Project3DIntelligence } from '../components/projects/Project3DIntelligence';
import type { ClassificationResult } from '../types/document';

export const ProjectWorkspace: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'overview';

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);
  const [timeline, setTimeline] = useState<ProjectTimelineEvent[]>([]);
  const [insights, setInsights] = useState<ProjectInsight[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [highlightedDocIds, setHighlightedDocIds] = useState<string[]>([]);

  const [uploadError, setUploadError] = useState<string | null>(null);

  // Modal report preview state
  const [selectedReport, setSelectedReport] = useState<ClassificationResult | null>(null);

  const loadProjectData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [projData, docsData, timelineData, insightsData] = await Promise.all([
        getProjectDetails(projectId),
        getProjectDocuments(projectId),
        getProjectTimeline(projectId),
        getProjectInsights(projectId)
      ]);

      setProject(projData);
      setDocuments(docsData);
      setTimeline(timelineData);
      setInsights(insightsData);

      // Load analytics
      const analyticsData = await getProjectAnalytics(projectId);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load project workspace:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const handleFilesSelected = async (files: File[]) => {
    if (!projectId) return;
    setUploadError(null);
    setIsUploading(true);

    try {
      await uploadProjectDocuments(projectId, files);
      await loadProjectData();
    } catch (err: any) {
      console.error('Document upload error:', err);
      const errMsg = err.response?.data?.detail || 'Failed to process document upload pipeline.';
      setUploadError(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTriggerAnalyzeProject = async () => {
    if (!projectId) return;
    setIsAnalyzing(true);
    try {
      await analyzeProject(projectId);
      await loadProjectData();
      setActiveTab('analytics');
    } catch (err: any) {
      console.error('Failed to analyze project:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPDFReport = async () => {
    if (!projectId) return;
    try {
      await downloadProjectReportPDF(projectId);
    } catch (err) {
      console.error('Failed to download project report:', err);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!projectId) return;
    if (!window.confirm('Are you sure you want to delete this document from the project?')) return;
    try {
      await deleteProjectDocument(projectId, docId);
      await loadProjectData();
    } catch (err) {
      console.error('Delete document failed:', err);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;
    if (!window.confirm(`Are you sure you want to delete project '${project?.name}' and all its documents? This action cannot be undone.`)) return;
    try {
      await deleteProject(projectId);
      navigate('/projects');
    } catch (err) {
      console.error('Delete project failed:', err);
    }
  };

  if (isLoading && !project) {
    return (
      <div className="p-12 text-center text-xs text-text-muted animate-pulse">
        Loading Project Workspace...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-12 text-center text-xs text-red-500">
        Project not found or unauthorized access.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Workspace Header */}
      <div className="space-y-4">
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects Hub</span>
        </button>

        {/* Command Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-purple-500/10 border border-black/10 dark:border-white/10 backdrop-blur-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase">
                  {project.project_id}
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                  Health: {project.health_badge || 'No Data'} ({project.health_score || 0}/100)
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight font-display">
                {project.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted font-medium">
                <span>{project.project_type}</span>
                {project.client_organization && <span>• {project.client_organization}</span>}
                {(project.city || project.location) && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {project.city || project.location}
                  </span>
                )}
                <span>• {documents.length} Document{documents.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setIsChatOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-orange-500/20 to-rose-500/20 hover:from-orange-500/30 hover:to-rose-500/30 text-orange-600 dark:text-orange-400 border border-orange-500/30 font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              title="Open AI Project Assistant Chatbot"
            >
              <Bot className="w-4 h-4 text-orange-500" />
              <span>AI Project Assistant</span>
            </button>

            {documents.length > 1 && (
              <button
                onClick={() => setIsComparing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-text-main border border-black/5 dark:border-white/10 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4 text-primary" />
                <span>Compare Docs</span>
              </button>
            )}

            <button
              onClick={handleDownloadPDFReport}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-text-main border border-black/5 dark:border-white/10 font-bold text-xs rounded-xl transition-all cursor-pointer"
              title="Download Project Audit Report"
            >
              <Download className="w-4 h-4 text-primary" />
              <span>Project Report</span>
            </button>

            <button
              onClick={handleTriggerAnalyzeProject}
              disabled={isAnalyzing || documents.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing Project...' : 'ANALYZE PROJECT'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Workspace Tabs Header */}
      <div className="flex items-center gap-1.5 border-b border-border-base overflow-x-auto custom-scrollbar pb-1">
        {[
          { id: 'overview', label: 'Overview & Upload', icon: Upload },
          { id: '3d', label: '3D Project Intelligence', icon: Brain },
          { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
          { id: 'analytics', label: 'Project Analytics', icon: BarChart3 },
          { id: 'compliance', label: 'Compliance Checks', icon: ShieldCheck },
          { id: 'timeline', label: 'Timeline', icon: Clock },
          { id: 'insights', label: 'AI Insights', icon: Brain },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-text-muted hover:text-text-main hover:bg-neutral-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT VIEWS */}
      {/* 1. OVERVIEW & UPLOAD TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Uploader Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-card-base p-5 rounded-2xl border border-border-base shadow-sm space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">
                  Upload Sustainability Documents
                </h3>
                <p className="text-[11px] text-text-muted font-sans">
                  Drag & drop PDFs or browse files to add energy, water, waste, audit, or compliance reports.
                </p>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              <FileUpload onFilesSelected={handleFilesSelected} isLoading={isUploading} />
            </div>

            {/* Document Types Checklist */}
            <div className="bg-card-base p-5 rounded-2xl border border-border-base shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Required Documentation Checklist</span>
              </h4>
              <div className="space-y-2 text-xs">
                {['Energy Report', 'Water Report', 'Waste Report', 'Audit Report', 'Compliance Document'].map((type) => {
                  const exists = documents.some((d) => d.document_type === type);
                  return (
                    <div key={type} className="flex items-center justify-between p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border-base">
                      <span className="font-semibold text-text-main font-sans">{type}</span>
                      {exists ? (
                        <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Uploaded
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-text-muted bg-neutral-200 dark:bg-white/10 px-2 py-0.5 rounded">
                          Not uploaded
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Uploaded Document Cards List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">
                Project Documents Pool ({documents.length})
              </h3>

              <div className="flex items-center gap-2">
                {documents.length > 1 && (
                  <button
                    onClick={() => setIsComparing(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-text-main border border-black/5 dark:border-white/10 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>Compare</span>
                  </button>
                )}

                <button
                  onClick={handleTriggerAnalyzeProject}
                  disabled={isAnalyzing || documents.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze All</span>
                </button>
              </div>
            </div>

            {documents.length === 0 ? (
              <div className="border border-dashed border-border-base rounded-3xl p-12 text-center bg-card-base/50 space-y-2">
                <FileText className="w-8 h-8 text-text-muted mx-auto" />
                <h4 className="text-xs font-bold text-text-main">No Documents in Project Workspace</h4>
                <p className="text-xs text-text-muted max-w-xs mx-auto">
                  Upload PDFs using the left uploader to begin automated IGBC classification & compliance analysis.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <motion.div
                    key={doc._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-card-base border border-border-base hover:border-primary/40 shadow-sm transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[10px] font-extrabold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase">
                            {doc.document_type || 'Processing'}
                          </span>
                          <h4 className="text-xs font-bold text-text-main truncate font-sans pt-1" title={doc.filename}>
                            {doc.filename}
                          </h4>
                        </div>

                        <span className={`text-xs font-extrabold font-display px-2.5 py-1 rounded-xl border ${
                          doc.compliance_score >= 80
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : doc.compliance_score >= 60
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}>
                          {doc.compliance_score || 0}%
                        </span>
                      </div>

                      {/* Processing Pipeline Lifecycle */}
                      <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border-base/60 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-extrabold text-text-muted uppercase">
                          <span>Pipeline Lifecycle</span>
                          <span className="text-emerald-500">Completed</span>
                        </div>
                        <div className="flex items-center gap-1 text-[9.5px] font-semibold text-text-muted flex-wrap">
                          <span className="text-emerald-500">✓ Upload</span> →
                          <span className="text-emerald-500">✓ Extract</span> →
                          <span className="text-emerald-500">✓ Classify</span> →
                          <span className="text-emerald-500">✓ Evaluate</span> →
                          <span className="text-emerald-500">✓ Complete</span>
                        </div>
                      </div>

                      {/* Summary Metrics */}
                      <div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
                        <span className="flex items-center gap-1 text-emerald-500 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {doc.passed_checks || 0} Passed
                        </span>
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {(doc.issues || []).length} Issue{(doc.issues || []).length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border-base/60 pt-3">
                      <span className="text-[10px] text-text-muted font-mono">
                        {doc.created_at?.slice(0, 10)}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedReport(doc as ClassificationResult)}
                          className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl border border-primary/20 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Analysis</span>
                        </button>

                        <button
                          onClick={() => handleDeleteDocument(doc._id)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-xl border border-red-500/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3D PROJECT INTELLIGENCE TAB */}
      {activeTab === '3d' && (
        <div className="space-y-6">
          <Project3DIntelligence
            project={project}
            documents={documents}
            highlightedDocIds={highlightedDocIds}
            onOpenModal={(doc) => setSelectedReport(doc)}
          />
        </div>
      )}

      {/* 2. DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <div className="bg-card-base border border-border-base rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-main uppercase tracking-wider font-sans">
              All Project Documents ({documents.length})
            </h3>

            {documents.length > 1 && (
              <button
                onClick={() => setIsComparing(true)}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-xl border border-primary/20 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Compare Selected</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-border-base rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-base bg-black/[0.04] dark:bg-white/[0.05] text-text-muted font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Filename</th>
                  <th className="py-3.5 px-4">Document Type</th>
                  <th className="py-3.5 px-4">Confidence</th>
                  <th className="py-3.5 px-4">Compliance Score</th>
                  <th className="py-3.5 px-4">Issues Found</th>
                  <th className="py-3.5 px-4">Upload Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-text-main">{doc.filename}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] px-2 py-0.5 rounded">
                        {doc.document_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{doc.confidence ? `${(doc.confidence * 100).toFixed(1)}%` : 'N/A'}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-500">{doc.compliance_score || 0}%</td>
                    <td className="py-3.5 px-4 font-bold text-amber-500">{(doc.issues || []).length} Issues</td>
                    <td className="py-3.5 px-4 font-mono text-text-muted">{doc.created_at?.slice(0, 10)}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedReport(doc as ClassificationResult)}
                        className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20 cursor-pointer"
                      >
                        View Analysis
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc._id)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg border border-red-500/20 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PROJECT ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <ProjectAnalyticsDashboard
          project={project}
          analytics={analytics}
          documents={documents}
          isLoading={isLoading}
          onAnalyzeProject={handleTriggerAnalyzeProject}
          isAnalyzing={isAnalyzing}
          onSelectDocument={(doc) => setSelectedReport(doc)}
        />
      )}

      {/* 4. COMPLIANCE CHECKS TAB */}
      {activeTab === 'compliance' && (
        <div className="bg-card-base border border-border-base rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-xs font-bold text-text-main uppercase tracking-wider font-sans">
            Multi-Document IGBC Compliance Checklist Summary
          </h3>

          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc._id} className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-border-base space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="font-extrabold text-text-main text-xs">{doc.filename} ({doc.document_type})</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-500">{doc.compliance_score}% Score</span>
                </div>

                {doc.checks && doc.checks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                    {doc.checks.map((chk: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-card-base border border-border-base flex items-start gap-2.5">
                        {chk.status === 'Compliant' || chk.status === 'Excellent' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-bold text-text-main">{chk.metric}</div>
                          <p className="text-[11px] text-text-muted mt-0.5">{chk.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted">No individual checks recorded.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TIMELINE TAB */}
      {activeTab === 'timeline' && (
        <div className="bg-card-base border border-border-base rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-text-main uppercase tracking-wider font-sans">
            Project Audit & Processing Event Timeline
          </h3>

          <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/20">
            {timeline.map((ev) => (
              <div key={ev._id} className="relative pl-8 space-y-1">
                <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-card-base" />
                <div className="text-xs font-extrabold text-text-main">{ev.title}</div>
                <p className="text-xs text-text-muted">{ev.detail}</p>
                <div className="text-[10px] text-text-muted font-mono">{ev.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. AI INSIGHTS TAB */}
      {activeTab === 'insights' && (
        <div className="bg-card-base border border-border-base rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-text-main uppercase tracking-wider font-sans">
            Cross-Document AI Sustainability Insights
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((ins, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-border-base space-y-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{ins.category}</span>
                <h4 className="text-xs font-extrabold text-text-main">{ins.title}</h4>
                <p className="text-xs text-text-muted leading-relaxed">{ins.description}</p>
                {ins.action && (
                  <div className="text-xs text-emerald-500 font-bold pt-1">
                    Action: {ins.action}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-card-base border border-border-base rounded-3xl p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-text-main uppercase tracking-wider font-sans">
              Project Settings & Danger Zone
            </h3>
            <p className="text-xs text-text-muted">Manage building project configuration or remove workspace.</p>
          </div>

          <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-3">
            <h4 className="text-xs font-extrabold text-red-500 uppercase tracking-wider">Danger Zone</h4>
            <p className="text-xs text-text-muted">
              Deleting this project will permanently remove all associated documents, extractions, compliance evaluations, and timeline logs.
            </p>
            <button
              onClick={handleDeleteProject}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Delete Entire Project Workspace
            </button>
          </div>
        </div>
      )}

      {/* FullScreenReportModal for previewing individual document analysis */}
      {selectedReport && (
        <FullScreenReportModal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          report={selectedReport}
        />
      )}

      {/* DocumentComparisonModal for side-by-side comparison matrix */}
      {isComparing && (
        <DocumentComparisonModal
          isOpen={isComparing}
          onClose={() => setIsComparing(false)}
          documents={documents}
        />
      )}

      {/* Premium Floating AI Assistant Launcher */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4.5 py-3 bg-[#0E0E14]/90 backdrop-blur-2xl hover:bg-[#14141E] text-text-main font-extrabold text-xs rounded-2xl border border-primary/40 shadow-2xl shadow-primary/20 hover:scale-105 transition-all cursor-pointer glow-pulse-amber"
        title="Open AI Intelligence Assistant"
      >
        <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-tr from-orange-500 to-emerald-500 p-0.5">
          <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-2 ring-black" />
          </span>
        </div>
        <div className="flex flex-col text-left">
          <span className="font-display tracking-tight font-extrabold text-white text-xs leading-none">AI Assistant</span>
          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">Online • Real Data</span>
        </div>
      </button>

      {/* Project-Aware AI Chatbot Panel with Real-time Dashboard Connection */}
      <ProjectChatbotPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        project={project}
        documents={documents}
        onOpenDocumentModal={(doc) => setSelectedReport(doc)}
        onHighlightDocs={(docIds) => setHighlightedDocIds(docIds)}
      />
    </div>
  );
};

export default ProjectWorkspace;
