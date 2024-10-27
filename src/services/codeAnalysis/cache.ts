// Логика кеширования
import { AnalysisCache, CodeAnalysisResult } from './types';

const CACHE_KEY_PREFIX = 'code_analysis_';

export function cacheAnalysis(fileId: string, code: string, analysis: CodeAnalysisResult): void {
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

export function getCachedAnalysis(fileId: string, code: string): CodeAnalysisResult | null {
    try {
        const cacheKey = `${CACHE_KEY_PREFIX}${fileId}`;
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;

        const parsedCache: AnalysisCache = JSON.parse(cached);
        
        // Проверяем наличие всех необходимых данных
        if (!isValidAnalysis(parsedCache.analysis)) {
            return null;
        }
        
        // Проверяем актуальность кода
        if (parsedCache.content !== code) {
            return null;
        }

        // Проверяем возраст кеша (24 часа)
        if (Date.now() - parsedCache.timestamp > 24 * 60 * 60 * 1000) {
            return null;
        }

        return parsedCache.analysis;
    } catch {
        return null;
    }
}

function isValidAnalysis(analysis: CodeAnalysisResult): boolean {
    // Проверяем наличие всех метрик
    const hasMetrics = analysis?.metrics &&
        typeof analysis.metrics.readability === 'number' &&
        typeof analysis.metrics.complexity === 'number' &&
        typeof analysis.metrics.performance === 'number' &&
        typeof analysis.metrics.security === 'number';

    // Проверяем наличие объяснений и их непустоту
    const hasExplanations = analysis?.explanations &&
        Array.isArray(analysis.explanations.readability?.strengths) &&
        Array.isArray(analysis.explanations.complexity?.strengths) &&
        Array.isArray(analysis.explanations.performance?.strengths) &&
        Array.isArray(analysis.explanations.security?.strengths) &&
        // Проверяем, что хотя бы один массив strengths не пустой
        (analysis.explanations.readability?.strengths.length > 0 ||
         analysis.explanations.complexity?.strengths.length > 0 ||
         analysis.explanations.performance?.strengths.length > 0 ||
         analysis.explanations.security?.strengths.length > 0);

    return Boolean(hasMetrics && hasExplanations);
}
