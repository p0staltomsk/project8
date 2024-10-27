import { editor } from 'monaco-editor';
import { CodeSuggestion } from '@/types/codeAnalysis';
import * as monaco from 'monaco-editor';

export function isRelevantMarker(marker: editor.IMarker): boolean {
    return marker.severity === monaco.MarkerSeverity.Error || 
           marker.severity === monaco.MarkerSeverity.Warning ||
           marker.severity === monaco.MarkerSeverity.Info;
}

export function markerToSuggestion(marker: editor.IMarker): CodeSuggestion {
    let cleanMessage = marker.message
        .replace(/\(ts\(\d+\)\)/, '')
        .trim();

    const prefix = getMarkerTypePrefix(String(marker.code));
    
    return {
        line: marker.startLineNumber,
        message: `${prefix} ${cleanMessage}`,
        severity: markerSeverityToSuggestionSeverity(marker.severity)
    };
}

function getMarkerTypePrefix(code: string): string {
    const prefixes: Record<string, string> = {
        '7027': '[Unreachable Code]',
        '2365': '[Type Mismatch]',
        '2322': '[Type Error]',
        '2339': '[Missing Property]',
        '2304': '[Missing Module]',
        '1005': '[Missing Declaration]',
        '2691': '[Import Error]',
        '1128': '[Declaration Error]',
        '2551': '[Syntax Error]'
    };
    
    return code ? (prefixes[code] || '[TypeScript]') : '[TypeScript]';
}

function markerSeverityToSuggestionSeverity(severity: number): 'error' | 'warning' | 'info' {
    switch (severity) {
        case monaco.MarkerSeverity.Error:
            return 'error';
        case monaco.MarkerSeverity.Warning:
            return 'warning';
        default:
            return 'info';
    }
}
