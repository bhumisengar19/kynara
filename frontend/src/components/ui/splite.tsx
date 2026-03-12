'use client'

import React, { Suspense, lazy } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
    scene: string
    className?: string
    onLoadError?: () => void
}

class SplineErrorBoundary extends React.Component<{ children: React.ReactNode, onError: () => void }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch() {
        this.props.onError();
    }
    render() {
        if (this.state.hasError) return null;
        return this.props.children;
    }
}

export function SplineScene({ scene, className, onLoadError }: SplineSceneProps) {
    const [failed, setFailed] = React.useState(false);

    const handleError = () => {
        setFailed(true);
        if (onLoadError) onLoadError();
    };

    if (failed) return null;

    return (
        <SplineErrorBoundary onError={handleError}>
            <Suspense
                fallback={
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="loader"></span>
                    </div>
                }
            >
                <Spline
                    scene={scene}
                    className={className}
                />
            </Suspense>
        </SplineErrorBoundary>
    )
}

