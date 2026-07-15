import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Mail, Calendar, ShieldCheck, LogOut, Settings, Key } from 'lucide-react';
import api from '../services/api';

interface DashboardStats {
  documents_processed: number;
  compliance_evaluations: number;
  reports_generated: number;
  classification_accuracy: number;
  top_score: number;
}

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    documents_processed: 0,
    compliance_evaluations: 0,
    reports_generated: 0,
    classification_accuracy: 0.0,
    top_score: 0
  });

  useEffect(() => {
    const fetchProfileStats = async () => {
      try {
        const response = await api.get('/api/evaluations/stats');
        setStats(response.data);
      } catch (err) {
        console.error("Failed to load profile evaluation stats:", err);
      }
    };
    if (user) {
      fetchProfileStats();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-text-muted font-sans font-semibold">Loading user profile...</p>
      </div>
    );
  }

  // Format date
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'June 11, 2026';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-border-base pb-4">
        <h1 className="text-xl font-bold text-text-main font-display flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <span>Account Settings</span>
        </h1>
        <p className="text-[11px] text-text-muted font-sans">
          Manage your compliance account and profile preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Card: Avatar & Primary Actions */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-card-base/40 border border-border-base rounded-xl p-5 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
            {/* Glowing Accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-orange-500" />

            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'}
              alt={user.name}
              className="w-20 h-20 rounded-full border-2 border-primary/40 shadow-md object-cover mt-2"
            />

            <div className="mt-4 space-y-1 w-full">
              <h2 className="text-sm font-bold text-text-main truncate">{user.name}</h2>
              <span className="inline-block text-[9.5px] font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-md">
                Enterprise Member
              </span>
            </div>

            <div className="w-full border-t border-border-base/40 my-4" />

            <button
              onClick={logout}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-500 rounded-lg text-xs font-bold cursor-pointer transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Right Card: User Details & Stats */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-card-base/40 border border-border-base rounded-xl p-5 shadow-sm space-y-6">

            {/* Account Details Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">Profile Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1 p-3 bg-card-base rounded-lg border border-border-base/60">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-sans">Full Name</span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-text-main">
                    <UserIcon className="w-4 h-4 text-primary" />
                    <span>{user.name}</span>
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1 p-3 bg-card-base rounded-lg border border-border-base/60">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-sans">Email Address</span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-text-main truncate">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>{user.email}</span>
                  </div>
                </div>

                {/* Date Joined */}
                <div className="space-y-1 p-3 bg-card-base rounded-lg border border-border-base/60">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-sans">Date Registered</span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-text-main">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{joinDate}</span>
                  </div>
                </div>

                {/* Compliance Target */}
                <div className="space-y-1 p-3 bg-card-base rounded-lg border border-border-base/60">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-sans">Compliance Scope</span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-text-main">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>IGBC Rating Standards</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">Evaluation Stats</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-card-base p-3 rounded-lg border border-border-base/50">
                  <div className="text-base font-bold text-text-main font-display">{stats.documents_processed}</div>
                  <div className="text-[9px] text-text-muted font-sans font-semibold uppercase">Total Audits</div>
                </div>
                <div className="bg-card-base p-3 rounded-lg border border-border-base/50">
                  <div className="text-base font-bold text-text-main font-display">{stats.top_score > 0 ? stats.top_score + '%' : '0%'}</div>
                  <div className="text-[9px] text-text-muted font-sans font-semibold uppercase">Top Score</div>
                </div>
                <div className="bg-card-base p-3 rounded-lg border border-border-base/50">
                  <div className="text-base font-bold text-text-main font-display">{stats.classification_accuracy > 0 ? (stats.classification_accuracy * 100).toFixed(1) + '%' : '0%'}</div>
                  <div className="text-[9px] text-text-muted font-sans font-semibold uppercase">Confidence</div>
                </div>
              </div>
            </div>

            {/* API Keys Placeholder */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">API Access Credentials</h3>
              <div className="flex items-center justify-between p-3 bg-card-base rounded-lg border border-border-base/60 gap-4">
                <div className="flex items-center gap-2 text-xs text-text-muted font-sans truncate">
                  <Key className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-mono">greenintel_api_key_••••••••••••••••</span>
                </div>
                <button
                  onClick={() => alert("Reveal API keys feature is under developer configuration.")}
                  className="px-2.5 py-1 border border-border-base hover:border-primary/50 text-[10px] font-bold text-text-main rounded-md cursor-pointer transition-colors"
                >
                  Reveal
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
