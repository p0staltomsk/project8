declare global {
    interface Window {
        _handleAIFix: (line: number, severity: string) => Promise<void>;
    }
}

export {};
