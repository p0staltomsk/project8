import { useRef } from 'react';
import { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { setupMonacoTheme } from '../utils/monacoTheme';

export function useMonacoSetup() {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);

    const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        setupMonacoTheme(monaco);
        // ... остальная настройка
    };

    return { editorRef, monacoRef, handleEditorDidMount };
}
