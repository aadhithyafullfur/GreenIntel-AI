import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, FolderKanban, ShieldCheck,
  FileText, Zap
} from 'lucide-react';
import type { Project } from '../../types/project';
import { Building3DVisual } from './Building3DVisual';

interface ProjectsHubHeaderProps {
  userName?: string;
  projects: Project[];
  onCreateProject: () => void;
  isLoading?: boolean;
}

export const ProjectsHubHeader: React.FC<ProjectsHubHeaderProps> = ({
  userName = 'Sustainability Lead',
  projects,
  onCreateProject,
  isLoading = false,
}) => {
  // Real statistical computations derived from projects array
  const stats = useMemo(() => {
    const totalProjects = projects.length;

    const activeProjects = projects.filter((p) => {
      if (!p.status) return true;
      const statusLower = p.status.toLowerCase();
      return statusLower === 'active' || statusLower === 'in review' || statusLower === 'ongoing';
    }).length;

    const projectsWithScores = projects.filter(
      (p) => p.overall_compliance_score !== null && p.overall_compliance_score !== undefined
    );

    const averageComplianceScore =
      projectsWithScores.length > 0
        ? Math.round(
            projectsWithScores.reduce((acc, p) => acc + (p.overall_compliance_score || 0), 0) /
              projectsWithScores.length
          )
        : null;

    const totalDocuments = projects.reduce((acc, p) => acc + (p.documents_count || 0), 0);

    return {
      totalProjects,
      activeProjects,
      averageComplianceScore,
      totalDocuments,
    };
  }, [projects]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl p-6 sm:p-8 backdrop-blur-2xl bg-gradient-to-br from-white/90 via-slate-50/85 to-amber-50/20 dark:from-[#0f0f15]/90 dark:via-[#14141d]/85 dark:to-[#0b0b10]/95 border border-black/10 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-[0_25px_50px_rgba(0,0,0,0.6)] group transition-all duration-300"
    >
      {/* Subtle Orange Radial Glow Overlay */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-500/10 dark:bg-orange-500/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-rose-500/5 dark:bg-amber-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Decorative 3D Architectural Building Canvas (Right Side) */}
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 md:w-5/12 lg:w-4/12 pointer-events-none overflow-hidden rounded-r-3xl z-0 hidden sm:block">
        <Building3DVisual />
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 space-y-6">
        {/* Top Header Card Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Title & Welcome Details */}
          <div className="flex items-start sm:items-center gap-4 max-w-2xl">
            {/* Premium Glassy Icon Container */}
            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-amber-500/20 border border-orange-500/30 dark:border-orange-500/40 text-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/15 shrink-0 group-hover:scale-105 transition-transform duration-300">
              <FolderKanban className="w-7 h-7 text-orange-500 dark:text-orange-400" />
            </div>

            <div className="space-y-1.5 min-w-0">
              {/* Title + Isolated Workspace Badge */}
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight font-display">
                  Projects Hub
                </h1>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-500/10 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 dark:border-orange-500/40 shadow-sm shadow-orange-500/10 backdrop-blur-md shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  USER ISOLATED WORKSPACE
                </span>
              </div>

              {/* Personalized Welcome Message */}
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Welcome back,{' '}
                <span className="font-bold text-orange-600 dark:text-orange-400">
                  {userName}
                </span>
                . Manage building portfolios & document compliance evaluations.
              </p>
            </div>
          </div>

          {/* Right Action: Create New Project Button */}
          <div className="shrink-0 self-start lg:self-center">
            <button
              onClick={onCreateProject}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-orange-500 via-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border border-white/20 uppercase tracking-wider"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>CREATE NEW PROJECT</span>
            </button>
          </div>
        </div>

        {/* Bottom Statistics Bar */}
        <div className="pt-5 border-t border-black/[0.08] dark:border-white/[0.08]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Stat 1: Total Projects */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="p-3.5 sm:p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md hover:border-orange-500/30 dark:hover:border-orange-500/40 hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-all duration-200 flex items-center gap-3.5 group/stat"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shrink-0 group-hover/stat:scale-110 transition-transform">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-text-main font-display tracking-tight">
                  {isLoading ? (
                    <span className="inline-block w-8 h-6 bg-text-muted/20 animate-pulse rounded" />
                  ) : (
                    stats.totalProjects
                  )}
                </div>
                <div className="text-[11px] font-medium text-text-muted">Total Projects</div>
              </div>
            </motion.div>

            {/* Stat 2: Active Projects */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="p-3.5 sm:p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md hover:border-orange-500/30 dark:hover:border-orange-500/40 hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-all duration-200 flex items-center gap-3.5 group/stat"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 group-hover/stat:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-text-main font-display tracking-tight">
                  {isLoading ? (
                    <span className="inline-block w-8 h-6 bg-text-muted/20 animate-pulse rounded" />
                  ) : (
                    stats.activeProjects
                  )}
                </div>
                <div className="text-[11px] font-medium text-text-muted">Active Projects</div>
              </div>
            </motion.div>

            {/* Stat 3: Compliance Score */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="p-3.5 sm:p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md hover:border-orange-500/30 dark:hover:border-orange-500/40 hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-all duration-200 flex items-center gap-3.5 group/stat"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 group-hover/stat:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-text-main font-display tracking-tight">
                  {isLoading ? (
                    <span className="inline-block w-12 h-6 bg-text-muted/20 animate-pulse rounded" />
                  ) : stats.averageComplianceScore !== null ? (
                    `${stats.averageComplianceScore}%`
                  ) : (
                    'N/A'
                  )}
                </div>
                <div className="text-[11px] font-medium text-text-muted">Compliance Score</div>
              </div>
            </motion.div>

            {/* Stat 4: Documents */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className="p-3.5 sm:p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md hover:border-orange-500/30 dark:hover:border-orange-500/40 hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-all duration-200 flex items-center gap-3.5 group/stat"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 group-hover/stat:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-text-main font-display tracking-tight">
                  {isLoading ? (
                    <span className="inline-block w-10 h-6 bg-text-muted/20 animate-pulse rounded" />
                  ) : (
                    stats.totalDocuments
                  )}
                </div>
                <div className="text-[11px] font-medium text-text-muted">Documents</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectsHubHeader;
