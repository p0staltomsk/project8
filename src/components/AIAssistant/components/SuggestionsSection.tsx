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
    onToggleFilter
}: SuggestionsSectionProps) {
    // Показываем секцию только если есть предложения
    if (suggestions.length === 0) {
        return null;
    }

    const typescriptIssues = suggestions.filter(s => s.message.includes('[TypeScript]'));
    const aiSuggestions = suggestions.filter(s => !s.message.includes('[TypeScript]'));

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
                            ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                >
                    TypeScript Issues ({typescriptIssues.length})
                </button>
                <button
                    onClick={() => onToggleFilter('ai')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                        filters.ai 
                            ? 'bg-purple-500 dark:bg-purple-600 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                >
                    AI Suggestions ({aiSuggestions.length})
                </button>
            </div>
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
        </>
    );
}
