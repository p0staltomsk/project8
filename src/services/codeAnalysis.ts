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
        console.log('🟢 Cache write success:', {
            key: cacheKey,
            fileId,
            contentLength: code.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('🔴 Cache write error:', error);
    }
}

function getCachedAnalysis(fileId: string, code: string): CodeAnalysisResult | null {
    try {
        const cacheKey = `${CACHE_KEY_PREFIX}${fileId}`;
        console.log('🔍 Checking cache for:', cacheKey);
        
        const cached = localStorage.getItem(cacheKey);
        if (!cached) {
            console.log('⚪️ No cache found for:', cacheKey);
            return null;
        }

        const parsedCache: AnalysisCache = JSON.parse(cached);
        console.log('📦 Found cached data:', {
            fileId: parsedCache.fileId,
            timestamp: new Date(parsedCache.timestamp).toISOString(),
            contentLength: parsedCache.content.length
        });
        
        // Проверяем наличие всех необходимых метрик
        if (!parsedCache.analysis?.metrics?.security || 
            !parsedCache.analysis?.metrics?.readability ||
            !parsedCache.analysis?.metrics?.complexity ||
            !parsedCache.analysis?.metrics?.performance) {
            console.log('🟡 Cache invalid: missing metrics');
            return null;
        }
        
        if (parsedCache.content !== code) {
            console.log('🟡 Cache invalid: content mismatch', {
                cachedLength: parsedCache.content.length,
                newLength: code.length
            });
            return null;
        }

        console.log('✅ Using valid cache:', {
            metrics: parsedCache.analysis.metrics,
            suggestionsCount: parsedCache.analysis.suggestions.length
        });
        return parsedCache.analysis;
    } catch (error) {
        console.error('🔴 Cache read error:', error);
        return null;
    }
}

async function analyzeCode(code: string, fileId: string = 'default'): Promise<CodeAnalysisResult> {
    console.log('🔄 Starting code analysis for:', fileId);
    
    // Проверяем кеш первым делом
    const cachedAnalysis = getCachedAnalysis(fileId, code);
    if (cachedAnalysis) {
        console.log('💾 Using cached analysis for:', fileId);
        return cachedAnalysis;
    }

    console.log('🚀 No cache found, performing new analysis');

    if (!GROQ_API_KEY) {
        console.error('🔴 GROQ API key is missing!');
        throw new Error('GROQ API key is required for analysis');
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
                    performance: normalizeMetric(analysisData.metrics?.performance),
                    security: normalizeMetric(analysisData.metrics?.security)
                },
                explanations: {
                    readability: {
                        score: normalizeMetric(analysisData.explanations?.readability?.score),
                        strengths: analysisData.explanations?.readability?.strengths || [],
                        improvements: analysisData.explanations?.readability?.improvements || []
                    },
                    complexity: {
                        score: normalizeMetric(analysisData.explanations?.complexity?.score),
                        strengths: analysisData.explanations?.complexity?.strengths || [],
                        improvements: analysisData.explanations?.complexity?.improvements || []
                    },
                    performance: {
                        score: normalizeMetric(analysisData.explanations?.performance?.score),
                        strengths: analysisData.explanations?.performance?.strengths || [],
                        improvements: analysisData.explanations?.performance?.improvements || []
                    },
                    security: {
                        score: normalizeMetric(analysisData.explanations?.security?.score),
                        strengths: analysisData.explanations?.security?.strengths || [],
                        improvements: analysisData.explanations?.security?.improvements || []
                    }
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
            
            const defaultExplanations = {
                readability: { score: 70, strengths: [], improvements: [] },
                complexity: { score: 70, strengths: [], improvements: [] },
                performance: { score: 70, strengths: [], improvements: [] },
                security: { score: 70, strengths: [], improvements: [] }
            };

            return {
                metrics: { 
                    readability: 70, 
                    complexity: 70, 
                    performance: 70,
                    security: 70
                },
                explanations: defaultExplanations,
                suggestions: [{
                    line: 1,
                    message: 'Could not parse analysis results',
                    severity: 'warning'
                }]
            };
        }
    } catch (error) {
        console.error('GROQ API Error:', error);
        const defaultExplanations = {
            readability: { score: 70, strengths: [], improvements: [] },
            complexity: { score: 70, strengths: [], improvements: [] },
            performance: { score: 70, strengths: [], improvements: [] },
            security: { score: 70, strengths: [], improvements: [] }
        };

        return {
            metrics: { 
                readability: 70, 
                complexity: 70, 
                performance: 70,
                security: 70
            },
            explanations: defaultExplanations,
            suggestions: [{
                line: 1,
                message: 'Failed to analyze code',
                severity: 'error'
            }]
        };
    }
}

export { analyzeCode, getCachedAnalysis };

/**
 * TODO: 
 * 1. Cache Management:
 *    - Улучшить механизм кеширования анализа
 *    - Добавить валидацию кешированных данных
 *    - Исправить проблему с устареванием кеша
 * 
 * 2. Analysis Updates:
 *    - Добавить инкрементальные обновления анализа
 *    - Улучшить обработку ошибок API
 *    - Добавить механизм отмены устаревших запросов
 * 
 * 3. Real-time Analysis:
 *    - Реализовать анализ изменений в реальном времени
 *    - Оптимизировать частоту запросов к API
 *    - Добавить очередь анализа для больших изменений
 */
