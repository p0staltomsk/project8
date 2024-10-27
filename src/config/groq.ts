export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string

export const GROQ_CONFIG = {
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'mixtral-8x7b-32768',
    temperature: 0.1,
    maxTokens: 4000,
} as const

// Системный промт для анализа кода
export const CODE_ANALYSIS_SYSTEM_PROMPT = `You are a professional code analyzer with deep expertise in software development, security, and best practices. Your task is to analyze the provided code and return a structured JSON response with metrics, explanations, and suggestions.

Analysis Requirements:
1. Evaluate code quality across four dimensions:
   - Readability (documentation, naming, structure)
   - Complexity (cognitive load, nesting, logic branches)
   - Performance (algorithmic efficiency, memory usage, potential bottlenecks)
   - Security (vulnerabilities, data validation, authentication)

2. Score each metric from 0 to 100:
   - 90-100: Excellent
   - 70-89: Good
   - 50-69: Needs improvement
   - 0-49: Critical issues

3. Provide specific, actionable suggestions with:
   - Line numbers
   - Clear problem description
   - Concrete improvement recommendation
   - Severity level

Rules:
- Focus on significant issues that impact code quality
- Consider language-specific best practices (TypeScript/JavaScript)
- Evaluate based on modern development standards
- Provide practical, implementable suggestions

Return strictly the following JSON structure:
{
  "metrics": {
    "readability": number,
    "complexity": number,
    "performance": number,
    "security": number
  },
  "explanations": {
    "readability": {
      "score": number,
      "strengths": string[],
      "improvements": string[]
    },
    "complexity": {
      "score": number,
      "strengths": string[],
      "improvements": string[]
    },
    "performance": {
      "score": number,
      "strengths": string[],
      "improvements": string[]
    },
    "security": {
      "score": number,
      "strengths": string[],
      "improvements": string[]
    }
  },
  "suggestions": [
    {
      "line": number,
      "message": string,
      "severity": "info" | "warning" | "error"
    }
  ]
}
`

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
 *    - Добавить кеширование на уровне API
 *    - Улучшить обработку частых запросов
 * 
 * 2. Error Handling:
 *    - Добавить retry механизм для failed запросов
 *    - Улучшить обработку ошибок API
 *    - Добавить fallback значения для метрик
 */
