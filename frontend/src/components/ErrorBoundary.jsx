import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', backgroundColor: '#000', color: '#ff5555', height: '100vh', overflow: 'auto' }}>
                    <h1>Application Error (Black Screen Fix)</h1>
                    <h2>Likely Cause: Missing Dependencies or Server Restart Needed</h2>
                    <p>Please run <code>npm install</code> and restart your development server.</p>
                    <hr style={{ margin: '1rem 0', borderColor: '#444' }} />
                    <h3>Error Details:</h3>
                    <pre style={{ backgroundColor: '#111', padding: '1rem', borderRadius: '4px', overflowX: 'auto' }}>
                        {this.state.error?.toString()}
                    </pre>
                    <h3>Stack Trace:</h3>
                    <pre style={{ backgroundColor: '#111', padding: '1rem', borderRadius: '4px', overflowX: 'auto', fontSize: '0.8rem' }}>
                        {this.state.errorInfo?.componentStack}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
