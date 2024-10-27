import React, { useEffect, useRef, useState } from 'react'
import { BaseProps } from '@/types'
import Editor, { Monaco, OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { analyzeCode, getCachedAnalysis } from '../../services/codeAnalysis'
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
    suggestions: []
  })
  const lastAnalyzedFileId = useRef<string | null>(null)

  // Добм новое состояние для кеширования TypeScript маркеров
  const [typescriptMarkers, setTypescriptMarkers] = useState<CodeSuggestion[]>([]);

  // Загружаем анализ ТОЛЬКО при первом открытии файла
  useEffect(() => {
    if (currentFile?.id && currentFile.id !== lastAnalyzedFileId.current) {
      const cachedAnalysis = getCachedAnalysis(currentFile.id, currentFile.content);
      if (cachedAnalysis) {
        setAnalysis(cachedAnalysis);
        lastAnalyzedFileId.current = currentFile.id;
      }
    }
  }, [currentFile?.id]); // Зависимость только от ID файла

  // Обновляем эффект для смены файла
  useEffect(() => {
    if (currentFile) {
        setCode(currentFile.content);
        setTypescriptMarkers([]);
        
        // Показываем состояние загрузки вместо дефолтных значений
        setAnalysis(prev => ({
            ...prev,
            isLoading: true
        }));

        // Пытаемся загрузить кэшированный анализ
        const cachedAnalysis = getCachedAnalysis(currentFile.id, currentFile.content);
        if (cachedAnalysis) {
            setAnalysis(cachedAnalysis);
        }
    }
  }, [currentFile?.id]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

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

    // Настраиваем обработчик маркеров
    monaco.editor.onDidChangeMarkers((uris) => {
        const model = editor.getModel();
        if (!model) return;

        if (!uris.some(uri => uri.toString() === model.uri.toString())) return;

        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        const newMarkerSuggestions = markers
            .filter(isRelevantMarker)
            .map(markerToSuggestion);
        
        setTypescriptMarkers(newMarkerSuggestions);

        const aiSuggestions = analysis.suggestions.filter(s => 
            !s.message.includes('[TypeScript]') &&
            !s.message.includes('[Type Error]') &&
            !s.message.includes('[Type Mismatch]') &&
            !s.message.includes('[Missing Module]') &&
            !s.message.includes('[Syntax Error]') &&
            !s.message.includes('[Declaration Error]')
        );

        const combinedSuggestions = [
            ...newMarkerSuggestions,
            ...aiSuggestions
        ].sort((a, b) => {
            if (a.line !== b.line) return a.line - b.line;
            const severityOrder = { error: 0, warning: 1, info: 2 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        });

        setAnalysis(prev => ({
            ...prev,
            suggestions: combinedSuggestions
        }));
        
        onAnalysisChange?.({
            ...analysis,
            suggestions: combinedSuggestions
        });
    });
  };

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

  // Обработка сохранения и получения новой оценки
  const handleSave = async (code: string) => {
    if (!currentFile) return;

    try {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = 'Analyzing code...';
        document.body.appendChild(notification);

        try {
            const newAnalysis = await analyzeCode(code, currentFile.id);
            
            // В случае успешного анализа используем полученные данные
            const combinedSuggestions = [
                ...typescriptMarkers,
                ...newAnalysis.suggestions.filter(suggestion => 
                    !typescriptMarkers.some(marker => 
                        marker.line === suggestion.line && 
                        suggestion.message.includes(marker.message.replace(/\[.*?\]\s/, ''))
                    )
                )
            ].sort((a, b) => a.line - b.line);

            const updatedAnalysis = {
                metrics: newAnalysis.metrics,
                explanations: newAnalysis.explanations,
                suggestions: combinedSuggestions,
                isLoading: false
            };

            setAnalysis(updatedAnalysis);
            onAnalysisChange?.(updatedAnalysis);
            onSave?.(code);

            notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
            notification.textContent = 'File saved and analyzed!';
            setTimeout(() => notification.remove(), 2000);

        } catch (analysisError) {
            console.error('Analysis failed:', analysisError);
            
            // В случае ошибки анализа показываем только TypeScript маркеры
            // и индикатор ошибки вместо дефолтных значений
            const fallbackAnalysis = {
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
                suggestions: typescriptMarkers,
                error: true
            };

            setAnalysis(fallbackAnalysis);
            onAnalysisChange?.(fallbackAnalysis);
            onSave?.(code);

            notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
            notification.textContent = 'Analysis failed. Showing TypeScript issues only.';
            setTimeout(() => notification.remove(), 3000);
        }

    } catch (error) {
        console.error('Save error:', error);
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = 'Error saving file';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }
  };

  // Обрботка Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 's' || e.key === 'ы')) {
        e.preventDefault();
        if (currentFile) {
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
