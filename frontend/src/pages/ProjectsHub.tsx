import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Plus, Search, Filter, FolderKanban, ShieldCheck,
  FileText, ArrowRight, MapPin, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../services/projectService';
import type { Project } from '../types/project';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { useAuth } from '../context/AuthContext';
import { CustomSelect } from '../components/common/CustomSelect';

const PROJECT_TYPE_OPTIONS = [
  { value: 'all', label: 'All Project Types' },
  { value: 'Commercial Office', label: 'Commercial Office' },
  { value: 'Residential Complex', label: 'Residential Complex' },
  { value: 'Mixed-Use Development', label: 'Mixed-Use Development' },
  { value: 'Healthcare Facility', label: 'Healthcare Facility' },
  { value: 'Educational Institution', label: 'Educational Institution' },
  { value: 'Industrial / Data Center', label: 'Industrial / Data Center' }
];

export const ProjectsHub: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load user projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.project_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.client_organization && p.client_organization.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'all' || p.project_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getHealthBadgeStyle = (badge: string) => {
    switch (badge?.toLowerCase()) {
      case 'excellent':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'good':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'needs improvement':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'at risk':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-purple-500/10 border border-black/10 dark:border-white/10 backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight font-display">
                Projects Hub
              </h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                User Isolated Workspace
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Welcome back, <span className="font-bold text-text-main">{user?.name || 'Sustainability Lead'}</span>. Manage building portfolios & document compliance evaluations.
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-primary/20 hover:shadow-lg transition-all cursor-pointer shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>CREATE NEW PROJECT</span>
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-card-base border border-border-base shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, ID, location..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs text-text-main focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="w-52">
            <CustomSelect
              value={typeFilter}
              onChange={setTypeFilter}
              options={PROJECT_TYPE_OPTIONS}
              icon={Filter}
              size="md"
              ariaLabel="Filter by Project Type"
            />
          </div>

          <button
            onClick={fetchProjects}
            className="p-2 rounded-xl text-text-muted hover:text-text-main bg-neutral-100 dark:bg-white/5 border border-black/5 dark:border-white/10 transition-colors cursor-pointer"
            title="Refresh Projects"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Projects Grid View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-64 rounded-2xl bg-card-base border border-border-base animate-pulse p-6 space-y-4">
              <div className="h-6 bg-border-base rounded w-3/4" />
              <div className="h-4 bg-border-base rounded w-1/2" />
              <div className="h-16 bg-border-base/50 rounded-xl" />
              <div className="h-10 bg-border-base rounded" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="border border-dashed border-border-base rounded-3xl p-12 text-center bg-card-base/40 flex flex-col items-center justify-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-extrabold text-text-main font-display">No Projects Found</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              {searchQuery
                ? 'No projects matched your search criteria.'
                : 'You have not created any sustainability projects yet. Click below to start building your first IGBC project workspace.'}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md shadow-primary/15 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE NEW PROJECT</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.project_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative bg-card-base border border-border-base hover:border-primary/45 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between card-3d"
            >
              <div className="space-y-4">
                {/* Header Card Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase">
                        {project.project_id}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${getHealthBadgeStyle(project.health_badge)}`}>
                        {project.health_badge || 'No Data'}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-text-main truncate font-display group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>

                    {project.client_organization && (
                      <p className="text-xs text-text-muted truncate font-medium">
                        {project.client_organization}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sub Metadata Tags */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-muted font-medium">
                  <span className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-white/5 border border-black/5 dark:border-white/10 px-2.5 py-1 rounded-lg">
                    <Building2 className="w-3 h-3 text-text-muted" />
                    <span>{project.project_type}</span>
                  </span>

                  {(project.city || project.location) && (
                    <span className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-white/5 border border-black/5 dark:border-white/10 px-2.5 py-1 rounded-lg">
                      <MapPin className="w-3 h-3 text-text-muted" />
                      <span>{project.city || project.location}</span>
                    </span>
                  )}
                </div>

                {/* Metrics Highlights Bar */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5">
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-sans">
                      Uploaded Docs
                    </span>
                    <div className="text-sm font-extrabold text-text-main font-display flex items-baseline gap-1 mt-0.5">
                      <FileText className="w-3.5 h-3.5 text-primary inline" />
                      <span>{project.documents_count}</span>
                      <span className="text-[10px] text-text-muted font-normal">files</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-sans">
                      Compliance Score
                    </span>
                    <div className="text-sm font-extrabold text-text-main font-display flex items-baseline gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline" />
                      <span>
                        {project.overall_compliance_score !== null && project.overall_compliance_score !== undefined
                          ? `${project.overall_compliance_score}%`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="flex items-center justify-between text-[10px] text-text-muted font-mono pt-1">
                  <span>Created: {project.created_at?.slice(0, 10)}</span>
                  <span>Updated: {project.updated_at?.slice(0, 10)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-5 border-t border-border-base/60 mt-4">
                <button
                  onClick={() => navigate(`/projects/${project.project_id}`)}
                  className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-text-main text-xs font-bold rounded-xl border border-black/5 dark:border-white/10 transition-colors text-center cursor-pointer"
                >
                  Workspace
                </button>

                <button
                  onClick={() => navigate(`/projects/${project.project_id}?tab=analytics`)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm shadow-primary/15 transition-colors text-center cursor-pointer"
                >
                  <span>Analyze Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Multi-step Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
};

export default ProjectsHub;
