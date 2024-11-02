declare module '@/config/groq' {
    export const GROQ_API_KEY: string;
    export const GROQ_CONFIG: {
        apiUrl: string;
        model: string;
        temperature: number;
        maxTokens: number;
    };
    export const CODE_ANALYSIS_SYSTEM_PROMPT: string;
}
