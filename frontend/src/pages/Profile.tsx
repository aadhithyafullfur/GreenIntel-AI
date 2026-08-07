import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  User as UserIcon,
  Mail,
  Calendar,
  LogOut,
  Settings,
  Key,
  Clock,
  Layers,
  CheckCircle,
  FileCheck
} from 'lucide-react';
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
  const { theme } = useTheme();
  const [stats, setStats] = useState<DashboardStats>({
    documents_processed: 0,
    compliance_evaluations: 0,
    reports_generated: 0,
    classification_accuracy: 0.0,
    top_score: 0
  });

  useEffect(() => {
    let isMounted = true;
    if (user) {
      api.get('/api/evaluations/stats')
        .then((response) => {
          if (isMounted) {
            setStats(response.data);
          }
        })
        .catch((err) => {
          console.error("Failed to load profile evaluation stats:", err);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-text-muted font-sans font-semibold text-xs tracking-wider uppercase animate-pulse">
          Loading user profile...
        </p>
      </div>
    );
  }

  const isDark = theme === 'dark';
  const isGoogle = user.provider === 'google';

  // Format date strings
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const lastLoginDate = user.lastLogin
    ? new Date(user.lastLogin).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    : 'N/A';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="border-b border-border-base pb-4">
        <h1 className="text-xl font-bold text-text-main font-display flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <span>Account Profile</span>
        </h1>
        <p className="text-[11px] text-text-muted font-sans font-semibold uppercase tracking-wider">
          Manage credentials and view platform interaction stats
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left column: Profile Picture & Provider Card */}
        <div className="md:col-span-1 space-y-4">
          <div
            className={`border rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 ${isDark
                ? 'bg-[#0A0A0A]/50 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] orange-glow'
                : 'bg-white/80 border-neutral-200/50 shadow-md'
              }`}
          >
            {/* Glow bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500" />

            {/* Profile image with theme-aware borders */}
            <div
              className={`relative w-24 h-24 rounded-full p-1 transition-all duration-300 ${isDark
                  ? 'border border-white/15 bg-white/5 shadow-[0_0_15px_rgba(249,115,22,0.35)]'
                  : 'border-2 border-orange-500/80 bg-white shadow-md'
                }`}
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  const initials = encodeURIComponent(
                    user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()
                  );
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${initials}&background=F97316&color=fff&size=128&bold=true`;
                }}
              />
            </div>

            <div className="mt-4 space-y-1.5 w-full">
              <h2 className="text-sm font-bold text-text-main truncate max-w-full px-2">
                {user.name}
              </h2>
              <p className="text-[10px] text-text-muted font-medium truncate max-w-full px-2">
                {user.email}
              </p>
            </div>

            {/* Auth Provider Badge */}
            <div className="mt-4 w-full flex items-center justify-center">
              {isGoogle ? (
                <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-500 px-3 py-1 rounded-xl text-[10px] font-bold">
                  {/* Google Custom SVG logo */}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Google Sign-In</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 bg-neutral-500/10 border border-neutral-500/20 text-text-main px-3 py-1 rounded-xl text-[10px] font-bold">
                  <Mail className="w-3.5 h-3.5 text-text-muted" />
                  <span>Email & Password</span>
                </div>
              )}
            </div>

            <div className="w-full border-t border-border-base/40 my-5" />

            <button
              onClick={logout}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Right column: Details and sustainability metrics */}
        <div className="md:col-span-2 space-y-4">
          <div
            className={`border rounded-2xl p-6 shadow-sm space-y-6 ${isDark ? 'bg-[#0A0A0A]/30 border-white/10' : 'bg-white/50 border-neutral-200/50'
              }`}
          >
            {/* Account Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">
                Profile Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div className="space-y-1 p-3 bg-card-base rounded-xl border border-border-base/50">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block font-sans">
                    Full Name
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold text-text-main">
                    <UserIcon className="w-4 h-4 text-primary" />
                    <span>{user.name}</span>
                  </div>
                </div>

                {/* Email address */}
                <div className="space-y-1 p-3 bg-card-base rounded-xl border border-border-base/50">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block font-sans">
                    Email Address
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold text-text-main truncate">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>

                {/* Date registered */}
                <div className="space-y-1 p-3 bg-card-base rounded-xl border border-border-base/50">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block font-sans">
                    Member Since
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold text-text-main">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{joinDate}</span>
                  </div>
                </div>

                {/* Last login */}
                <div className="space-y-1 p-3 bg-card-base rounded-xl border border-border-base/50">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block font-sans">
                    Last Active
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold text-text-main">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{lastLoginDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sustainability Metrics & Stats */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">
                Sustainability Intelligence Stats
              </h3>

              <div className="grid grid-cols-3 gap-3 text-center">
                {/* Documents Uploaded */}
                <div className="bg-card-base p-4 rounded-xl border border-border-base/50 flex flex-col items-center">
                  <Layers className="w-4.5 h-4.5 text-primary mb-1.5" />
                  <div className="text-base font-bold text-text-main font-display">
                    {stats.documents_processed}
                  </div>
                  <div className="text-[8.5px] text-text-muted font-bold uppercase mt-0.5 leading-none">
                    Uploads
                  </div>
                </div>

                {/* Compliance Evaluations */}
                <div className="bg-card-base p-4 rounded-xl border border-border-base/50 flex flex-col items-center">
                  <CheckCircle className="w-4.5 h-4.5 text-indigo-500 mb-1.5" />
                  <div className="text-base font-bold text-text-main font-display">
                    {stats.compliance_evaluations}
                  </div>
                  <div className="text-[8.5px] text-text-muted font-bold uppercase mt-0.5 leading-none">
                    Evaluations
                  </div>
                </div>

                {/* Reports Generated */}
                <div className="bg-card-base p-4 rounded-xl border border-border-base/50 flex flex-col items-center">
                  <FileCheck className="w-4.5 h-4.5 text-emerald-500 mb-1.5" />
                  <div className="text-base font-bold text-text-main font-display">
                    {stats.reports_generated}
                  </div>
                  <div className="text-[8.5px] text-text-muted font-bold uppercase mt-0.5 leading-none">
                    Saved Reports
                  </div>
                </div>
              </div>
            </div>

            {/* API access segment */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">
                Platform Credentials
              </h3>
              <div className="flex items-center justify-between p-3.5 bg-card-base rounded-xl border border-border-base/50 gap-4">
                <div className="flex items-center gap-2 text-xs text-text-muted font-sans truncate">
                  <Key className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-mono text-[10.5px]">greenintel_api_key_••••••••••••••••</span>
                </div>
                <button
                  onClick={() => alert("Reveal credentials is locked for security configuration.")}
                  className="px-3 py-1 border border-border-base hover:border-primary/50 text-[9.5px] font-bold text-text-main rounded-lg cursor-pointer transition-colors"
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
