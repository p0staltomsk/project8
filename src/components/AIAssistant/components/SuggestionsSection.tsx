// Секция с suggestions

import { CodeSuggestion } from '@/types/codeAnalysis';
import { CheckCircle2, Loader, Trophy, Star } from 'lucide-react';

interface SuggestionsSectionProps {
    suggestions: CodeSuggestion[];
    isLoading: boolean;
    filters: {
        typescript: boolean;
        ai: boolean;
    };
    onToggleFilter: (filterType: 'typescript' | 'ai') => void;
    isPerfectCode: boolean;
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

function getSuccessMessage() {
    const messages = [
        "Превосходный код! Чисто, эффективно и безопасно.",
        "Великолепная работа! Код соответствует всем стандартам.",
        "Потрясающе! Ваш код - пример для подражания."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

export function SuggestionsSection({ 
    suggestions, 
    isLoading, 
    filters, 
    onToggleFilter,
    isPerfectCode 
}: SuggestionsSectionProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                <span className="ml-2 text-sm text-gray-500">Loading suggestions...</span>
            </div>
        );
    }

    if (isPerfectCode) {
        return (
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
        );
    }

    const typescriptIssues = suggestions.filter(s => s.message.includes('[TypeScript]'));
    const aiIssues = suggestions.filter(s => !s.message.includes('[TypeScript]'));

    return (
        <>
            <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Suggestions
            </h3>
            <div className="flex gap-2 mb-3">
                <button
                    onClick={() => onToggleFilter('typescript')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                        filters.typescript 
                            ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-sm hover:bg-blue-600 dark:hover:bg-blue-700' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    TypeScript Issues ({typescriptIssues.length})
                </button>
                <button
                    onClick={() => onToggleFilter('ai')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                        filters.ai 
                            ? 'bg-purple-500 dark:bg-purple-600 text-white shadow-sm hover:bg-purple-600 dark:hover:bg-purple-700' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    AI Suggestions ({aiIssues.length})
                </button>
            </div>
            {suggestions.length > 0 ? (
                <ul className="space-y-3">
                    {suggestions.map((suggestion, index) => (
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
    );
}
