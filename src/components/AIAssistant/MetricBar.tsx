interface MetricBarProps {
    value: number;
    label: string;
}

function getMetricColor(value: number): string {
    if (value >= 80) return 'bg-green-500 dark:bg-green-600'
    if (value >= 60) return 'bg-blue-500 dark:bg-blue-600'
    if (value >= 40) return 'bg-orange-500 dark:bg-orange-600'
    return 'bg-red-500 dark:bg-red-600'
}

export default function MetricBar({ value, label }: MetricBarProps) {
    const colorClass = getMetricColor(value)
    
    return (
        <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">{label}:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                    className={`h-2.5 rounded-full transition-all duration-300 ${colorClass}`}
                    style={{ width: `${value}%` }}
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={100}
                ></div>
            </div>
        </div>
    )
}
