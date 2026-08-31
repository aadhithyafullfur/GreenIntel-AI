import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, Building2, CheckCircle2,
  Tag, ArrowRight, ArrowLeft, Plus, Loader2
} from 'lucide-react';
import { createProject } from '../../services/projectService';
import type { ProjectCreateInput } from '../../types/project';
import { useNavigate } from 'react-router-dom';
import { CustomSelect } from '../common/CustomSelect';

const PROJECT_TYPES = [
  "Commercial Office",
  "Residential Complex",
  "Mixed-Use Development",
  "Healthcare Facility",
  "Educational Institution",
  "Industrial / Data Center",
  "Hospitality / Hotel"
];

const BUILDING_TYPES = [
  "New Construction",
  "Existing Building Retrofit",
  "Major Renovation",
  "Core & Shell"
];

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProjectCreateInput>({
    name: '',
    project_type: 'Commercial Office',
    client_organization: '',
    building_name: '',
    location: '',
    city: '',
    state: '',
    country: 'India',
    building_area: '',
    building_type: 'New Construction',
    number_of_floors: '',
    occupancy_type: 'Commercial',
    description: '',
    tags: [],
    logo_url: '',
    reference_number: ''
  });

  const [tagInput, setTagInput] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: ProjectCreateInput) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev: ProjectCreateInput) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev: ProjectCreateInput) => ({
      ...prev,
      tags: prev.tags?.filter((t: string) => t !== tagToRemove)
    }));
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setErrorMsg('Project Name is required.');
      return false;
    }
    if (!formData.project_type.trim()) {
      setErrorMsg('Project Type is required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const created = await createProject(formData);
      onSuccess?.();
      onClose();
      // Redirect directly to Project Workspace
      navigate(`/projects/${created.project_id}`);
    } catch (err: any) {
      console.error('Failed to create project:', err);
      const msg = err.response?.data?.detail || err.message || 'Failed to create project. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-card-base border border-border-base rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-text-main"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-base bg-gradient-to-r from-orange-500/15 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 shrink-0 shadow-sm shadow-orange-500/10">
              <Building2 className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold font-display text-text-main">
                Create New Sustainability Project
              </h2>
              <p className="text-xs text-text-muted">
                {step === 1 && 'STEP 1 • PROJECT DETAILS'}
                {step === 2 && 'STEP 2 • BUILDING PARAMETERS & DOCUMENTS'}
                {step === 3 && 'STEP 3 • READY FOR ANALYSIS'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-main bg-neutral-100 dark:bg-white/5 border border-black/5 dark:border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="w-full bg-border-base/50 h-1">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 custom-scrollbar flex-1">
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1 font-sans">
                    Project Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Green Building Tower A"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-text-main focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted font-sans">
                    Project Type <span className="text-primary">*</span>
                  </label>
                  <CustomSelect
                    value={formData.project_type || ''}
                    onChange={(val) => setFormData((prev) => ({ ...prev, project_type: val }))}
                    options={PROJECT_TYPES}
                    ariaLabel="Select Project Type"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted font-sans">
                    Client / Organization
                  </label>
                  <input
                    type="text"
                    name="client_organization"
                    value={formData.client_organization}
                    onChange={handleChange}
                    placeholder="e.g. Global Tech Real Estate"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-text-main focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted font-sans">
                    Building Name
                  </label>
                  <input
                    type="text"
                    name="building_name"
                    value={formData.building_name}
                    onChange={handleChange}
                    placeholder="e.g. Tower A - Phase 1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-text-main focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted font-sans">
                    Street Address / Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Financial District, Nanakramguda"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-text-main focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted font-sans">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Hyderabad"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-text-main focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted font-sans">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Telangana"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-text-main focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted font-sans">
                    Total Built-up Area
                  </label>
                  <input
                    type="text"
                    name="building_area"
                    value={formData.building_area}
                    onChange={handleChange}
                    placeholder="e.g. 45,000 sq m"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-text-main focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted font-sans">
                    Building Development Type
                  </label>
                  <CustomSelect
                    value={formData.building_type || ''}
                    onChange={(val) => setFormData((prev) => ({ ...prev, building_type: val }))}
                    options={BUILDING_TYPES}
                    ariaLabel="Select Building Development Type"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted font-sans">
                    Number of Floors
                  </label>
                  <input
                    type="number"
                    name="number_of_floors"
                    value={formData.number_of_floors}
                    onChange={handleChange}
                    placeholder="e.g. 18"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-text-main focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted font-sans">
                    Occupancy Type
                  </label>
                  <input
                    type="text"
                    name="occupancy_type"
                    value={formData.occupancy_type}
                    onChange={handleChange}
                    placeholder="e.g. Full Occupancy / Multi-Tenant"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-text-main focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted font-sans">
                    Project Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of the building project, sustainability targets, IGBC rating goal..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-text-main focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted font-sans">
                    Project Reference Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="reference_number"
                    value={formData.reference_number}
                    onChange={handleChange}
                    placeholder="e.g. IGBC-AP-2026-8849"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-text-main focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted font-sans">
                    Project Tags
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add tag e.g. Gold Target, Solar PV..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-text-main focus:outline-none focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2.5 bg-neutral-200 dark:bg-white/10 hover:bg-neutral-300 dark:hover:bg-white/15 text-text-main text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {formData.tags.map((t: string) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold"
                        >
                          <Tag className="w-3 h-3" />
                          <span>{t}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="hover:text-red-500 ml-1 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary Card */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Project Ready for Creation</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Upon creation, you will be redirected automatically to the <span className="font-bold text-text-main">Project Workspace</span> to upload and analyze your sustainability documents.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </form>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border-base bg-neutral-50 dark:bg-white/5">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s: number) => (s - 1) as 1 | 2 | 3)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-200 dark:bg-white/10 hover:bg-neutral-300 dark:hover:bg-white/15 text-text-main text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && validateStep1()) {
                  setStep(2);
                } else if (step === 2) {
                  setStep(3);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md shadow-primary/15 transition-all cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Project...</span>
                </>
              ) : (
                <>
                  <span>Create & Launch Workspace</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
