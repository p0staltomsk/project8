import { BaseProps } from '@/types'
import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { CodeSuggestion, CodeExplanations, CodeMetrics } from '@/types/codeAnalysis'
import { useMetricsState } from './hooks/useMetricsState'
import { useSuggestionsState } from './hooks/useSuggestionsState'
import { MetricsSection } from './components/MetricsSection'
import { SuggestionsSection } from './components/SuggestionsSection'

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

    // Добавляем эффект для установки isReady
    useEffect(() => {
        // Устанавливаем isReady в true после короткой задержки
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 500); // Уменьшаем время загрузки до 500мс

        return () => clearTimeout(timer);
    }, []); // Запускаем только при монтировании

    // Обновляем isReady при изменении данных
    useEffect(() => {
        if (initialMetrics && initialSuggestions) {
            setIsReady(true);
        }
    }, [initialMetrics, initialSuggestions]);

    // Функция для проверки идеального кода
    const isPerfectCode = () => {
        return suggestionsState.items.length === 0 && 
               Object.values(metricsState.values).every((value: number) => value >= 90);
    };

    // Отфильтрованные suggestions
    const filteredSuggestions = filterSuggestions(suggestionsState.items);

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

                <SuggestionsSection 
                    suggestions={filteredSuggestions}
                    isLoading={!isReady}
                    filters={suggestionsState.filters}
                    onToggleFilter={toggleFilter}
                    isPerfectCode={isPerfectCode()}
                />
            </div>
        </div>
    );
}
