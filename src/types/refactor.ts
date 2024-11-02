export interface RefactorRequest {
    code: string;
    context?: string;
}

export interface RefactorResponse {
    result: string;
    suggestions: Array<{
        message: string;
        type: 'info' | 'warning' | 'error';
    }>;
}
