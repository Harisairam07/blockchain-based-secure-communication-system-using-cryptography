import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unexpected UI error' };
  }

  componentDidCatch(error, info) {
    console.error('UI boundary caught an error:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, message: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-cyber-bg px-4">
          <div className="panel max-w-lg p-6 text-center">
            <h2 className="font-display text-xl font-semibold text-red-300">Secure UI Recovery Mode</h2>
            <p className="mt-2 text-sm text-cyber-muted">
              A rendering error occurred. The session data is safe and you can reload the interface.
            </p>
            <p className="mt-3 rounded-lg bg-slate-900/70 px-3 py-2 text-xs text-slate-300">{this.state.message}</p>
            <button onClick={this.handleReload} className="btn-primary mt-4">
              Reload Interface
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
