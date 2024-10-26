export interface CodeMetrics {
    readability: number
    complexity: number
    performance: number
}

export interface CodeSuggestion {
    line: number
    message: string
    severity: 'error' | 'warning' | 'info'
}

export interface CodeAnalysisResult {
    metrics: {
        readability: number
        complexity: number
        performance: number
    }
    suggestions: CodeSuggestion[]
}

export interface AnalysisCache {
    timestamp: number
    hash: string
    analysis: CodeAnalysisResult
}
