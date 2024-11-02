export interface EditorSettings {
    theme: 'light' | 'dark' | 'custom';
    fontSize: number;
    tabSize: number;
    wordWrap: 'on' | 'off';
    minimap: boolean;
    lineNumbers: boolean;
    formatOnSave: boolean;
}

export interface AnalysisSettings {
    autoAnalyze: boolean;
    cacheTimeout: number;
    severityLevels: {
        error: boolean;
        warning: boolean;
        info: boolean;
    };
    metrics: {
        readability: boolean;
        complexity: boolean;
        performance: boolean;
    };
}

export interface AppSettings {
    editor: EditorSettings;
    analysis: AnalysisSettings;
    appearance: {
        sidebarPosition: 'left' | 'right';
        sidebarWidth: number;
        theme: 'system' | 'light' | 'dark';
    };
}
