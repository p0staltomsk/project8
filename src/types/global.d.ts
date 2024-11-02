declare global {
    var _handleAIFix: ((line: number, severity: string) => Promise<void>) | undefined;
}

export {};
