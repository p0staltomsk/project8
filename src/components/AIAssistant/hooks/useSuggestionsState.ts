// Управление состоянием suggestions

import { useState, useEffect, useCallback } from 'react';
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
        isInitialState: !initialSuggestions?.length
    });

    // Обновляем состояние только при изменении входных данных
    useEffect(() => {
        if (initialSuggestions) {
            setSuggestionsState(prev => ({
                ...prev,
                items: initialSuggestions,
                isInitialState: false
            }));
        }
    }, [initialSuggestions]);

    const filterSuggestions = useCallback((suggestions: CodeSuggestion[]) => {
        return suggestions.filter((suggestion: CodeSuggestion) => {
            const isTypeScriptIssue = suggestion.message.includes('[TypeScript]') || 
                                    suggestion.message.includes('[Type Error]');
            return isTypeScriptIssue ? suggestionsState.filters.typescript : suggestionsState.filters.ai;
        });
    }, [suggestionsState.filters]);

    const toggleFilter = useCallback((filterType: 'typescript' | 'ai') => {
        setSuggestionsState(prev => ({
            ...prev,
            filters: {
                ...prev.filters,
                [filterType]: !prev.filters[filterType]
            }
        }));
    }, []);

    return {
        suggestionsState,
        filterSuggestions,
        toggleFilter
    };
}
