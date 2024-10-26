export interface CodeMetrics {
    readability: number
    complexity: number
    performance: number
}

export interface CodeSuggestion {
    line: number
    message: string
    severity: 'info' | 'warning' | 'error'
}

export interface CodeAnalysisResult {
    metrics: CodeMetrics
    suggestions: CodeSuggestion[]
}

export interface AnalysisCache {
    timestamp: number
    hash: string
    analysis: CodeAnalysisResult
}
