import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { MetricExplanation } from '@/types/codeAnalysis';  // Добавляем импорт типа

interface MetricBarProps {
    value: number;
    label: string;
    type?: string;
    explanation: MetricExplanation;
}

function getMetricColor(value: number, type: string): string {
    // Базовые цвета для каждого типа метрики
    const colors = {
        readability: {
            high: 'bg-emerald-500 dark:bg-emerald-600',
            medium: 'bg-emerald-400 dark:bg-emerald-500',
            low: 'bg-emerald-300 dark:bg-emerald-400'
        },
        complexity: {
            high: 'bg-blue-500 dark:bg-blue-600',
            medium: 'bg-blue-400 dark:bg-blue-500',
            low: 'bg-blue-300 dark:bg-blue-400'
        },
        performance: {
            high: 'bg-purple-500 dark:bg-purple-600',
            medium: 'bg-purple-400 dark:bg-purple-500',
            low: 'bg-purple-300 dark:bg-purple-400'
        },
        security: {
            high: 'bg-orange-500 dark:bg-orange-600',
            medium: 'bg-orange-400 dark:bg-orange-500',
            low: 'bg-orange-300 dark:bg-orange-400'
        }
    }

    const typeColors = colors[type as keyof typeof colors] || colors.readability;

    if (value >= 80) return typeColors.high;
    if (value >= 60) return typeColors.medium;
    return typeColors.low;
}

export default function MetricBar({ value, label, type = 'readability', explanation }: MetricBarProps) {
    const [showDetails, setShowDetails] = useState(false);
    const colorClass = getMetricColor(value, type);
    
    // Добавляем безопасную проверку
    const hasDetails = explanation && 
                      (explanation.strengths.length > 0 || explanation.improvements.length > 0);
    
    return (
        <div className="mb-4">
            <div 
                onClick={() => hasDetails && setShowDetails(!showDetails)}
                className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded p-2 transition-all ${
                    hasDetails ? 'group' : ''
                }`}
            >
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
                        {hasDetails && (
                            <ChevronDown 
                                size={16} 
                                className={`text-gray-400 transition-transform duration-200 ${
                                    showDetails ? 'rotate-180' : ''
                                } ${hasDetails ? 'opacity-100' : 'opacity-0'}`}
                            />
                        )}
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{value}%</span>
                </div>

                <div className="relative w-full">
                    <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                        <div 
                            className={`h-3 rounded-full transition-all duration-500 ease-out ${colorClass}`}
                            style={{ width: `${value}%` }}
                            role="progressbar"
                            aria-valuenow={value}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        />
                    </div>
                </div>
            </div>
            
            {showDetails && hasDetails && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                    {explanation.strengths.length > 0 && (
                        <div className="mb-2">
                            <h4 className="text-sm font-medium text-green-600 dark:text-green-400">Strengths:</h4>
                            <ul className="mt-1 space-y-1">
                                {explanation.strengths.map((strength: string, idx: number) => (
                                    <li key={idx} className="text-sm text-gray-600 dark:text-gray-300">• {strength}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {explanation.improvements.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-orange-600 dark:text-orange-400">Improvements:</h4>
                            <ul className="mt-1 space-y-1">
                                {explanation.improvements.map((improvement: string, idx: number) => (
                                    <li key={idx} className="text-sm text-gray-600 dark:text-gray-300">• {improvement}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
