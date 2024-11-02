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
        readability: 0, // Было 75
        complexity: 0,  // Было 70
        performance: 0, // Было 80
        security: 0     // Было 75
    },
    explanations: {
        readability: { score: 0, strengths: [], improvements: [] },
        complexity: { score: 0, strengths: [], improvements: [] },
        performance: { score: 0, strengths: [], improvements: [] },
        security: { score: 0, strengths: [], improvements: [] }
    },
    suggestions: [],
    isInitialState: true // Добавляем флаг начального состояния
};

/**
 * TODO: 
 * 1. Real-time Analysis:
 *    - Реализовать анализ изменений в реальном времени
 *    - Оптимизировать частоту запросов к API
 *    - Добавить очередь анализа для больших изменений
 */
export async function analyzeCode(code: string, fileId: string = 'default'): Promise<CodeAnalysisResult> {
    console.log('🔄 Starting analysis with content length:', code.length);
    
    // Проверяем кеш
    const cachedAnalysis = getCachedAnalysis(fileId, code);
    if (cachedAnalysis) {
        console.log('✅ Using cached analysis');
        return cachedAnalysis;
    }

    if (!GROQ_API_KEY) {
        console.warn('⚠️ GROQ API key is missing');
        return DEFAULT_ANALYSIS;
    }

    try {
        console.log('📡 Sending request to GROQ API...');
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
        console.log('📥 Raw API response:', content);
        
        if (!content) {
            console.warn('⚠️ Empty response from GROQ API');
            return DEFAULT_ANALYSIS;
        }

        try {
            // Пробуем напрямую парсить контент как JSON
            const analysisData = JSON.parse(content);
            console.log('📊 Parsed data:', analysisData);
            
            const validatedAnalysis = validateAnalysisData(analysisData);
            if (validatedAnalysis !== DEFAULT_ANALYSIS) {
                console.log('✅ Valid analysis:', validatedAnalysis);
                cacheAnalysis(fileId, code, validatedAnalysis);
                return validatedAnalysis;
            }
        } catch (parseError) {
            console.error('❌ Parse error:', parseError);
            console.log('📄 Content that failed to parse:', content);
            return DEFAULT_ANALYSIS;
        }

        return DEFAULT_ANALYSIS;
    } catch (error) {
        console.error('❌ API error:', error);
        return DEFAULT_ANALYSIS;
    }
}

function validateAnalysisData(data: any): CodeAnalysisResult {
    console.log('🔍 Validating analysis data:', data);

    // Проверяем наличие метрик
    if (!data?.metrics || typeof data.metrics !== 'object') {
        console.warn('⚠️ Invalid metrics data');
        return DEFAULT_ANALYSIS;
    }

    // Нормализуем метрики
    const metrics = {
        readability: normalizeMetric(data.metrics.readability),
        complexity: normalizeMetric(data.metrics.complexity),
        performance: normalizeMetric(data.metrics.performance),
        security: normalizeMetric(data.metrics.security)
    };

    console.log('📊 Normalized metrics:', metrics);

    // Проверяем валидность метрик
    if (Object.values(metrics).some(m => m === 0)) {
        console.warn('⚠️ Some metrics are invalid:', metrics);
        return DEFAULT_ANALYSIS;
    }

    // Проверяем и нормализуем объяснения
    const explanations = {
        readability: validateExplanation(data?.explanations?.readability, metrics.readability),
        complexity: validateExplanation(data?.explanations?.complexity, metrics.complexity),
        performance: validateExplanation(data?.explanations?.performance, metrics.performance),
        security: validateExplanation(data?.explanations?.security, metrics.security)
    };

    const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : [];

    const result = { 
        metrics, 
        explanations, 
        suggestions,
        isInitialState: false
    };

    console.log('✅ Validation complete:', result);
    return result;
}

function validateExplanation(exp: any, score: number) {
    if (!exp || typeof exp !== 'object') {
        // Создаем базовое объяснение для высоких оценок
        if (score >= 85) {
            return {
                score,
                strengths: ['Code follows best practices'],
                improvements: []
            };
        }
        // Для низких оценок
        return {
            score,
            strengths: [],
            improvements: ['Needs improvement']
        };
    }

    return {
        score: exp.score || score,
        strengths: Array.isArray(exp.strengths) ? exp.strengths : [],
        improvements: Array.isArray(exp.improvements) ? exp.improvements : []
    };
}

function normalizeMetric(value: any): number {
    const num = Number(value);
    return !isNaN(num) && num > 0 && num <= 100 ? num : 0;
}
