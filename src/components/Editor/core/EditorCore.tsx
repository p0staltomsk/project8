// Основной компонент редактора с Monaco
import { Monaco, OnMount } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useMonacoSetup } from './hooks/useMonacoSetup';
import { useEditorState } from './hooks/useEditorState';
import { useEditorActions } from './hooks/useEditorActions';

interface EditorCoreProps {
    currentFile: { id: string; name: string; content: string } | null;
    isDarkMode: boolean;
    onSave?: (code: string) => void;
    onChange?: (code: string) => void;
}

export function EditorCore({ currentFile, isDarkMode, onSave, onChange }: EditorCoreProps) {
    const { editorRef, monacoRef, handleEditorDidMount } = useMonacoSetup();
    const { code, setCode } = useEditorState(currentFile);
    const { handleSave } = useEditorActions({ currentFile, code, onSave });

    // ... остальной код
}
