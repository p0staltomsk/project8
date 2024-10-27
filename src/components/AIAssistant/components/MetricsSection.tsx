// Секция с метриками

import { CodeMetrics, CodeExplanations } from '@/types/codeAnalysis';
import { Loader } from 'lucide-react';
import MetricBar from '../MetricBar';

interface MetricsSectionProps {
    metrics: CodeMetrics;
    explanations?: CodeExplanations;
    isLoading: boolean;
}

export function MetricsSection({ metrics, explanations, isLoading }: MetricsSectionProps) {
    const defaultExplanations = {
        readability: { score: 70, strengths: [], improvements: [] },
        complexity: { score: 70, strengths: [], improvements: [] },
        performance: { score: 70, strengths: [], improvements: [] },
        security: { score: 70, strengths: [], improvements: [] }
    };

    const safeExplanations = explanations || defaultExplanations;

    return (
        <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Code Quality Metrics
            </h3>
            <div className="relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-gray-50/50 dark:bg-gray-800/50 
                                   backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                    </div>
                )}
                <div className={`transition-opacity duration-300 ${
                    isLoading ? 'opacity-50' : 'opacity-100'
                }`}>
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
            </div>
        </div>
    );
}
