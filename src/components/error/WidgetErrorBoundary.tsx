/**
 * Widget-specific Error Boundary
 * Handles errors within individual widgets without breaking the entire dashboard
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../../lib/logger';

interface Props {
  children: ReactNode;
  widgetId?: string;
  widgetTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Widget Error Boundary caught an error', error, {
      widgetId: this.props.widgetId,
      widgetTitle: this.props.widgetTitle,
      componentStack: errorInfo.componentStack,
    });

    // Send to Sentry with widget context
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
          widget: {
            id: this.props.widgetId,
            title: this.props.widgetTitle,
          },
        },
      });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center">
            <svg
              className="w-12 h-12 text-red-400 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Widget Error
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              {this.props.widgetTitle || 'This widget'} failed to load
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <p className="mt-2 text-xs text-red-600 font-mono">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReset}
              className="mt-3 px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
