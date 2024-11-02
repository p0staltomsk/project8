export interface MetricExplanation {
    score: number;
    strengths: string[];
    improvements: string[];
}

export interface CodeMetrics {
    readability: number
    complexity: number
    performance: number
    security: number
}

export interface CodeExplanations {
    readability: MetricExplanation
    complexity: MetricExplanation
    performance: MetricExplanation
    security: MetricExplanation
}

export interface CodeSuggestion {
    line: number
    message: string
    severity: 'error' | 'warning' | 'info'
}

export interface CodeAnalysisResult {
    metrics: CodeMetrics
    explanations: CodeExplanations
    suggestions: CodeSuggestion[]
    isInitialState?: boolean
    error?: boolean
}

export interface AnalysisCache {
    timestamp: number
    hash: string
    analysis: CodeAnalysisResult
}
