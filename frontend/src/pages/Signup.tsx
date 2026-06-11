import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Mail, Lock, User as UserIcon, 
  ArrowRight, Sparkles, PlusCircle, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup: React.FC = () => {
  const { signup, loginWithGoogle, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
    return () => {
      clearError();
    };
  }, [isAuthenticated, navigate, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!fullName || !email || !password || !confirmPassword) {
      setValidationError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(fullName, email, password);
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleSubmitting(true);
    clearError();
    try {
      await loginWithGoogle();
    } catch (err) {
      setGoogleSubmitting(false);
    }
  };

  const accountBenefits = [
    {
      title: "Save Evaluations",
      desc: "Instantly persist all building reports to your dashboard cloud storage."
    },
    {
      title: "Export & Share",
      desc: "Download official PDF audits or share links directly with sustainability officers."
    },
    {
      title: "Organization Profiles",
      desc: "Assign projects to specific teams and track progress parameters."
    },
    {
      title: "Compliance Registry",
      desc: "Access a chronological history of evaluations for audit readiness."
    }
  ];

  return (
    <div className="min-h-[85vh] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
      
      {/* LEFT SIDE: Account Benefits (6 Columns) */}
      <div className="lg:col-span-7 space-y-8 flex flex-col justify-center h-full pr-0 lg:pr-8 relative overflow-hidden">
        
        {/* Subtle Decorative Floating Orbs */}
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2 dark:bg-primary/15 animate-pulse" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-orange-600/5 rounded-full blur-3xl pointer-events-none dark:bg-orange-500/10" />

        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/25 rounded-full text-[11px] font-bold text-primary tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unlock Enterprise Features</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-main tracking-tight font-display leading-[1.15]">
            Build sustainable structures, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600 dark:from-primary dark:to-orange-400">log results securely</span>
          </h1>
          
          <p className="text-sm text-text-muted max-w-xl font-normal leading-relaxed font-sans">
            Create an account to track your environmental footprints, build structural profiles, and evaluate compliance across multiple IGBC standards.
          </p>
        </div>

        {/* Benefits List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative">
          {accountBenefits.map((benefit, idx) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="bg-card-base/40 dark:bg-white/5 border border-border-base rounded-xl p-4.5 hover:border-primary/45 hover:bg-card-base dark:hover:bg-white/10 shadow-sm transition-all duration-300"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4.5 h-4.5 text-primary flex-shrink-0" />
                  <h3 className="text-xs font-bold text-text-main font-display">
                    {benefit.title}
                  </h3>
                </div>
                <p className="text-[11.5px] text-text-muted leading-relaxed font-sans">
                  {benefit.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Brand Footer */}
        <div className="flex items-center gap-6 text-[10.5px] text-text-muted font-sans border-t border-border-base/50 pt-5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>IGBC Certified Standard</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-border-base" />
          <div>GDPR Compliant Data Safeguards</div>
        </div>
      </div>

      {/* RIGHT SIDE: Signup Form Card (5 Columns) */}
      <div className="lg:col-span-5 flex justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md bg-white/60 dark:bg-card-base/50 backdrop-blur-xl border border-border-base rounded-2xl p-6 sm:p-8 shadow-xl orange-glow relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-orange-600/30" />

          {/* Form Header */}
          <div className="space-y-1.5 mb-5 text-center lg:text-left">
            <h2 className="text-xl font-bold text-text-main font-display">Create Account</h2>
            <p className="text-[11px] text-text-muted font-sans">
              Sign up today and unlock customized dashboard evaluation history.
            </p>
          </div>

          {/* Alerts: Error Messages */}
          {(error || validationError) && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-[11.5px] text-red-600 dark:text-red-400 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Registration failed: </span>
                {validationError || error}
              </div>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Full Name Input */}
            <div className="space-y-1">
              <label htmlFor="fullName" className="text-[10.5px] font-bold text-text-muted uppercase tracking-wider block font-sans">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted pointer-events-none">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aadhithya Srinivasan"
                  className="w-full pl-9 pr-4 py-2 bg-white/50 dark:bg-white/5 border border-border-base rounded-lg text-sm text-text-main placeholder:text-text-muted/65 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-sans"
                  disabled={isSubmitting || googleSubmitting}
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
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
                  className="w-full pl-9 pr-4 py-2 bg-white/50 dark:bg-white/5 border border-border-base rounded-lg text-sm text-text-main placeholder:text-text-muted/65 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-sans"
                  disabled={isSubmitting || googleSubmitting}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-[10.5px] font-bold text-text-muted uppercase tracking-wider block font-sans">
                Password
              </label>
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
                  className="w-full pl-9 pr-10 py-2 bg-white/50 dark:bg-white/5 border border-border-base rounded-lg text-sm text-text-main placeholder:text-text-muted/65 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-sans"
                  disabled={isSubmitting || googleSubmitting}
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

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="text-[10.5px] font-bold text-text-muted uppercase tracking-wider block font-sans">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-white/50 dark:bg-white/5 border border-border-base rounded-lg text-sm text-text-main placeholder:text-text-muted/65 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-sans"
                  disabled={isSubmitting || googleSubmitting}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || googleSubmitting}
              className="w-full mt-3 py-2.5 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-sm shadow-primary/10 hover:shadow-md hover:shadow-primary/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4.5">
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
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting || googleSubmitting}
            className="w-full py-2.5 px-4 bg-card-base hover:bg-orange-50/25 dark:hover:bg-white/5 border border-border-base text-text-main text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2.5 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleSubmitting ? (
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.137 4.114-3.468 0-6.28-2.812-6.28-6.28s2.812-6.28 6.28-6.28c1.637 0 3.127.625 4.254 1.638l3.155-3.156C19.23 2.127 15.93 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.76 0 12.24-5.48 12.24-12.24 0-.853-.082-1.677-.232-2.47L12.24 10.285z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Card Footer: Redirect back to Login */}
          <div className="mt-5 text-center">
            <p className="text-[11.5px] text-text-muted font-sans">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-primary hover:text-primary-hover hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default Signup;
