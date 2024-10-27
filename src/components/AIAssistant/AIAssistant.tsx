import { BaseProps } from '@/types'
import { X, Trophy, Loader2 } from 'lucide-react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { CodeSuggestion, CodeExplanations, CodeMetrics } from '@/types/codeAnalysis'
import { useMetricsState } from './hooks/useMetricsState'
import { useSuggestionsState } from './hooks/useSuggestionsState'
import { MetricsSection } from './components/MetricsSection'
import ReactDOM from 'react-dom/client'
import SubscriptionPopup from '../Popup/subscription'

interface AIAssistantProps extends BaseProps {
    isOpen: boolean
    toggleAssistant: () => void
    metrics: CodeMetrics
    suggestions: CodeSuggestion[]
    explanations: CodeExplanations
    onProblemClick?: (line: number) => void // Добавляем новый проп
}

/**
 * TODO: Critical Fixes
 * 1. Metrics Initialization ✅ Решено
 *    - [x] Remove default 70% values
 *    - [ ] Add proper loading states with skeletons
 *    - [x] Implement smooth transitions
 * 
 * 2. Explanations State 🟡 В процессе
 *    - [x] Add persistent state management
 *    - [ ] Store expanded/collapsed state
 *    - [x] Implement proper transitions
 * 
 * 3. Layout 🟡 В процессе
 *    - [ ] Fix scrollbar issues
 *    - [ ] Implement custom scrollbar
 *    - [x] Ensure consistent metrics display
 */
export default function AIAssistant({ 
    isOpen, 
    toggleAssistant, 
    metrics, 
    suggestions, 
    explanations,
    onProblemClick 
}: AIAssistantProps) {
    const [isReady, setIsReady] = useState(false);
    const [isIssuesVisible, setIsIssuesVisible] = useState(false);
    const { metricsState } = useMetricsState(metrics);
    const { suggestionsState } = useSuggestionsState(suggestions);

    // Проверяем, были ли метрики уже посчитаны
    const hasMetrics = useMemo(() => {
        return Object.values(metricsState.values).some(value => value > 0);
    }, [metricsState.values]);

    // Разделяем suggestions на типы сразу при получении
    const freeTierSuggestions = useMemo(() => suggestions.filter(s => 
        s.message.includes('[TypeScript]') || 
        s.message.includes('[Type Error]') ||
        s.message.includes('[Type Mismatch]') ||
        s.message.includes('[Missing Property]') ||
        s.message.includes('[Unreachable Code]') ||
        s.message.includes('[Missing Module]') ||
        s.message.includes('[Missing Declaration]') ||
        s.message.includes('[Import Error]') ||
        s.message.includes('[Declaration Error]') ||
        s.message.includes('[Syntax Error]') ||
        s.severity === 'error'
    ), [suggestions]);

    // AI suggestions - это все остальные предложения
    const aiSuggestions = useMemo(() => 
        suggestions.filter(s => !freeTierSuggestions.includes(s))
    , [suggestions, freeTierSuggestions]);

    // Проверка идеального кода
    const isPerfectCode = useCallback(() => {
        const allMetricsHigh = Object.values(metricsState.values).every(value => value >= 85);
        const noErrors = !freeTierSuggestions.some(s => s.severity === 'error');
        const noAIIssues = aiSuggestions.length === 0 || 
            (aiSuggestions.length === 1 && aiSuggestions[0].message.includes('[Perfect Code]'));
        
        return allMetricsHigh && noErrors && noAIIssues;
    }, [metricsState.values, freeTierSuggestions, aiSuggestions]);

    // Эффект для управления видимостью Problems
    useEffect(() => {
        if (freeTierSuggestions.length > 0) {
            setIsIssuesVisible(true);
        }
    }, [freeTierSuggestions.length]);

    useEffect(() => {
        setIsReady(true);
    }, []);

    // Добавляем функцию для показа попапа подпски
    const showSubscriptionPopup = useCallback(() => {
        const subscriptionPopup = document.createElement('div');
        subscriptionPopup.id = 'subscription-popup-container';
        document.body.appendChild(subscriptionPopup);
        
        const root = ReactDOM.createRoot(subscriptionPopup);
        root.render(
            <SubscriptionPopup 
                isOpen={true}
                onClose={() => {
                    root.unmount();
                    subscriptionPopup.remove();
                }}
                onSubscribe={(plan) => {
                    console.log(`Selected plan: ${plan}`);
                    root.unmount();
                    subscriptionPopup.remove();
                }}
            />
        );
    }, []);

    // Добавляем функцию для эмуляции Ctrl+S
    const triggerSaveAndAnalyze = useCallback(() => {
        const event = new KeyboardEvent('keydown', {
            key: 's',
            code: 'KeyS',
            ctrlKey: true,
            bubbles: true
        });
        document.dispatchEvent(event);
    }, []);

    // Добавляем обработчик клика по проблеме
    const handleProblemClick = useCallback((line: number) => {
        onProblemClick?.(line);
    }, [onProblemClick]);

    return (
        <div className={`h-full bg-white dark:bg-gray-800 border-l 
                        border-gray-200 dark:border-gray-700 transition-all 
                        duration-300 ${isOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
            <div className="h-full flex flex-col">
                <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
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

                    {/* Блок 1: Метрики (если посчитаны) */}
                    {hasMetrics && (
                        <MetricsSection 
                            metrics={metricsState.values}
                            explanations={explanations}
                            isLoading={!isReady}
                        />
                    )}

                    {/* Блок 2: Pro Features (если есть AI suggestions) */}
                    {hasMetrics && aiSuggestions.length > 0 && (
                        <div 
                            onClick={showSubscriptionPopup}
                            className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/10 rounded border border-purple-100 dark:border-purple-900/20 text-xs cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-purple-600 dark:text-purple-400 font-medium">
                                    🔒 Pro Features Available
                                </span>
                                <span className="bg-purple-200 dark:bg-purple-800 px-2 py-0.5 rounded text-purple-700 dark:text-purple-300">
                                    {aiSuggestions.length} suggestions
                                </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                Upgrade to see AI-powered suggestions and advanced code insights
                            </p>
                        </div>
                    )}

                    {/* Блок 3: Perfect Code (если применимо) */}
                    {hasMetrics && !suggestionsState.isInitialState && isPerfectCode() && (
                        <div className="mt-4 flex flex-col items-center justify-center p-6 space-y-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
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

                    {/* Блок 4: Инструкция для анализа */}
                    {!hasMetrics && (
                        <div 
                            onClick={triggerSaveAndAnalyze}
                            className="flex flex-col items-center justify-center p-6 space-y-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/20 cursor-pointer transition-colors"
                        >
                            <div className="text-center">
                                <h4 className="text-lg font-bold text-blue-500 dark:text-blue-400 mb-2">
                                    Click here or Press Ctrl+S to Analyze
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Save your code to get AI-powered suggestions and metrics
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Блок 5: Problems всегда внизу */}
                {freeTierSuggestions.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Problems
                                </h3>
                                {!isIssuesVisible && (
                                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                )}
                            </div>
                            <ul className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pr-2">
                                {freeTierSuggestions.map((suggestion, index) => (
                                    <li 
                                        key={index}
                                        onClick={() => handleProblemClick(suggestion.line)}
                                        style={{ 
                                            transitionDelay: `${index * 50}ms`
                                        }}
                                        className={`text-xs p-2 rounded border transform transition-all duration-300 ease-in-out 
                                            cursor-pointer hover:bg-opacity-80 hover:scale-[1.01] active:scale-[0.99]
                                            break-words whitespace-normal overflow-hidden
                                            ${isIssuesVisible 
                                                ? 'opacity-100 translate-y-0' 
                                                : 'opacity-0 translate-y-2'
                                            } ${
                                                suggestion.severity === 'error' 
                                                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20'
                                                    : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/20'
                                            }`}
                                    >
                                        <div className="flex items-start space-x-2">
                                            <span className="flex-shrink-0 mt-0.5">
                                                {suggestion.severity === 'error' ? '🔴' : '⚠️'}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <span className="font-medium">Line {suggestion.line}:</span>{' '}
                                                <span className="break-words">
                                                    {suggestion.message}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
