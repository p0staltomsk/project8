interface CodeAnalysisResult {
    metrics: {
        readability: number;
        complexity: number;
        performance: number;
    };
    suggestions: Array<{
        line: number;
        message: string;
    }>;
}

export async function analyzeCode(code: string): Promise<CodeAnalysisResult> {
    // TODO: В будущем здесь будет интеграция с Grog API
    return getMockAnalysis(code);
}

function getMockAnalysis(code: string): CodeAnalysisResult {
    // Анализируем код локально для демо
    const lines = code.split('\n').length;
    const hasTypes = code.includes(': ') || code.includes('interface ') || code.includes('type ');
    const hasComments = code.includes('//') || code.includes('/*');
    const hasTryCatch = code.includes('try') && code.includes('catch');
    const hasAsync = code.includes('async') || code.includes('await');
    const hasTests = code.includes('test(') || code.includes('describe(');
    const hasConsole = code.includes('console.log');

    // Вычисляем метрики на основе анализа
    const readability = calculateReadability(hasComments, hasTypes, lines);
    const complexity = calculateComplexity(lines, hasTryCatch, hasAsync);
    const performance = calculatePerformance(hasTryCatch, hasConsole);

    return {
        metrics: {
            readability,
            complexity,
            performance
        },
        suggestions: generateSuggestions(code, {
            hasTypes,
            hasComments,
            hasTryCatch,
            hasTests,
            hasConsole
        })
    };
}

function calculateReadability(hasComments: boolean, hasTypes: boolean, lines: number): number {
    let score = 70;
    if (hasComments) score += 15;
    if (hasTypes) score += 10;
    if (lines > 100) score -= 10;
    return Math.min(Math.max(score, 0), 100);
}

function calculateComplexity(lines: number, hasTryCatch: boolean, hasAsync: boolean): number {
    let score = 80;
    if (lines > 50) score -= 10;
    if (hasTryCatch) score -= 5;
    if (hasAsync) score -= 5;
    return Math.min(Math.max(score, 0), 100);
}

function calculatePerformance(hasTryCatch: boolean, hasConsole: boolean): number {
    let score = 90;
    if (hasConsole) score -= 10;
    if (hasTryCatch) score -= 5;
    return Math.min(Math.max(score, 0), 100);
}

function generateSuggestions(code: string, flags: {
    hasTypes: boolean;
    hasComments: boolean;
    hasTryCatch: boolean;
    hasTests: boolean;
    hasConsole: boolean;
}): Array<{ line: number; message: string }> {
    const suggestions = [];
    const lines = code.split('\n');

    if (!flags.hasTypes) {
        suggestions.push({
            line: 1,
            message: 'Consider adding TypeScript type annotations for better type safety'
        });
    }

    if (!flags.hasComments) {
        suggestions.push({
            line: 1,
            message: 'Add comments to explain complex logic and function purposes'
        });
    }

    if (!flags.hasTryCatch && code.includes('fetch')) {
        suggestions.push({
            line: lines.findIndex(l => l.includes('fetch')) + 1,
            message: 'Add error handling for the fetch request'
        });
    }

    if (flags.hasConsole) {
        suggestions.push({
            line: lines.findIndex(l => l.includes('console.log')) + 1,
            message: 'Remove console.log statements before production'
        });
    }

    if (!flags.hasTests && code.includes('function')) {
        suggestions.push({
            line: lines.findIndex(l => l.includes('function')) + 1,
            message: 'Consider adding unit tests for this function'
        });
    }

    return suggestions;
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
 *    - Удаление комментариев и форматирования
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
