import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 [REACT APPLICATION FATAL ERROR]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0c10',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <AlertTriangle size={64} color="#ff4d5d" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Console Interface Exception</h2>
          <p style={{ color: '#8c96a8', maxWidth: '500px', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            {this.state.error?.toString() || 'An unexpected rendering error occurred in the launcher.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#00c6ff',
              color: '#000000',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '30px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RefreshCw size={18} /> Reload Launcher
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
