import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleNavigateDashboard = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/projects';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-base flex items-center justify-center p-6 text-text-main selection:bg-primary/20 selection:text-primary">
          <div className="max-w-md w-full p-8 rounded-3xl bg-card-base border border-border-base shadow-2xl space-y-6 text-center orange-glow">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold font-display text-text-main">
                Something went wrong
              </h2>
              <p className="text-xs text-text-muted leading-relaxed font-sans">
                An unexpected interface error occurred. You can retry the operation or return to your project workspace.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-200 dark:bg-white/10 hover:bg-neutral-300 dark:hover:bg-white/15 text-text-main text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <button
                onClick={this.handleNavigateDashboard}
                className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/15 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
