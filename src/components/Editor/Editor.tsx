import React, { useEffect, useRef, useState } from 'react'
import { BaseProps } from '@/types'
import Editor, { Monaco, OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import type { CodeAnalysisResult, CodeSuggestion } from '@/types/codeAnalysis'
import * as monaco from 'monaco-editor'
import ReactDOM from 'react-dom/client'
import SubscriptionPopup from '../Popup/subscription'

/**
 * TODO: Critical Fixes
 * 1. TypeScript Issues Persistence:
 *    - Prevent markers cleanup during analysis
 *    - Implement proper state management
 *    - Merge with AI suggestions correctly
 * 
 * 2. Save Action Discoverability:
 *    - Add visible save button
 *    - Implement save indicator
 *    - Show analysis trigger hint
 * 
 * 3. Analysis State Management:
 *    - Improve state updates
 *    - Add proper loading states
 *    - Fix suggestions persistence
 */

interface EditorProps extends BaseProps {
  isDarkMode: boolean
  onSave?: (code: string) => void
  onChange?: (code: string) => void
  currentFile: { id: string; name: string; content: string } | null
  onAnalysisChange?: (analysis: CodeAnalysisResult) => void  // Добавляем новый проп
}

export default function CodeEditor({ isDarkMode, onSave, onChange, currentFile, onAnalysisChange }: EditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  
  const [code, setCode] = React.useState(currentFile?.content || "// Select a file to start editing")
  
  // Используем анализ в коде
  const [analysis, setAnalysis] = useState<CodeAnalysisResult>({
      metrics: {
          readability: 0,
          complexity: 0,
          performance: 0,
          security: 0
      },
      explanations: {
          readability: { score: 0, strengths: [], improvements: [] },
          complexity: { score: 0, strengths: [], improvements: [] },
          performance: { score: 0, strengths: [], improvements: [] },
          security: { score: 0, strengths: [], improvements: [] }
      },
      suggestions: [],
      isInitialState: true
  });

  // Используем маркеры в коде
  const [typescriptMarkers, setTypescriptMarkers] = useState<CodeSuggestion[]>([]);

  // Обновляем эффект для смены файла
  useEffect(() => {
      if (currentFile) {
          setCode(currentFile.content);
          setTypescriptMarkers([]); // Очищаем маркеры
      }
  }, [currentFile?.id]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Обрабатываем маркеры сразу и при изменениях
    monaco.editor.onDidChangeMarkers((uris) => {
        const model = editor.getModel();
        if (!model) return;

        if (!uris.some(uri => uri.toString() === model.uri.toString())) return;

        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        const newMarkerSuggestions = markers
            .filter(isRelevantMarker)
            .map(markerToSuggestion);
        
        setTypescriptMarkers(newMarkerSuggestions);

        // Обновляем только локальное состояние
        setAnalysis(prev => ({
            ...prev,
            suggestions: newMarkerSuggestions
        }));
        
        // Обновляем родительское состояние только с TypeScript ошибками,
        // сохраняя isInitialState
        onAnalysisChange?.({
            metrics: {
                readability: 0,
                complexity: 0,
                performance: 0,
                security: 0
            },
            explanations: {
                readability: { score: 0, strengths: [], improvements: [] },
                complexity: { score: 0, strengths: [], improvements: [] },
                performance: { score: 0, strengths: [], improvements: [] },
                security: { score: 0, strengths: [], improvements: [] }
            },
            suggestions: newMarkerSuggestions,
            isInitialState: true  // Важно! Сохраняем флаг
        });
    });

    // Добавляем действие AI auto-fix
    editor.addAction({
        id: 'ai-auto-fix',
        label: '🤖 AI auto-fix',
        contextMenuGroupId: 'ai',
        contextMenuOrder: 1.5,
        run: () => {
            const subscriptionPopup = document.createElement('div');
            subscriptionPopup.id = 'subscription-popup-container';
            document.body.appendChild(subscriptionPopup);
            
            const root = ReactDOM.createRoot(subscriptionPopup);
            root.render(
                <SubscriptionPopup 
                    isOpen={true}
                    onClose={() => {
                        root.unmount();
                        subscriptionPopup.remove();
                    }}
                    onSubscribe={(plan) => {
                        console.log(`Selected plan: ${plan}`);
                        root.unmount();
                        subscriptionPopup.remove();
                    }}
                />
            );
        }
    });
  };

  // Добавляем использование analysis и typescriptMarkers
  useEffect(() => {
    if (analysis.suggestions.length > 0) {
        console.debug('Current analysis suggestions:', analysis.suggestions);
    }
    if (typescriptMarkers.length > 0) {
        console.debug('Current TypeScript markers:', typescriptMarkers);
    }
  }, [analysis.suggestions, typescriptMarkers]);

  // Обновим функцию isRelevantMarker, чтобы захватывать все ошибки TypeScript
  const isRelevantMarker = (marker: editor.IMarker) => {
    // Захватываем все маркеры с severity Error или Warning
    return marker.severity === monaco.MarkerSeverity.Error || 
           marker.severity === monaco.MarkerSeverity.Warning ||
           marker.severity === monaco.MarkerSeverity.Info;
  };

  // Обновим функцию getMarkerTypePrefix для более точной категоизаи ошибок
  const getMarkerTypePrefix = (code: string | undefined): string => {
    const prefixes: Record<string, string> = {
        '7027': '[Unreachable Code]',
        '2365': '[Type Mismatch]',
        '2322': '[Type Error]',
        '2339': '[Missing Property]',
        '2304': '[Missing Module]',
        '1005': '[Missing Declaration]',
        '2691': '[Import Error]',
        '1128': '[Declaration Error]',
        '2551': '[Syntax Error]',
        // Добавляем все встреченные коды ошибок
    };
    
    // Определяем тип ошибки по коду или возвращаем общий префикс
    return code ? (prefixes[code] || '[TypeScript]') : '[TypeScript]';
  };

  // Обновим функцию markerToSuggestion для лучшей обработки сообщений
  const markerToSuggestion = (marker: editor.IMarker): CodeSuggestion => {
    // Очищаем сообщение от технических деталей
    let cleanMessage = marker.message
        .replace(/\(ts\(\d+\)\)/, '') // Удаляем код ошибки в скобках
        .trim();

    // Добавляем префикс в зависимости от типа ошибки
    const prefix = getMarkerTypePrefix(String(marker.code));
    
    return {
        line: marker.startLineNumber,
        message: `${prefix} ${cleanMessage}`,
        severity: markerSeverityToSuggestionSeverity(marker.severity)
    };
  };

  const markerSeverityToSuggestionSeverity = (severity: number): 'error' | 'warning' | 'info' => {
    switch (severity) {
        case monaco.MarkerSeverity.Error:
            return 'error';
        case monaco.MarkerSeverity.Warning:
            return 'warning';
        default:
            return 'info';
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
        setCode(value);
        onChange?.(value);
    }
  };

  // Обработка сохранения
  const handleSave = async (code: string) => {
    if (!currentFile || !editorRef.current) return;

    try {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = 'Analyzing code...';
        document.body.appendChild(notification);

        // Вызываем колбэк сохранения и ждем результат
        await onSave?.(code);

        notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = 'File saved and analyzed!';
        setTimeout(() => notification.remove(), 2000);

    } catch (error) {
        console.error('Save error:', error);
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = 'Error saving file';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }
  };

  // Обработка Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Проверяем все возможные варианты 'S' и 'ы'
        const isS = e.key.toLowerCase() === 's' || 
                   e.key.toLowerCase() === 'ы' || 
                   e.key === 'S' || 
                   e.key === 'Ы';
                   
        if ((e.ctrlKey || e.metaKey) && isS) {
            e.preventDefault();
            if (currentFile && code) {
                handleSave(code);
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, currentFile]);

  return (
    <div className="flex-1 overflow-hidden">
      {currentFile && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <span className="text-sm text-gray-600 dark:text-gray-300">{currentFile.name}</span>
        </div>
      )}
      <Editor
        height="calc(100% - 36px)"
        language={currentFile?.name.endsWith('.tsx') ? 'typescript' : 'javascript'}
        theme={isDarkMode ? 'vs-dark' : 'light'}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          tabSize: 2,
          automaticLayout: true,
          wordWrap: 'on',
          find: {
            addExtraSpaceOnTop: false,
            seedSearchStringFromSelection: 'selection',
            autoFindInSelection: 'never'
          }
        }}
      />
    </div>
  )
}
