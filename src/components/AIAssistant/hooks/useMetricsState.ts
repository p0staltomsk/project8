// Управление состоянием метрик

import { useEffect, useState } from 'react';
import { CodeMetrics } from '@/types/codeAnalysis';

export function useMetricsState(initialMetrics: CodeMetrics) {
    const [metrics, setMetrics] = useState(initialMetrics);
    // Используем isLoading в возвращаемом объекте
    const [isLoading] = useState(false);

    useEffect(() => {
        setMetrics(initialMetrics);
    }, [initialMetrics]);

    return {
        metricsState: {
            values: metrics,
            isLoading
        },
        updateMetrics: setMetrics
    };
}
