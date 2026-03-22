import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service here
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return this.props.fallback || (
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center w-full min-h-[150px]">
                    <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                    <h3 className="font-bold text-red-800 mb-1">Widget Failed to Load</h3>
                    <p className="text-sm text-red-600 mb-4">Something went wrong while displaying this content.</p>
                    <button 
                        onClick={() => this.setState({ hasError: false })}
                        className="flex items-center gap-2 text-sm bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition"
                    >
                        <RefreshCw className="w-4 h-4" /> Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
