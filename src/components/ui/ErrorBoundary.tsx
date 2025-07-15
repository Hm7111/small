import React, { Component, ErrorInfo, ReactNode } from 'react';
import { connect } from 'react-redux';
import { addError } from '../../store/slices/errorSlice';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';

interface Props {
  children: ReactNode;
  addError: typeof addError;
  fallback?: ReactNode;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true, error: null, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to Redux store
    this.props.addError({
      message: error.message,
      code: error.name,
      context: this.props.context || 'unknown',
      severity: 'error',
      componentStack: errorInfo.componentStack
    });
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900" dir="rtl">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              حدث خطأ غير متوقع
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              نأسف، حدث خطأ أثناء تشغيل التطبيق. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.
            </p>
            
            <div className="space-y-2 mb-6 text-right">
              {this.state.error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 p-3 rounded-lg">
                  <div className="font-mono text-xs text-red-700 dark:text-red-400 whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              <Button
                onClick={this.handleRefresh}
                className="w-full"
                icon={<RefreshCw className="w-5 h-5 ml-2" />}
              >
                تحديث الصفحة
              </Button>
              
              <Button
                variant="outline"
                onClick={this.handleReset}
                className="w-full"
              >
                المحاولة مرة أخرى
              </Button>
              
              <Button
                variant="outline"
                onClick={this.handleHome}
                className="w-full"
                icon={<Home className="w-5 h-5 ml-2" />}
              >
                العودة للصفحة الرئيسية
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default connect(null, { addError })(ErrorBoundary);
