import { useCallback } from 'react';

interface EditorActionsProps {
    currentFile: { id: string; content: string } | null;
    code: string;
    onSave?: (code: string) => void;
}

export function useEditorActions({ currentFile, code, onSave }: EditorActionsProps) {
    const handleSave = useCallback(async () => {
        if (!currentFile || !onSave) return;
        await onSave(code);
    }, [currentFile, code, onSave]);

    return { handleSave };
}
