// Валидация данных
export function normalizeMetric(value: any): number {
    const num = Number(value)
    if (isNaN(num)) return 70
    return Math.min(Math.max(Math.round(num), 0), 100)
}

export function validateSeverity(severity: any): 'info' | 'warning' | 'error' {
    const validSeverities = ['info', 'warning', 'error'] as const
    return validSeverities.includes(severity) ? severity : 'info'
}
