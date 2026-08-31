import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2, FileText, ArrowRight, MapPin,
  Calendar, Layers, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../types/project';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  // Helper to format health / status badge text & colors
  const getStatusBadge = () => {
    const rawBadge = (project.health_badge || project.status || 'Good').toUpperCase();
    
    // Normalize into standard status categories
    if (rawBadge.includes('EXCELLENT') || rawBadge.includes('PASS') || rawBadge.includes('ACTIVE')) {
      return {
        label: 'EXCELLENT',
        style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
      };
    }
    if (rawBadge.includes('GOOD') || rawBadge.includes('REVIEW')) {
      return {
        label: 'GOOD',
        style: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
      };
    }
    if (rawBadge.includes('WARNING') || rawBadge.includes('IMPROVEMENT') || rawBadge.includes('NEEDS')) {
      return {
        label: 'WARNING',
        style: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
      };
    }
    if (rawBadge.includes('NON') || rawBadge.includes('RISK') || rawBadge.includes('FAIL')) {
      return {
        label: 'NON-COMPLIANT',
        style: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
      };
    }

    return {
      label: rawBadge,
      style: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/30'
    };
  };

  const statusBadge = getStatusBadge();

  // Compliance Score formatting
  const complianceScore =
    project.overall_compliance_score !== null && project.overall_compliance_score !== undefined
      ? Math.round(project.overall_compliance_score)
      : null;

  // Circular progress math
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progressOffset =
    complianceScore !== null ? circumference - (complianceScore / 100) * circumference : circumference;

  const getComplianceColor = (score: number | null) => {
    if (score === null) return '#94A3B8';
    if (score >= 80) return '#10B981'; // Emerald
    if (score >= 50) return '#F97316'; // Brand Orange
    return '#EF4444'; // Red
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toISOString().split('T')[0];
    } catch {
      return dateStr.slice(0, 10);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col justify-between h-full rounded-2xl bg-card-base border border-border-base hover:border-orange-500/50 p-5.5 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 backdrop-blur-xl"
    >
      {/* Subtle top border accent line on hover */}
      <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-orange-500/0 group-hover:via-orange-500/60 to-transparent transition-all duration-300 rounded-t-full pointer-events-none" />

      <div className="space-y-4">
        {/* Top Header Row: Glass Icon + Project ID + Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Consistent Glass Icon Container with dark background, orange border, orange icon & subtle glow */}
            <div className="w-11 h-11 rounded-xl bg-black/40 dark:bg-white/5 border border-orange-500/40 text-orange-500 flex items-center justify-center shadow-sm shadow-orange-500/10 shrink-0 group-hover:border-orange-500 group-hover:shadow-orange-500/20 transition-all duration-300">
              <Building2 className="w-5.5 h-5.5 text-orange-500 dark:text-orange-400" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-extrabold text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/25 px-2 py-0.5 rounded uppercase tracking-wider">
                  {project.project_id}
                </span>
              </div>
            </div>
          </div>

          {/* Compact Status Badge */}
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider shrink-0 ${statusBadge.style}`}>
            {statusBadge.label}
          </span>
        </div>

        {/* Project Name & Subtitle Info */}
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-text-main font-display truncate group-hover:text-orange-500 transition-colors leading-tight">
            {project.name}
          </h3>

          {project.client_organization && (
            <p className="text-xs text-text-muted font-medium truncate">
              {project.client_organization}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-muted font-medium pt-1">
            <span className="inline-flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 px-2 py-0.5 rounded-md">
              <Layers className="w-3 h-3 text-orange-500/80" />
              <span>{project.project_type || 'Commercial'}</span>
            </span>

            {(project.city || project.location) && (
              <span className="inline-flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 px-2 py-0.5 rounded-md truncate max-w-[160px]">
                <MapPin className="w-3 h-3 text-orange-500/80 shrink-0" />
                <span className="truncate">{project.city || project.location}</span>
              </span>
            )}
          </div>
        </div>

        {/* Key Metrics Section: Documents & Compliance Score */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 items-center">
          {/* Documents count */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-sans">
              Documents
            </span>
            <div className="flex items-baseline gap-1.5 text-text-main">
              <div className="p-1 rounded-md bg-orange-500/10 text-orange-500 inline-flex">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <span className="text-base font-extrabold font-display">{project.documents_count || 0}</span>
              <span className="text-[11px] text-text-muted font-medium">files</span>
            </div>
          </div>

          {/* Compliance Score Circular Meter */}
          <div className="space-y-1 flex flex-col items-end sm:items-start pl-2 border-l border-black/5 dark:border-white/5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-sans">
              Compliance
            </span>
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 -rotate-90" viewBox="0 0 44 44">
                  <circle
                    cx="22"
                    cy="22"
                    r={radius}
                    className="stroke-black/10 dark:stroke-white/10"
                    strokeWidth="3.5"
                    fill="transparent"
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r={radius}
                    stroke={getComplianceColor(complianceScore)}
                    strokeWidth="3.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <Sparkles className="w-3 h-3 absolute text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <span className="text-base font-extrabold text-text-main font-display">
                  {complianceScore !== null ? `${complianceScore}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="flex items-center justify-between text-[10px] text-text-muted font-mono pt-0.5">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3 text-text-muted/60" />
            Created: {formatDate(project.created_at)}
          </span>
          <span>Updated: {formatDate(project.updated_at)}</span>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="pt-4 mt-4 border-t border-black/[0.06] dark:border-white/[0.08] grid grid-cols-2 gap-2.5 items-center">
        {/* Secondary: Analyze Project */}
        <button
          type="button"
          onClick={() => navigate(`/projects/${project.project_id}?tab=analytics`)}
          className="w-full px-3 py-2 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.05] dark:hover:bg-white/[0.10] text-[11px] font-bold text-text-main border border-black/10 dark:border-white/10 hover:border-orange-500/30 transition-all cursor-pointer text-center truncate"
        >
          Analyze Project
        </button>

        {/* Primary: Workspace */}
        <button
          type="button"
          onClick={() => navigate(`/projects/${project.project_id}`)}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-[0.98] text-white font-extrabold text-[11px] shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/35 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border border-white/20 uppercase tracking-wider"
        >
          <span>Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
