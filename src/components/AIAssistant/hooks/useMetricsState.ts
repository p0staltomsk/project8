// Управление состоянием метрик

import { useState, useCallback, useEffect } from 'react';
import { CodeMetrics } from '@/types/codeAnalysis';

interface MetricsState {
    values: CodeMetrics;
    isLoading: boolean;
    lastUpdated: number;
    source: 'cache' | 'live' | 'default';
}

const defaultMetrics: CodeMetrics = {
    readability: 0,
    complexity: 0,
    performance: 0,
    security: 0
};

export function useMetricsState(initialMetrics?: CodeMetrics) {
    const [metricsState, setMetricsState] = useState<MetricsState>({
        values: initialMetrics || defaultMetrics,
        isLoading: true,
        lastUpdated: 0,
        source: 'default'
    });

    const updateMetrics = useCallback((newMetrics: CodeMetrics, source: MetricsState['source']) => {
        setMetricsState(prev => ({
            values: newMetrics,
            isLoading: false,
            lastUpdated: Date.now(),
            source
        }));
    }, []);

    // Обработка изменений метрик
    useEffect(() => {
        if (initialMetrics) {
            updateMetrics(initialMetrics, 'live');
        }
    }, [initialMetrics, updateMetrics]);

    // Кэширование состояния
    useEffect(() => {
        if (metricsState.source === 'live') {
            localStorage.setItem('metrics-cache', JSON.stringify({
                values: metricsState.values,
                timestamp: metricsState.lastUpdated
            }));
        }
    }, [metricsState]);

    return { metricsState, updateMetrics };
}
