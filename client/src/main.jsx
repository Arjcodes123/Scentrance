import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './index.css';

// Keeps a single component failure from blanking the entire site.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('App error:', error, info?.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-md px-4 py-32 text-center">
          <h1 className="font-serif text-3xl text-silver-100">Something went wrong</h1>
          <p className="mt-3 text-silver-400">
            Please refresh the page. If the problem continues, try again in a moment.
          </p>
          <button className="btn-silver mt-8" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
