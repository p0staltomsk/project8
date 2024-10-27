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
        
        // Проверяем наличие всех необходимых метрик
        if (!parsedCache.analysis?.metrics?.security || 
            !parsedCache.analysis?.metrics?.readability ||
            !parsedCache.analysis?.metrics?.complexity ||
            !parsedCache.analysis?.metrics?.performance) {
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
