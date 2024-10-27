// API взаимодействие
import axios from 'axios';
import { GROQ_CONFIG, getHeaders } from '../../config/groq';
import { CodeAnalysisResult } from './types';
import { normalizeMetric, validateSeverity } from './validation';
import { cacheAnalysis, getCachedAnalysis } from './cache';

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

    if (!GROQ_CONFIG.apiUrl || !GROQ_CONFIG.model) {
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
            { headers: getHeaders() }
        );

        const content = response.data.choices[0]?.message?.content;
        if (!content) {
            throw new Error('Empty response from GROQ API');
        }

        const analysisData = JSON.parse(content);
        const validatedAnalysis = validateAnalysisData(analysisData);
        
        cacheAnalysis(fileId, code, validatedAnalysis);
        return validatedAnalysis;

    } catch (error) {
        console.error('GROQ API Error:', error);
        throw error;
    }
}
