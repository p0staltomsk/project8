const FALLBACK_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const GROQ_CONFIG = {
    apiUrl: import.meta.env.VITE_GROQ_API_URL || FALLBACK_API_URL,
    model: 'mixtral-8x7b-32768',
    temperature: 0.1,
    maxTokens: 4000,
    timeout: 10000,
} as const;

// Упрощаем системный промпт для более надежного ответа
export const CODE_ANALYSIS_SYSTEM_PROMPT = `You are a code analyzer. Return ONLY raw JSON without any markdown formatting or explanations. Example format:

{
  "metrics": {
    "readability": 85,
    "complexity": 60,
    "performance": 90,
    "security": 90
  },
  "explanations": {
    "readability": {
      "score": 85,
      "strengths": ["Clear naming", "Good formatting"],
      "improvements": []
    },
    "complexity": {
      "score": 60,
      "strengths": ["Simple logic"],
      "improvements": ["Consider adding error handling"]
    },
    "performance": {
      "score": 90,
      "strengths": ["Efficient code"],
      "improvements": []
    },
    "security": {
      "score": 90,
      "strengths": ["No vulnerabilities"],
      "improvements": []
    }
  },
  "suggestions": [
    {
      "line": 1,
      "message": "Add function documentation",
      "severity": "info"
    }
  ]
}`;

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
