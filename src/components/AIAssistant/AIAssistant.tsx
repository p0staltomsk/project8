import { BaseProps } from '@/types'
import { X, Loader } from 'lucide-react'
import MetricBar from './MetricBar'
import { useState, useEffect } from 'react'
import { CodeSuggestion } from '@/types/codeAnalysis'

interface AIAssistantProps extends BaseProps {
    isOpen: boolean
    toggleAssistant: () => void
    metrics: {
        readability: number
        complexity: number
        performance: number
    }
    suggestions: CodeSuggestion[]
}

export default function AIAssistant({ isOpen, toggleAssistant, metrics, suggestions }: AIAssistantProps) {
    const [showTypeScriptIssues, setShowTypeScriptIssues] = useState(true);
    const [showAIIssues, setShowAIIssues] = useState(true);
    const [isReady, setIsReady] = useState(false);

    // Добавляем задержку для инициализации
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 1000); // Даем время на инициализацию Monaco Editor

        return () => clearTimeout(timer);
    }, []);

    // Улучшаем фильтрацию suggestions
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

    // Разделяем suggestions по типам
    const typeScriptSuggestions = suggestions.filter(s => 
        s.message.includes('[TypeScript]') || 
        s.message.includes('[Type Error]') ||
        s.message.includes('[Type Mismatch]') ||
        s.message.includes('[Missing Property]') ||
        s.message.includes('[Unreachable Code]')
    );

    const aiSuggestions = suggestions.filter(s => 
        !s.message.includes('[TypeScript]') && 
        !s.message.includes('[Type Error]') &&
        !s.message.includes('[Type Mismatch]') &&
        !s.message.includes('[Missing Property]') &&
        !s.message.includes('[Unreachable Code]')
    );

    // Функция для определения цвета severity
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

    // Функция для получения иконки severity
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

    // Добавим функцию для генерации уникального ключа
    const getSuggestionKey = (suggestion: CodeSuggestion, index: number): string => {
        return `${suggestion.line}-${suggestion.severity}-${suggestion.message.slice(0, 20)}-${index}`;
    };

    // В начале компонента добавим отладочный вывод
    /*
    useEffect(() => {
        console.group('AIAssistant Debug');
        console.log('Current suggestions:', suggestions);
        console.log('TypeScript suggestions:', typeScriptSuggestions);
        console.log('AI suggestions:', aiSuggestions);
        console.groupEnd();
    }, [suggestions]);
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
                    <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">Code Quality Metrics</h3>
                    <MetricBar value={metrics.readability} label="Readability" />
                    <MetricBar value={metrics.complexity} label="Complexity" />
                    <MetricBar value={metrics.performance} label="Performance" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">
                        Suggestions
                    </h3>
                    {!isReady ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                            <span className="ml-2 text-sm text-gray-500">Loading suggestions...</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-2 mb-3">
                                <button
                                    onClick={() => setShowTypeScriptIssues(!showTypeScriptIssues)}
                                    className={`px-2 py-1 rounded text-xs ${
                                        showTypeScriptIssues ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'
                                    }`}
                                >
                                    TypeScript Issues ({typeScriptSuggestions.length})
                                </button>
                                <button
                                    onClick={() => setShowAIIssues(!showAIIssues)}
                                    className={`px-2 py-1 rounded text-xs ${
                                        showAIIssues ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'
                                    }`}
                                >
                                    AI Suggestions ({aiSuggestions.length})
                                </button>
                            </div>
                            {filteredSuggestions.length > 0 ? (
                                <ul className="space-y-3">
                                    {filteredSuggestions.map((suggestion, index) => (
                                        <li 
                                            key={getSuggestionKey(suggestion, index)}
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
        </div>
    )
}
