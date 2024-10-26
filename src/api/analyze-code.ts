import { fileSystem } from '@/services/fileSystem'

/**
 * @deprecated This file needs refactoring:
 * - Remove Next.js dependencies
 * - Move API logic to services
 * - Use Vite-compatible approach
 * 
 * Current implementation is kept for reference only.
 * See src/services/codeAnalysis.ts for the active implementation.
 */

export interface CodeAnalysis {
  metrics: {
    readability: number
    complexity: number
    performance: number
  }
  suggestions: Array<{
    line: number
    message: string
  }>
}

export async function analyzeCode(code: string): Promise<CodeAnalysis> {
  // В реальном приложении здесь был бы вызов AI сервиса
  return {
    metrics: {
      readability: Math.floor(Math.random() * 30) + 70,
      complexity: Math.floor(Math.random() * 40) + 40,
      performance: Math.floor(Math.random() * 20) + 80,
    },
    suggestions: [
      { line: 1, message: 'Consider adding a return type for better type safety.' },
      { line: 2, message: 'Use template literals for string interpolation.' },
      { line: 3, message: 'Add a comment explaining the significance of 42.' },
    ],
  }
}

// Заглушка для будущей интеграции с Grog API
export async function handleAnalyzeCode(code: string): Promise<CodeAnalysis> {
  try {
    // TODO: В будущем здесь будет интеграция с Grog API
    const lines = code.split('\n').length
    const hasTypes = code.includes(': ') || code.includes('interface ')
    const hasComments = code.includes('//')

    return {
      metrics: {
        readability: hasComments ? 85 : 60,
        complexity: lines > 50 ? 40 : 90,
        performance: Math.floor(Math.random() * 20) + 80
      },
      suggestions: [
        { line: 1, message: hasTypes ? 'Good use of types!' : 'Consider adding type annotations.' },
        { line: Math.min(lines, 2), message: hasComments ? 'Good documentation!' : 'Add comments to explain the logic.' }
      ]
    }
  } catch (error) {
    console.error('Analysis failed:', error)
    throw error
  }
}
