import { ReactNode, Component, ErrorInfo } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback?.(this.state.error!, this.retry) || (
          <div className="min-h-[300px] flex items-center justify-center px-4">
            <div className="text-center space-y-4 max-w-md">
              <div className="flex justify-center">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                  Something went wrong
                </h2>
                <p className="text-foreground/60 text-sm">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
              </div>
              <Button
                onClick={this.retry}
                variant="outline"
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
