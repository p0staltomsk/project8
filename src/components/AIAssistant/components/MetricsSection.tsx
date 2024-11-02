// Секция с метриками

import { CodeMetrics, CodeExplanations } from '@/types/codeAnalysis';
import MetricBar from '../MetricBar';

interface MetricsSectionProps {
    metrics: CodeMetrics;
    explanations?: CodeExplanations;
    isLoading: boolean;
    error?: boolean;
}

export function MetricsSection({ metrics, explanations, isLoading, error }: MetricsSectionProps) {
    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {['readability', 'complexity', 'performance', 'security'].map(metric => (
                    <div key={metric} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-4 text-red-500 dark:text-red-400">
                Failed to load metrics. Please try again.
            </div>
        );
    }

    const safeExplanations = explanations || {
        readability: { score: 0, strengths: [], improvements: [] },
        complexity: { score: 0, strengths: [], improvements: [] },
        performance: { score: 0, strengths: [], improvements: [] },
        security: { score: 0, strengths: [], improvements: [] }
    };

    return (
        <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Code Quality Metrics
            </h3>
            <MetricBar 
                value={metrics.readability} 
                label="Readability"
                type="readability"
                explanation={safeExplanations.readability}
            />
            <MetricBar 
                value={metrics.complexity} 
                label="Complexity"
                type="complexity"
                explanation={safeExplanations.complexity}
            />
            <MetricBar 
                value={metrics.performance} 
                label="Performance"
                type="performance"
                explanation={safeExplanations.performance}
            />
            <MetricBar 
                value={metrics.security} 
                label="Security"
                type="security"
                explanation={safeExplanations.security}
            />
        </div>
    );
}
