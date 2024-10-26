import React from 'react';
import type { CodeSuggestion as ICodeSuggestion } from '../../types/codeAnalysis';

interface CodeSuggestionProps {
    suggestion: ICodeSuggestion;
    onLineClick: (line: number) => void;
}

export const CodeSuggestion: React.FC<CodeSuggestionProps> = ({ suggestion, onLineClick }) => {
    return (
        <div 
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors"
            onClick={() => onLineClick(suggestion.line)}
        >
            <div className={`text-sm ${getSeverityColor(suggestion.severity)}`}>
                Line {suggestion.line}: {suggestion.message}
            </div>
        </div>
    );
};

const getSeverityColor = (severity: ICodeSuggestion['severity']) => {
    switch (severity) {
        case 'error': return 'text-red-600 dark:text-red-400';
        case 'warning': return 'text-yellow-600 dark:text-yellow-400';
        case 'info': return 'text-blue-600 dark:text-blue-400';
    }
};
