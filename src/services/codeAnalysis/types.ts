import type { CodeAnalysisResult, CodeMetrics, CodeExplanations, CodeSuggestion } from '@/types/codeAnalysis';

export type { CodeAnalysisResult, CodeMetrics, CodeExplanations, CodeSuggestion };

export interface AnalysisCache {
    fileId: string;
    content: string;
    analysis: CodeAnalysisResult;
    timestamp: number;
}

export interface AnalysisResponse {
    metrics: CodeMetrics;
    explanations: CodeExplanations;
    suggestions: CodeSuggestion[];
}

export type AnalysisSeverity = 'info' | 'warning' | 'error';

// ... другие типы
