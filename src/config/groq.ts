const FALLBACK_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const GROQ_CONFIG = {
    apiUrl: import.meta.env.VITE_GROQ_API_URL || FALLBACK_API_URL,
    model: 'mixtral-8x7b-32768',
    temperature: 0.1,
    maxTokens: 4000,
    timeout: 10000,
} as const;

// Обновляем системный промпт для более логичной оценки
export const CODE_ANALYSIS_SYSTEM_PROMPT = `You are a code analyzer. Return ONLY a JSON object with the following structure and rules:

1. Metrics should be calculated based on these principles:
   - readability: clarity, naming, formatting (0-100)
   - complexity: cyclomatic complexity, nesting levels, function size (0-100, higher is better/simpler)
   - performance: algorithmic efficiency, memory usage (0-100)
   - security: input validation, error handling (0-100)

2. If code is simple and well-written:
   - All metrics should be high (90-100)
   - Include positive explanations in strengths
   - Empty improvements array is OK
   - No suggestions needed

Return this structure:
{
  "metrics": {
    "readability": number (0-100),
    "complexity": number (0-100),
    "performance": number (0-100),
    "security": number (0-100)
  },
  "explanations": {
    "readability": { "score": number, "strengths": string[], "improvements": string[] },
    "complexity": { "score": number, "strengths": string[], "improvements": string[] },
    "performance": { "score": number, "strengths": string[], "improvements": string[] },
    "security": { "score": number, "strengths": string[], "improvements": string[] }
  },
  "suggestions": [
    { "line": number, "message": string, "severity": "error" | "warning" | "info" }
  ]
}

Important: Return ONLY the JSON object, no additional text or formatting.`;

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
