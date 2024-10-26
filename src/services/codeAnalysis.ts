import axios, { AxiosError } from 'axios'
import { 
    GROQ_API_KEY, 
    CODE_ANALYSIS_SYSTEM_PROMPT, 
    GROQ_CONFIG,
    getHeaders 
} from '../config/groq'
import type { CodeAnalysisResult, CodeSuggestion } from '../types/codeAnalysis'

const CACHE_KEY_PREFIX = 'code_analysis_';

interface FileAnalysisCache {
    fileId: string;
    analysis: CodeAnalysisResult;
    timestamp: number;
    hash: string;
}

// Экспортируем нужные функции
export async function analyzeCode(code: string, fileId: string): Promise<CodeAnalysisResult> {
    // Проверяем кеш
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

        const cleanContent = content
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
        
        const analysis = JSON.parse(cleanContent);
        
        // Валидируем и нормализуем ответ
        const validatedAnalysis: CodeAnalysisResult = {
            metrics: {
                readability: normalizeMetric(analysis.metrics?.readability),
                complexity: normalizeMetric(analysis.metrics?.complexity),
                performance: normalizeMetric(analysis.metrics?.performance)
            },
            suggestions: (analysis.suggestions || []).map((suggestion: any) => ({
                line: suggestion.line || 1,
                message: suggestion.message || 'Unknown issue',
                severity: validateSeverity(suggestion.severity)
            }))
        };

        // Сохраняем в кеш
        cacheAnalysis(fileId, code, validatedAnalysis);
        
        return validatedAnalysis;
    } catch (error) {
        console.error('GROQ API Error:', error);
        
        // В случае ошибки возвращаем последний кешированный результат
        const lastCached = getLastCachedAnalysis(fileId);
        if (lastCached) {
            return lastCached.analysis;
        }
        
        throw error;
    }
}

export function getCachedAnalysis(fileId: string, code: string): CodeAnalysisResult | null {
    try {
        const cacheKey = `${CACHE_KEY_PREFIX}${fileId}`;
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;

        const parsedCache: FileAnalysisCache = JSON.parse(cached);
        
        // Проверяем актуальность по хешу кода
        if (hashCode(code) !== parsedCache.hash) {
            return null;
        }

        return parsedCache.analysis;
    } catch {
        return null;
    }
}

// Также экспортируем вспомогательные функции, которые могут понадобиться
export function getLastCachedAnalysis(fileId: string): FileAnalysisCache | null {
    try {
        const cacheKey = `${CACHE_KEY_PREFIX}${fileId}`;
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;
        return JSON.parse(cached);
    } catch {
        return null;
    }
}

export function cacheAnalysis(fileId: string, code: string, analysis: CodeAnalysisResult): void {
    try {
        const cacheKey = `${CACHE_KEY_PREFIX}${fileId}`;
        const cacheData: FileAnalysisCache = {
            fileId,
            analysis,
            timestamp: Date.now(),
            hash: hashCode(code)
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Cache write error:', error);
    }
}

function hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return hash.toString(36);
}

function normalizeMetric(value: any): number {
    const num = Number(value)
    if (isNaN(num)) return 70
    return Math.min(Math.max(Math.round(num), 0), 100)
}

function validateSeverity(severity: any): 'info' | 'warning' | 'error' {
    const validSeverities = ['info', 'warning', 'error']
    return validSeverities.includes(severity) ? severity : 'info'
}

/**
 * TODO: Интеграция с Grog API:
 * 
 * 1. Системный промт для анализа:
 *    - Определение метрик качества кода
 *    - Поиск потенциальных проблем
 *    - Предложения по улучшению
 * 
 * 2. Формат запроса:
 *    - Минимизация кода перед отправкой
 *    - Удалене комментариев и форматирования
 *    - Сохранение контекста для анализа
 * 
 * 3. Структура ответа:
 *    {
 *      metrics: {
 *        readability: number,
 *        complexity: number,
 *        performance: number
 *      },
 *      suggestions: Array<{
 *        line: number,
 *        message: string,
 *        severity: 'info' | 'warning' | 'error'
 *      }>
 *    }
 */
