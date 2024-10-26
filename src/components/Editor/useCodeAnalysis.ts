import { useEffect, useRef } from 'react';
import type { editor } from 'monaco-editor';
import type { CodeAnalysisResult, CodeSuggestion } from '../../types/codeAnalysis';

interface UseCodeAnalysisProps {
    editor: editor.IStandaloneCodeEditor | null;
    analysis: CodeAnalysisResult | null;
    onFixRequest?: (suggestion: CodeSuggestion, lineContent: string) => Promise<void>;
}

export function useCodeAnalysis({ editor, analysis, onFixRequest }: UseCodeAnalysisProps) {
    const decorationsRef = useRef<string[]>([]);

    useEffect(() => {
        if (!editor || !analysis) return;

        // Удаляем предыдущие декорации
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);

        // Создаем новые декорации на основе suggestions
        const decorations = analysis.suggestions.map(suggestion => {
            const lineContent = editor.getModel()?.getLineContent(suggestion.line) || '';
            
            return {
                range: new monaco.Range(
                    suggestion.line,
                    1,
                    suggestion.line,
                    1
                ),
                options: {
                    isWholeLine: true,
                    className: `code-suggestion-${suggestion.severity}`,
                    glyphMarginClassName: `code-suggestion-glyph-${suggestion.severity}`,
                    overviewRuler: {
                        color: getSeverityColor(suggestion.severity),
                        position: 4
                    },
                    minimap: {
                        color: getSeverityColor(suggestion.severity),
                        position: 2
                    },
                    beforeContentClassName: 'relative',
                    after: {
                        content: `<div class="ai-fix-button" onclick="window._handleAIFix(${suggestion.line}, '${suggestion.severity}')">
                            <svg class="ai-fix-button-icon" viewBox="0 0 24 24">
                                <path d="M19.5 5.5v13h-15v-13h15zm0-2h-15c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2v-13c0-1.1-.9-2-2-2zm-2.5 4h-10v2h10v-2zm0 4h-10v2h10v-2z"/>
                            </svg>
                            Fix with AI
                        </div>`,
                        marginLeft: 0
                    }
                }
            };
        });

        // Применяем новые декорации
        decorationsRef.current = editor.deltaDecorations([], decorations);

        // Добавляем глобальный обработчик для кнопки
        window._handleAIFix = async (line: number, severity: string) => {
            const suggestion = analysis.suggestions.find(
                s => s.line === line && s.severity === severity
            );
            if (suggestion && onFixRequest) {
                const lineContent = editor.getModel()?.getLineContent(line) || '';
                await onFixRequest(suggestion, lineContent);
            }
        };

        return () => {
            delete window._handleAIFix;
        };

    }, [editor, analysis, onFixRequest]);
}

function getSeverityColor(severity: CodeSuggestion['severity']): string {
    switch (severity) {
        case 'error': return '#ff0000';
        case 'warning': return '#ffa500';
        case 'info': return '#0000ff';
    }
}
