import { BaseProps } from '@/types'
import { X } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { CodeSuggestion, CodeExplanations, CodeMetrics } from '@/types/codeAnalysis'
import { useMetricsState } from './hooks/useMetricsState'
import { useSuggestionsState } from './hooks/useSuggestionsState'
import { MetricsSection } from './components/MetricsSection'
import { SuggestionsSection } from './components/SuggestionsSection'
import { Trophy } from 'lucide-react'

interface AIAssistantProps extends BaseProps {
    isOpen: boolean
    toggleAssistant: () => void
    metrics: CodeMetrics
    suggestions: CodeSuggestion[]
    explanations: CodeExplanations
}

/**
 * TODO: Critical Fixes
 * 1. Metrics Initialization:
 *    - Remove default 70% values
 *    - Add proper loading states with skeletons
 *    - Implement smooth transitions only for updates
 * 
 * 2. Explanations State:
 *    - Add persistent state management
 *    - Store expanded/collapsed state
 *    - Implement proper transitions
 * 
 * 3. Layout:
 *    - Fix scrollbar issues
 *    - Implement custom scrollbar
 *    - Ensure consistent metrics display
 */
export default function AIAssistant({ 
    isOpen, 
    toggleAssistant, 
    metrics: initialMetrics, 
    suggestions: initialSuggestions, 
    explanations: initialExplanations 
}: AIAssistantProps) {
    const [isReady, setIsReady] = useState(false);
    const { metricsState } = useMetricsState(initialMetrics);
    const { 
        suggestionsState, 
        filterSuggestions, 
        toggleFilter 
    } = useSuggestionsState(initialSuggestions);

    // Обновляем функцию проверки "идеального" кода
    const isPerfectCode = useCallback(() => {
        // Проверяем наличие suggestions
        const hasNoSuggestions = suggestionsState.items.length === 0;
        
        // Проверяем высокие метрики (85+ считаем хорошим показателем)
        const hasHighMetrics = Object.values(metricsState.values).every(
            (value: number) => value >= 85
        );
        
        // Проверяем наличие объяснений
        const hasExplanations = Object.values(initialExplanations).every(
            (exp) => exp.strengths.length > 0
        );

        return hasNoSuggestions && hasHighMetrics && hasExplanations;
    }, [suggestionsState.items, metricsState.values, initialExplanations]);

    // Добавляем эффект для установки isReady
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    // Обновляем isReady при изменении данных
    useEffect(() => {
        if (initialMetrics && initialSuggestions) {
            setIsReady(true);
        }
    }, [initialMetrics, initialSuggestions]);

    return (
        <div className={`h-full bg-white dark:bg-gray-800 border-l 
                        border-gray-200 dark:border-gray-700 transition-all 
                        duration-300 ${isOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
            <div className="h-full p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                        AI Assistant
                    </h2>
                    <button 
                        onClick={toggleAssistant} 
                        className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <MetricsSection 
                    metrics={metricsState.values}
                    explanations={initialExplanations}
                    isLoading={!isReady || metricsState.isLoading}
                />

                {!isPerfectCode() && (
                    <SuggestionsSection 
                        suggestions={filterSuggestions(suggestionsState.items)}
                        isLoading={!isReady}
                        filters={suggestionsState.filters}
                        onToggleFilter={toggleFilter}
                        isPerfectCode={isPerfectCode()}
                    />
                )}

                {isPerfectCode() && isReady && (
                    <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                        <Trophy className="w-16 h-16 text-yellow-400 animate-pulse" />
                        <div className="text-center">
                            <h4 className="text-lg font-bold text-green-500 dark:text-green-400 mb-2">
                                Превосходный код!
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Код соответствует всем стандартам качества
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
