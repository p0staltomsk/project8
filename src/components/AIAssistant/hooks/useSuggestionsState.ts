// Управление состоянием suggestions

import { useState, useEffect } from 'react';
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
}

export function useSuggestionsState(initialSuggestions?: CodeSuggestion[]) {
    const [suggestionsState, setSuggestionsState] = useState<SuggestionsState>({
        items: [],
        isLoading: false,
        filters: {
            typescript: true,
            ai: true
        },
        source: {
            editor: true,
            ai: true
        }
    });

    useEffect(() => {
        if (initialSuggestions) {
            setSuggestionsState(prev => ({
                ...prev,
                items: initialSuggestions,
                lastUpdated: Date.now()
            }));
        } else {
            setSuggestionsState(prev => ({
                ...prev,
                items: [],
                lastUpdated: Date.now()
            }));
        }
    }, [initialSuggestions]);

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
        setSuggestionsState,
        filterSuggestions,
        toggleFilter
    };
}
