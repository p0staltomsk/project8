import { BaseProps } from '@/types'
import { X } from 'lucide-react'
import MetricBar from './MetricBar'

interface AIAssistantProps extends BaseProps {
    isOpen: boolean
    toggleAssistant: () => void
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

export default function AIAssistant({ isOpen, toggleAssistant, metrics, suggestions }: AIAssistantProps) {
    return (
        <div className={`h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-all duration-300 ${
            isOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}>
            <div className="h-full p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">AI Assistant</h2>
                    <button onClick={toggleAssistant} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">Code Quality Metrics</h3>
                    <MetricBar value={metrics.readability} label="Readability" />
                    <MetricBar value={metrics.complexity} label="Complexity" />
                    <MetricBar value={metrics.performance} label="Performance" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">Suggestions</h3>
                    <ul className="space-y-3">
                        {suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                                <span className="font-semibold text-blue-400 dark:text-blue-300">Line {suggestion.line}:</span>{' '}
                                <span className="text-gray-700 dark:text-gray-300">{suggestion.message}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
