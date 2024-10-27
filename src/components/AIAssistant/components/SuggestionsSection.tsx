// Секция с suggestions

import { CodeSuggestion } from '@/types/codeAnalysis';

interface SuggestionsSectionProps {
    suggestions: CodeSuggestion[];
    isLoading: boolean;
    filters: {
        typescript: boolean;
        ai: boolean;
    };
    onToggleFilter: (filterType: 'typescript' | 'ai') => void;
    isPerfectCode: boolean;
    isInitialState: boolean; // Добавляем проп
}

function getSeverityColor(severity: CodeSuggestion['severity']) {
    switch (severity) {
        case 'error':
            return 'text-red-400 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800';
        case 'warning':
            return 'text-yellow-400 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-100 dark:border-yellow-800';
        default:
            return 'text-blue-400 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800';
    }
}

function getSeverityIcon(severity: CodeSuggestion['severity']) {
    switch (severity) {
        case 'error':
            return '🔴';
        case 'warning':
            return '⚠️';
        default:
            return 'ℹ️';
    }
}

export function SuggestionsSection({ 
    suggestions, 
    filters, 
    onToggleFilter,
    isInitialState,
    isPerfectCode
}: SuggestionsSectionProps) {
    // Разделяем suggestions на бесплатные и pro
    const freeTierSuggestions = suggestions.filter(s => 
        s.message.includes('[TypeScript]') || 
        s.message.includes('[Type Error]') ||
        s.message.includes('[Type Mismatch]') ||
        s.message.includes('[Missing Property]') ||
        s.message.includes('[Unreachable Code]') ||
        s.severity === 'error'
    );

    const proSuggestions = suggestions.filter(s => !freeTierSuggestions.includes(s));

    // Показываем инструкцию только в начальном состоянии
    if (isInitialState) {
        return (
            <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                <div className="text-center">
                    <h4 className="text-lg font-bold text-blue-500 dark:text-blue-400 mb-2">
                        Press Ctrl+S to Analyze
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Save your code to get AI-powered suggestions and metrics
                    </p>
                </div>
            </div>
        );
    }

    // Показываем список suggestions, если они есть
    return (
        <>
            <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Editor Issues
            </h3>
            <div className="flex gap-2 mb-3">
                <button
                    onClick={() => onToggleFilter('typescript')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                        filters.typescript 
                            ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                >
                    TypeScript ({freeTierSuggestions.length})
                </button>
            </div>

            {/* Показываем бесплатные suggestions */}
            {freeTierSuggestions.length > 0 && (
                <ul className="space-y-1.5 mb-4">
                    {freeTierSuggestions.map((suggestion, index) => (
                        <li 
                            key={index}
                            className={`text-xs p-2 rounded border ${getSeverityColor(suggestion.severity)}`}
                        >
                            <div className="flex items-start gap-1.5">
                                <span className="mt-0.5">{getSeverityIcon(suggestion.severity)}</span>
                                <div className="flex-1 min-w-0">
                                    <span className="font-medium">L{suggestion.line}:</span>{' '}
                                    <span className="text-gray-700 dark:text-gray-300 break-words">
                                        {suggestion.message}
                                    </span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Показываем уведомление о Pro версии, если есть дополнительные suggestions */}
            {proSuggestions.length > 0 && (
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/10 rounded border border-purple-100 dark:border-purple-900/20 text-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-600 dark:text-purple-400 font-medium">
                            🔒 Pro Features Available
                        </span>
                        <span className="bg-purple-200 dark:bg-purple-800 px-2 py-0.5 rounded text-purple-700 dark:text-purple-300">
                            {proSuggestions.length} suggestions
                        </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Upgrade to see AI-powered suggestions and advanced code insights
                    </p>
                </div>
            )}

            {/* Показываем сообщение, если нет suggestions */}
            {suggestions.length === 0 && !isPerfectCode && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No issues found. Press Ctrl+S to analyze again.
                </div>
            )}
        </>
    );
}
