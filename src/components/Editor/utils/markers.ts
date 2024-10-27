import { editor } from 'monaco-editor';
import { CodeSuggestion } from '@/types/codeAnalysis';

export function isRelevantMarker(marker: editor.IMarker): boolean {
    // ... логика проверки маркера
}

export function markerToSuggestion(marker: editor.IMarker): CodeSuggestion {
    // ... конвертация маркера в suggestion
}
