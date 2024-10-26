import axios from 'axios'
import { 
    GROQ_API_KEY, 
    CODE_ANALYSIS_SYSTEM_PROMPT, 
    GROQ_CONFIG,
    getHeaders 
} from '../config/groq'
import type { CodeAnalysisResult } from '../types/codeAnalysis'

const CACHE_KEY_PREFIX = 'code_analysis_';

interface AnalysisCache {
    fileId: string;
    content: string;
    analysis: CodeAnalysisResult;
    timestamp: number;
}

function normalizeMetric(value: any): number {
    const num = Number(value)
    if (isNaN(num)) return 70
    return Math.min(Math.max(Math.round(num), 0), 100)
}

function validateSeverity(severity: any): 'info' | 'warning' | 'error' {
    const validSeverities = ['info', 'warning', 'error'] as const
    return validSeverities.includes(severity) ? severity : 'info'
}

function cacheAnalysis(fileId: string, code: string, analysis: CodeAnalysisResult): void {
    try {
        const cacheKey = `${CACHE_KEY_PREFIX}${fileId}`;
        const cacheData: AnalysisCache = {
            fileId,
            content: code,
            analysis,
            timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Cache write error:', error);
    }
}

function getCachedAnalysis(fileId: string, code: string): CodeAnalysisResult | null {
    try {
        const cacheKey = `${CACHE_KEY_PREFIX}${fileId}`;
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;

        const parsedCache: AnalysisCache = JSON.parse(cached);
        
        if (parsedCache.content !== code) {
            return null;
        }

        return parsedCache.analysis;
    } catch {
        return null;
    }
}

async function analyzeCode(code: string, fileId: string = 'default'): Promise<CodeAnalysisResult> {
    // Проверяем кеш первым делом
    const cachedAnalysis = getCachedAnalysis(fileId, code);
    if (cachedAnalysis) {
        return cachedAnalysis;
    }

    if (!GROQ_API_KEY || !GROQ_CONFIG) {
        throw new Error('GROQ configuration is missing');
    }

    try {
        const response = await axios.post(
            GROQ_CONFIG.apiUrl,
            {
                model: GROQ_CONFIG.model,
                messages: [
                    { role: 'system', content: CODE_ANALYSIS_SYSTEM_PROMPT },
                    { role: 'user', content: `Analyze this code:\n\n${code}` }
                ],
                temperature: GROQ_CONFIG.temperature,
                max_tokens: GROQ_CONFIG.maxTokens,
            },
            {
                headers: getHeaders(),
            }
        );

        const content = response.data.choices[0]?.message?.content;
        if (!content) {
            throw new Error('Empty response from GROQ API');
        }

        try {
            // Улучшенное извлечение JSON
            const jsonRegex = /\{[\s\S]*?\}(?=\s*$)/;
            const match = content.match(jsonRegex);
            
            if (!match) {
                throw new Error('No valid JSON found in response');
            }

            const jsonString = match[0].trim();
            const analysisData = JSON.parse(jsonString);
            
            // Строгая валидация данных
            const validatedAnalysis: CodeAnalysisResult = {
                metrics: {
                    readability: normalizeMetric(analysisData.metrics?.readability),
                    complexity: normalizeMetric(analysisData.metrics?.complexity),
                    performance: normalizeMetric(analysisData.metrics?.performance)
                },
                suggestions: Array.isArray(analysisData.suggestions) 
                    ? analysisData.suggestions.map((suggestion: any) => ({
                        line: Math.max(1, Number(suggestion.line) || 1),
                        message: String(suggestion.message || '').trim() || 'Unknown issue',
                        severity: validateSeverity(suggestion.severity)
                    }))
                    : []
            };

            cacheAnalysis(fileId, code, validatedAnalysis);
            return validatedAnalysis;

        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.log('Raw content:', content);
            
            return {
                metrics: { readability: 70, complexity: 70, performance: 70 },
                suggestions: [{
                    line: 1,
                    message: 'Could not parse analysis results',
                    severity: 'warning'
                }]
            };
        }
    } catch (error) {
        console.error('GROQ API Error:', error);
        return {
            metrics: { readability: 70, complexity: 70, performance: 70 },
            suggestions: [{
                line: 1,
                message: 'Failed to analyze code',
                severity: 'error'
            }]
        };
    }
}

export { analyzeCode, getCachedAnalysis };
