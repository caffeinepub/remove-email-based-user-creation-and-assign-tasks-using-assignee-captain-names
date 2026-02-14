import React, { Component, ReactNode } from 'react';
import AppLoadErrorScreen from './AppLoadErrorScreen';
import { logRuntimeError } from '../utils/diagnostics';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Top-level error boundary that catches runtime errors and displays
 * a user-friendly fallback screen
 */
export default class RuntimeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for diagnostics without exposing to user
    logRuntimeError(error, 'React Error Boundary');
    console.error('[Error Info]', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <AppLoadErrorScreen
          message="The app encountered an unexpected error."
          onReload={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}
