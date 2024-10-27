export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const GROQ_CONFIG = {
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'mixtral-8x7b-32768',
    temperature: 0.1,
    maxTokens: 4000,
} as const;

// Системный промт для анализа кода
export const CODE_ANALYSIS_SYSTEM_PROMPT = `You are a professional code analyzer...`; // Ваш промпт

// Промт для проверки безопасности кода
export const SECURITY_ANALYSIS_PROMPT = `You are a security expert analyzing code for potential vulnerabilities. Focus on:
1. Security issues
2. Data validation
3. Authentication/Authorization problems
4. Input sanitization
5. Dependency vulnerabilities
Return findings in the same JSON format.`

// Промт для оптимизации производительности
export const PERFORMANCE_ANALYSIS_PROMPT = `You are a performance optimization expert. Analyze code for:
1. Algorithmic efficiency
2. Memory usage
3. Network optimizations
4. Resource management
5. Bottlenecks
Return findings in the same JSON format.`

export const getHeaders = () => ({
    'Authorization': `Bearer ${GROQ_API_KEY}`,
    'Content-Type': 'application/json',
})

/**
 * TODO: 
 * 1. API Optimization:
 *    - Оптимизировать промпты для быстрого анализа
 *    - Добавить механизм отмены устаревших запросов
 *    - Улучшить обработку частых запросов
 * 
 * 2. Error Handling:
 *    - Добавить retry механизм для failed запросов
 *    - Добавить fallback значения для метрик
 */
