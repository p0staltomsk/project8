import { BaseProps } from '@/types'
import { X, Loader, CheckCircle2, Trophy, Star } from 'lucide-react'
import MetricBar from './MetricBar'
import { useState, useEffect } from 'react'
import { 
    CodeSuggestion, 
    CodeExplanations, 
    CodeMetrics
} from '@/types/codeAnalysis'

interface AIAssistantProps extends BaseProps {
    isOpen: boolean
    toggleAssistant: () => void
    metrics: CodeMetrics
    suggestions: CodeSuggestion[]
    explanations: CodeExplanations
}

export default function AIAssistant({ isOpen, toggleAssistant, metrics, suggestions, explanations }: AIAssistantProps) {
    const [showTypeScriptIssues, setShowTypeScriptIssues] = useState(true);
    const [showAIIssues, setShowAIIssues] = useState(true);
    const [isReady, setIsReady] = useState(false);

    // Оставляем только базовую инициализацию
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Добавим более подробную отладку
    useEffect(() => {
        console.group('AIAssistant State');
        console.log('Metrics:', metrics);
        console.log('Explanations:', explanations);
        console.log('Suggestions:', suggestions);
        console.groupEnd();
    }, [metrics, explanations, suggestions]);

    // Добавим отладочный вывод
    useEffect(() => {
        console.log('AIAssistant received explanations:', explanations);
    }, [explanations]);

    // Фильтруем suggestions
    const filteredSuggestions = suggestions.filter(suggestion => {
        const isTypeScriptIssue = suggestion.message.includes('[TypeScript]') || 
                                 suggestion.message.includes('[Type Error]') ||
                                 suggestion.message.includes('[Type Mismatch]') ||
                                 suggestion.message.includes('[Missing Property]') ||
                                 suggestion.message.includes('[Unreachable Code]');

        if (isTypeScriptIssue) {
            return showTypeScriptIssues;
        }
        return showAIIssues;
    });

    // Оставляем только нужные функции
    const getSeverityColor = (severity: CodeSuggestion['severity']) => {
        switch (severity) {
            case 'error':
                return 'text-red-400 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800';
            case 'warning':
                return 'text-yellow-400 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-100 dark:border-yellow-800';
            default:
                return 'text-blue-400 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800';
        }
    };

    const getSeverityIcon = (severity: CodeSuggestion['severity']) => {
        switch (severity) {
            case 'error':
                return '🔴';
            case 'warning':
                return '⚠️';
            default:
                return 'ℹ️';
        }
    };

    // Добавляем дефолтные значения для explanations
    const defaultExplanations = {
        readability: { score: 70, strengths: [], improvements: [] },
        complexity: { score: 70, strengths: [], improvements: [] },
        performance: { score: 70, strengths: [], improvements: [] },
        security: { score: 70, strengths: [], improvements: [] }
    };

    // Используем дефолтные значения если explanations undefined
    const safeExplanations = explanations || defaultExplanations;

    // Функция для проверки идеального кода
    const isPerfectCode = () => {
        return filteredSuggestions.length === 0 && 
               Object.values(metrics).every(value => value >= 90);
    };

    // Функция для получения поздравительного сообщения
    const getSuccessMessage = () => {
        const messages = [
            "Превосходный код! Чисто, эффективно и безопасно.",
            "Великолепная работа! Код соответствует всем стандартам.",
            "Потрясающе! Ваш код - пример для подражания."
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    };

    /**
     * TODO: 
     * 1. Metrics Stability:
     *    - Предотвратить сброс метрик на 70%
     *    - Добавить плавные переходы при изменении значений
     *    - Сохранять предыдущие значения при переключении файлов
     * 
     * 2. Suggestions Management:
     *    - Улучшить обновление списка suggestions
     *    - Добавить индикатор загрузки для каждой секции
     *    - Исправить проблему с исчезновением suggestions
     *    - Отключать кнопку AI Suggestions если нет анализа
     *    - Добавить тултип "Save document to get Suggestions"
     *    - Добавить визуальную индикацию неактивного состояния
     */

    return (
        <div className={`h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-all duration-300 ${
            isOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}>
            <div className="h-full p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">AI Assistant</h2>
                    <button onClick={toggleAssistant} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                
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

                {!isReady ? (
                    <div className="flex items-center justify-center p-4">
                        <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                        <span className="ml-2 text-sm text-gray-500">Loading suggestions...</span>
                    </div>
                ) : isPerfectCode() ? (
                    <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                        <div className="relative">
                            <Trophy className="w-16 h-16 text-yellow-400 animate-pulse" />
                            <Star className="w-6 h-6 text-yellow-300 absolute -top-1 -right-1 animate-bounce" />
                        </div>
                        <div className="text-center">
                            <h4 className="text-lg font-bold text-green-500 dark:text-green-400 mb-2">
                                Превосходный код!
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {getSuccessMessage()}
                            </p>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-sm text-green-500 dark:text-green-400">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Все проверки пройдены</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">
                            Suggestions
                        </h3>
                        <div className="flex gap-2 mb-3">
                            <button
                                onClick={() => setShowTypeScriptIssues(!showTypeScriptIssues)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                    showTypeScriptIssues 
                                        ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-sm hover:bg-blue-600 dark:hover:bg-blue-700' 
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                TypeScript Issues ({filteredSuggestions.filter(s => s.message.includes('[TypeScript]')).length})
                            </button>
                            <button
                                onClick={() => setShowAIIssues(!showAIIssues)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                    showAIIssues 
                                        ? 'bg-purple-500 dark:bg-purple-600 text-white shadow-sm hover:bg-purple-600 dark:hover:bg-purple-700' 
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                AI Suggestions ({filteredSuggestions.filter(s => !s.message.includes('[TypeScript]')).length})
                            </button>
                        </div>
                        {filteredSuggestions.length > 0 ? (
                            <ul className="space-y-3">
                                {filteredSuggestions.map((suggestion, index) => (
                                    <li 
                                        key={index}
                                        className={`text-sm p-3 rounded-lg border ${getSeverityColor(suggestion.severity)}`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <span>{getSeverityIcon(suggestion.severity)}</span>
                                            <div>
                                                <span className="font-semibold">Line {suggestion.line}:</span>{' '}
                                                <span className="text-gray-700 dark:text-gray-300">{suggestion.message}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center text-gray-500 dark:text-gray-400 p-4">
                                No issues found
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
