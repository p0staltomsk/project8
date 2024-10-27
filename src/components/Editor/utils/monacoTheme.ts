import { editor } from 'monaco-editor';

export function setupMonacoTheme(monaco: any) {
    monaco.editor.defineTheme('customDarkTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
            'editor.background': '#1E1E2E',
            'editor.foreground': '#E4E4E7',
            'editor.lineHighlightBackground': '#2A2A3C',
            'editor.selectionBackground': '#2E3250',
            'editor.inactiveSelectionBackground': '#292937',
            'editorLineNumber.foreground': '#4A4A6A',
            'editorLineNumber.activeForeground': '#7A7AA0',
            'editorCursor.foreground': '#7A7AA0',
            'editorBracketMatch.background': '#363654',
            'editorBracketMatch.border': '#5A5A8A'
        }
    });
}
