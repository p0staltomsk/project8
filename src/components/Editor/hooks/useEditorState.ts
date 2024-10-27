import { useState, useEffect } from 'react';

interface EditorState {
    code: string;
    isModified: boolean;
}

export function useEditorState(currentFile: { content: string } | null) {
    const [state, setState] = useState<EditorState>({
        code: currentFile?.content || '',
        isModified: false
    });

    useEffect(() => {
        if (currentFile) {
            setState({
                code: currentFile.content,
                isModified: false
            });
        }
    }, [currentFile]);

    return {
        code: state.code,
        isModified: state.isModified,
        setCode: (newCode: string) => setState(prev => ({
            code: newCode,
            isModified: newCode !== currentFile?.content
        }))
    };
}
