import { useEffect, useRef } from 'react';
import type { editor } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import type { CodeAnalysisResult, CodeSuggestion } from '@/types/codeAnalysis';

interface UseCodeAnalysisProps {
    editor: editor.IStandaloneCodeEditor | null;
    analysis: CodeAnalysisResult | null;
    onFixRequest?: (suggestion: CodeSuggestion, lineContent: string) => Promise<void>;
}

// Определяем тип для глобального объекта window
declare global {
    var _handleAIFix: ((line: number, severity: string) => Promise<void>) | undefined;
}

export function useCodeAnalysis({ editor, analysis, onFixRequest }: UseCodeAnalysisProps) {
    const decorationsRef = useRef<string[]>([]);

    useEffect(() => {
        if (!editor || !analysis) return;

        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);

        const decorations = analysis.suggestions.map(suggestion => ({
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
                }
            }
        }));

        decorationsRef.current = editor.deltaDecorations([], decorations);

        globalThis._handleAIFix = async (line: number, severity: string) => {
            const suggestion = analysis.suggestions.find(
                s => s.line === line && s.severity === severity
            );
            if (suggestion && onFixRequest) {
                const lineContent = editor.getModel()?.getLineContent(line) || '';
                await onFixRequest(suggestion, lineContent);
            }
        };

        return () => {
            globalThis._handleAIFix = undefined;
        };
    }, [editor, analysis, onFixRequest]);
}

function getSeverityColor(severity: CodeSuggestion['severity']): string {
    const colors = {
        error: '#ff0000',
        warning: '#ffa500',
        info: '#0000ff'
    };
    return colors[severity];
}
