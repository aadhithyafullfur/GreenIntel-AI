import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Mail, Lock, ArrowRight,
  Sparkles, CheckCircle2, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

const Login: React.FC = () => {
  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || "/";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
    return () => {
      clearError();
    };
  }, [isAuthenticated, navigate, from, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!email || !password) {
      setValidationError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setIsSubmitting(false);
    }
  };



  const features = [
    {
      title: "Document Classification",
      desc: "Instant recognition of Water, Energy, and Waste audits.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20"
    },
    {
      title: "Information Extraction",
      desc: "Extracts key building metrics (EPI, area, HVAC COP).",
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20"
    },
    {
      title: "Compliance Evaluation",
      desc: "Direct verification against IGBC rating guidelines.",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10 border-indigo-500/20"
    },
    {
      title: "AI Recommendations",
      desc: "Actionable points optimization for gold/platinum status.",
      color: "text-orange-500",
      bg: "bg-orange-500/10 border-orange-500/20"
    }
  ];

  return (
    <div className="min-h-[85vh] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">

      {/* LEFT SIDE: Premium Product Branding (6 Columns) */}
      <div className="lg:col-span-7 space-y-8 flex flex-col justify-center h-full pr-0 lg:pr-8 relative overflow-hidden">

        {/* Subtle Decorative Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2 dark:bg-primary/15 animate-pulse" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-orange-600/5 rounded-full blur-3xl pointer-events-none dark:bg-orange-500/10" />

        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/25 rounded-full text-[11px] font-bold text-primary tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Compliance Re-imagined</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-main tracking-tight font-display leading-[1.15]">
            Accelerate your green building <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600 dark:from-primary dark:to-orange-400">compliance audit</span>
          </h1>

          <p className="text-sm text-text-muted max-w-xl font-normal leading-relaxed font-sans">
            GreenIntel AI acts as your digital sustainability officer, automatically assessing compliance documentation against Indian Green Building Council (IGBC) rating systems.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
          {features.map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="group bg-card-base/40 dark:bg-white/5 border border-border-base rounded-xl p-4 hover:border-primary/40 hover:bg-card-base dark:hover:bg-white/10 shadow-sm transition-all duration-350"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg border ${feat.bg} ${feat.color} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-xs font-bold text-text-main truncate font-display">
                    {feat.title}
                  </h3>
                  <p className="text-[11px] text-text-muted leading-relaxed font-sans">
                    {feat.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Brand Footer */}
        <div className="flex items-center gap-6 text-[10.5px] text-text-muted font-sans border-t border-border-base/50 pt-5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>IGBC Certified Taxonomy</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-border-base" />
          <div>98.8% AI Extraction Accuracy</div>
        </div>
      </div>

      {/* RIGHT SIDE: Premium Login Form Card (5 Columns) */}
      <div className="lg:col-span-5 flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md bg-white/60 dark:bg-card-base/50 backdrop-blur-xl border border-border-base rounded-2xl p-6 sm:p-8 shadow-xl orange-glow relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-orange-600/30" />

          {/* Form Header */}
          <div className="space-y-1.5 mb-6 text-center lg:text-left">
            <h2 className="text-xl font-bold text-text-main font-display">Welcome to GreenIntel AI</h2>
            <p className="text-[11px] text-text-muted font-sans">
              Enter your credentials or continue with Google to access reports.
            </p>
          </div>

          {/* Alerts: Error Messages */}
          {(error || validationError) && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-[11.5px] text-red-600 dark:text-red-400 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Authentication failed: </span>
                {validationError || error}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email Input */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[10.5px] font-bold text-text-muted uppercase tracking-wider block font-sans">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-white/50 dark:bg-white/5 border border-border-base rounded-lg text-sm text-text-main placeholder:text-text-muted/65 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-sans"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-[10.5px] font-bold text-text-muted uppercase tracking-wider block font-sans">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert("Password reset link has been simulated.")}
                  className="text-[11px] font-semibold text-primary hover:text-primary-hover font-sans hover:underline focus:outline-none cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-white/50 dark:bg-white/5 border border-border-base rounded-lg text-sm text-text-main placeholder:text-text-muted/65 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-sans"
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-main focus:outline-none cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-sm shadow-primary/10 hover:shadow-md hover:shadow-primary/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-base/55"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold">
              <span className="bg-bg-base dark:bg-[#151515] px-3.5 text-text-muted font-sans">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Sign-In with Google */}
          <div className="w-full flex justify-center mt-1">
            <GoogleSignInButton
              onSuccess={() => navigate(from, { replace: true })}
            />
          </div>

          {/* Card Footer: Sign up redirect */}
          <div className="mt-6 text-center">
            <p className="text-[11.5px] text-text-muted font-sans">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-bold text-primary hover:text-primary-hover hover:underline transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>

          {/* Quick Login tip */}
          <div className="mt-4 p-2 rounded bg-primary/5 border border-primary/15 text-[10px] text-primary/80 text-center font-sans">
            <span className="font-bold">Demo account:</span> demo@greenintel.ai / password123
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default Login;
