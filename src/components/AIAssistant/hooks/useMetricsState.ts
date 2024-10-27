// Управление состоянием метрик

import { useEffect } from 'react';
import { CodeMetrics } from '@/types/codeAnalysis';
import { useAnalysisStore } from '@/store/analysisStore';

export function useMetricsState(initialMetrics: CodeMetrics | undefined) {
    const { metrics, isLoading, setMetrics, setLoading } = useAnalysisStore();

    useEffect(() => {
        if (initialMetrics) {
            const hasRealValues = Object.values(initialMetrics).some(value => value > 0);
            
            if (hasRealValues) {
                setLoading(false);
                setMetrics(initialMetrics);
            }
        }
    }, [initialMetrics, setMetrics, setLoading]);

    return {
        metricsState: {
            values: metrics,
            isLoading
        },
        updateMetrics: setMetrics
    };
}
