import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Plus, Search, Filter, ShieldCheck,
  RefreshCw, ArrowUpDown, Tag
} from 'lucide-react';
import { getProjects } from '../services/projectService';
import type { Project } from '../types/project';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { ProjectsHubHeader } from '../components/projects/ProjectsHubHeader';
import { ProjectCard } from '../components/projects/ProjectCard';
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

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'warning', label: 'Warning' },
  { value: 'non-compliant', label: 'Non-Compliant' }
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Sort: Latest Created' },
  { value: 'score_high', label: 'Sort: Highest Compliance' },
  { value: 'score_low', label: 'Sort: Lowest Compliance' },
  { value: 'name', label: 'Sort: Name A-Z' },
  { value: 'documents', label: 'Sort: Most Documents' }
];

export const ProjectsHub: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
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

  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.project_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.client_organization && p.client_organization.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = typeFilter === 'all' || p.project_type === typeFilter;

      let matchesStatus = true;
      if (statusFilter !== 'all') {
        const b = (p.health_badge || p.status || '').toLowerCase();
        if (statusFilter === 'excellent') matchesStatus = b.includes('excellent') || b.includes('pass');
        else if (statusFilter === 'good') matchesStatus = b.includes('good') || b.includes('review');
        else if (statusFilter === 'warning') matchesStatus = b.includes('warning') || b.includes('needs');
        else if (statusFilter === 'non-compliant') matchesStatus = b.includes('non') || b.includes('risk') || b.includes('fail');
      }

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'score_high') {
        return (b.overall_compliance_score || 0) - (a.overall_compliance_score || 0);
      }
      if (sortBy === 'score_low') {
        return (a.overall_compliance_score || 0) - (b.overall_compliance_score || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'documents') {
        return (b.documents_count || 0) - (a.documents_count || 0);
      }
      // Default 'latest'
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

  return (
    <div className="space-y-6 pb-12">
      {/* 2. KEEP THE CURRENT HEADER (3D Building animation untouched) */}
      <ProjectsHubHeader
        userName={user?.name}
        projects={projects}
        onCreateProject={() => setIsModalOpen(true)}
        isLoading={isLoading}
      />

      {/* 10. Filter + Search Area */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-card-base border border-border-base shadow-sm backdrop-blur-xl">
        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-all"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
          <div className="w-full sm:w-48">
            <CustomSelect
              value={typeFilter}
              onChange={setTypeFilter}
              options={PROJECT_TYPE_OPTIONS}
              icon={Filter}
              size="md"
              ariaLabel="Filter by Project Type"
            />
          </div>

          <div className="w-36 sm:w-40">
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
              icon={ShieldCheck}
              size="md"
              ariaLabel="Filter by Status"
            />
          </div>

          <div className="w-44 sm:w-48">
            <CustomSelect
              value={sortBy}
              onChange={setSortBy}
              options={SORT_OPTIONS}
              icon={ArrowUpDown}
              size="md"
              ariaLabel="Sort Projects"
            />
          </div>

          <button
            onClick={fetchProjects}
            className="p-2.5 rounded-xl text-text-muted hover:text-orange-500 bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 hover:border-orange-500/30 transition-all cursor-pointer shrink-0"
            title="Refresh Projects"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-orange-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* 9. Projects Responsive Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-72 rounded-2xl bg-card-base border border-border-base animate-pulse p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-border-base rounded-xl" />
                <div className="w-20 h-5 bg-border-base rounded-lg" />
              </div>
              <div className="h-6 bg-border-base rounded w-3/4" />
              <div className="h-4 bg-border-base rounded w-1/2" />
              <div className="h-20 bg-border-base/50 rounded-xl" />
              <div className="h-10 bg-border-base rounded" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        /* 11. Empty State */
        <div className="border border-dashed border-border-base rounded-3xl p-12 text-center bg-card-base/40 backdrop-blur-xl flex flex-col items-center justify-center space-y-5 max-w-2xl mx-auto my-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-md shadow-orange-500/10">
            <Building2 className="w-8 h-8 text-orange-500 dark:text-orange-400" />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-xl font-extrabold text-text-main font-display">
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' ? 'No Matching Projects' : 'No projects yet'}
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'No projects matched your search or filter criteria. Try clearing or adjusting your filters.'
                : 'Create your first building project to start document compliance analysis.'}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 transition-all cursor-pointer uppercase tracking-wider border border-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Project</span>
          </button>
        </div>
      ) : (
        /* Grid Layout: 3 Columns Desktop, 2 Columns Tablet, 1 Column Mobile */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.project_id} project={project} />
          ))}
        </div>
      )}

      {/* 12. Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
};

export default ProjectsHub;
