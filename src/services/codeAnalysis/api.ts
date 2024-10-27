// API взаимодействие
import axios from 'axios';
import { GROQ_API_KEY, GROQ_CONFIG, CODE_ANALYSIS_SYSTEM_PROMPT } from '@/config/groq';
import type { CodeAnalysisResult } from '@/types/codeAnalysis';
import { cacheAnalysis, getCachedAnalysis } from './cache';

// Добавляем функцию getHeaders
function getHeaders() {
    return {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
    };
}

// Добавляем fallback значения для метрик
const DEFAULT_ANALYSIS: CodeAnalysisResult = {
    metrics: {
        readability: 75,
        complexity: 70,
        performance: 80,
        security: 75
    },
    explanations: {
        readability: { score: 75, strengths: [], improvements: [] },
        complexity: { score: 70, strengths: [], improvements: [] },
        performance: { score: 80, strengths: [], improvements: [] },
        security: { score: 75, strengths: [], improvements: [] }
    },
    suggestions: []
};

/**
 * TODO: 
 * 1. Real-time Analysis:
 *    - Реализовать анализ изменений в реальном времени
 *    - Оптимизировать частоту запросов к API
 *    - Добавить очередь анализа для больших изменений
 */
export async function analyzeCode(code: string, fileId: string = 'default'): Promise<CodeAnalysisResult> {
    // Проверяем кеш
    const cachedAnalysis = getCachedAnalysis(fileId, code);
    if (cachedAnalysis) {
        return cachedAnalysis;
    }

    if (!GROQ_API_KEY) {
        console.warn('GROQ API key is missing, using fallback values');
        return DEFAULT_ANALYSIS;
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
                timeout: 10000
            }
        );

        const content = response.data.choices?.[0]?.message?.content;
        
        if (!content) {
            console.warn('Empty response from GROQ API, using fallback values');
            return DEFAULT_ANALYSIS;
        }

        try {
            // Извлекаем JSON из markdown ответа
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
            if (!jsonMatch) {
                console.warn('No JSON found in response, using raw content');
                // Пробуем распарсить весь контент
                const analysisData = JSON.parse(content);
                const validatedAnalysis = validateAnalysisData(analysisData);
                cacheAnalysis(fileId, code, validatedAnalysis);
                return validatedAnalysis;
            }

            const jsonContent = jsonMatch[1];
            const analysisData = JSON.parse(jsonContent);
            const validatedAnalysis = validateAnalysisData(analysisData);
            cacheAnalysis(fileId, code, validatedAnalysis);
            return validatedAnalysis;
        } catch (parseError) {
            console.error('Failed to parse GROQ API response:', parseError);
            console.log('Raw content:', content); // Для отладки
            return DEFAULT_ANALYSIS;
        }

    } catch (error) {
        console.error('GROQ API Error:', error);
        return DEFAULT_ANALYSIS;
    }
}

function validateAnalysisData(data: any): CodeAnalysisResult {
    // Улучшенная валидация с fallback значениями
    const metrics = {
        readability: Number(data?.metrics?.readability) || DEFAULT_ANALYSIS.metrics.readability,
        complexity: Number(data?.metrics?.complexity) || DEFAULT_ANALYSIS.metrics.complexity,
        performance: Number(data?.metrics?.performance) || DEFAULT_ANALYSIS.metrics.performance,
        security: Number(data?.metrics?.security) || DEFAULT_ANALYSIS.metrics.security
    };

    const explanations = {
        readability: data?.explanations?.readability || DEFAULT_ANALYSIS.explanations.readability,
        complexity: data?.explanations?.complexity || DEFAULT_ANALYSIS.explanations.complexity,
        performance: data?.explanations?.performance || DEFAULT_ANALYSIS.explanations.performance,
        security: data?.explanations?.security || DEFAULT_ANALYSIS.explanations.security
    };

    const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : [];

    return {
        metrics,
        explanations,
        suggestions
    };
}
