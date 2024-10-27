// Управление состоянием suggestions

import { useState } from 'react';
import { CodeSuggestion } from '@/types/codeAnalysis';

interface SuggestionsState {
    items: CodeSuggestion[];
    isLoading: boolean;
    filters: {
        typescript: boolean;
        ai: boolean;
    };
    source: {
        editor: boolean;
        ai: boolean;
    };
    isInitialState: boolean;
}

export function useSuggestionsState(initialSuggestions?: CodeSuggestion[]) {
    const [suggestionsState, setSuggestionsState] = useState<SuggestionsState>({
        items: initialSuggestions || [],
        isLoading: false,
        filters: {
            typescript: true,
            ai: true
        },
        source: {
            editor: true,
            ai: true
        },
        isInitialState: true // Всегда начинаем с true
    });

    const setSuggestions = (suggestions: CodeSuggestion[]) => {
        setSuggestionsState(prev => ({
            ...prev,
            items: suggestions,
            // Меняем логику: isInitialState = true только если нет анализа вообще
            isInitialState: suggestions.length === 0 && !suggestions.some(s => 
                s.message.includes('[AI Analysis]') || 
                s.message.includes('[Perfect Code]')
            )
        }));
    };

    const filterSuggestions = (suggestions: CodeSuggestion[]) => {
        return suggestions.length > 0 
            ? suggestions.filter((suggestion: CodeSuggestion) => {
                const isTypeScriptIssue = suggestion.message.includes('[TypeScript]') || 
                                        suggestion.message.includes('[Type Error]') ||
                                        suggestion.message.includes('[Type Mismatch]') ||
                                        suggestion.message.includes('[Missing Property]') ||
                                        suggestion.message.includes('[Unreachable Code]');

                if (isTypeScriptIssue) {
                    return suggestionsState.filters.typescript;
                }
                return suggestionsState.filters.ai;
            })
            : [];
    };

    const toggleFilter = (filterType: 'typescript' | 'ai') => {
        setSuggestionsState(prev => ({
            ...prev,
            filters: {
                ...prev.filters,
                [filterType]: !prev.filters[filterType]
            }
        }));
    };

    return {
        suggestionsState,
        setSuggestions,
        filterSuggestions,
        toggleFilter
    };
}
