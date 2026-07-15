import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSuccess, onError }) => {
  const { theme } = useTheme();
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSuccess = async (credentialResponse: any) => {
    console.log("Google Sign-In response received:", credentialResponse);
    console.log("Google ID Token (credential):", credentialResponse.credential);

    if (!credentialResponse.credential) {
      const errMsg = "No credentials received from Google.";
      setLocalError(errMsg);
      onError?.(errMsg);
      return;
    }

    setIsLoading(true);
    setLocalError(null);
    try {
      await loginWithGoogle(credentialResponse.credential);
      onSuccess?.();
    } catch (err: any) {
      const errMsg = err.message || "Failed to authenticate with Google.";
      setLocalError(errMsg);
      onError?.(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFailure = () => {
    const errMsg = "Google Sign-In was cancelled or failed.";
    setLocalError(errMsg);
    onError?.(errMsg);
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {localError && (
        <div className="w-full p-2.5 rounded-lg bg-red-500/10 border border-red-500/25 text-[11px] text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
          <span className="truncate">{localError}</span>
        </div>
      )}

      <div className="w-full relative overflow-hidden rounded-lg transition-all duration-300">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex items-center justify-center z-10 rounded-lg">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Container that implements responsive design and glassmorphism properties */}
        <div className="w-full flex justify-center py-0.5">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleFailure}
            useOneTap={false}
            theme={theme === 'dark' ? 'filled_black' : 'outline'}
            shape="rectangular"
            size="large"
            width="100%"
            logo_alignment="center"
          />
        </div>
      </div>
    </div>
  );
};

export default GoogleSignInButton;
