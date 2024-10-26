import React, { useEffect, useRef, useState } from 'react'
import { BaseProps } from '@/types'
import Editor, { Monaco, OnMount } from '@monaco-editor/react'
import { useCodeAnalysis } from './useCodeAnalysis'
import axios from 'axios'
import type { editor, IRange } from 'monaco-editor'
import { refactorCode } from '../../services/aiRefactor'
import { analyzeCode, getCachedAnalysis } from '../../services/codeAnalysis'
import type { CodeAnalysisResult, CodeSuggestion } from '@/types/codeAnalysis'
import * as monaco from 'monaco-editor'

/**
 * TODO: 
 * 1. Добавить автоформатирование кода при сохранении:
 *    - Использовать prettier для форматирования
 *    - Добавить настройки форматирования в конфиг проекта
 *    - Добавить кнопку для ручного форматирования (Alt+Shift+F)
 * 
 * 2. Улучшить обработку сохранения:
 *    - Добавить индикатор несохраненных изменений
 *    - Предупреждать при закрыт с несохраненными изменениями
 *    - Добавить автосохранение (опционально)
 * 
 * 3. Интегрироват с Grog API:
 *    - Реализовать отправку кода на анализ
 *    - Добавить системный промт для оценки качества
 *    - Обработать структурированный ответ от API
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
        readability: 70,
        complexity: 70,
        performance: 70
    },
    suggestions: []
  })
  const lastAnalyzedFileId = useRef<string | null>(null)

  // Доб��вим новое состояние для кеширования TypeScript маркеров
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
        // Сбрасываем TypeScript маркеры при смене файла
        setTypescriptMarkers([]);
        // Сбрасываем анализ
        setAnalysis({
            metrics: {
                readability: 70,
                complexity: 70,
                performance: 70
            },
            suggestions: []
        });
    }
  }, [currentFile?.id]); // Зависимость от ID файла

  const handleAIFix = async (suggestion: CodeSuggestion, lineContent: string) => {
    if (!editorRef.current) return;
    
    try {
      // Показываем индикатор загрузки
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50';
      notification.textContent = 'AI is analyzing the code...';
      document.body.appendChild(notification);

      // Запрашиваем исправление у API
      const response = await axios.post('/api/fix-code', {
        code: lineContent,
        suggestion: suggestion.message,
        severity: suggestion.severity
      });

      const fixedCode = response.data.fix;

      // Применяем исправление
      const editor = editorRef.current;
      const model = editor.getModel();
      if (model) {
        editor.executeEdits('ai-fix', [{
          range: new monaco.Range(
            suggestion.line,
            1,
            suggestion.line,
            model.getLineMaxColumn(suggestion.line)
          ),
          text: fixedCode
        }]);
      }

      // Обновляем уведомление
      notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      notification.textContent = 'Code fixed successfully!';
      setTimeout(() => notification.remove(), 2000);
    } catch (error) {
      console.error('AI Fix Error:', error);
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      notification.textContent = 'Failed to fix code with AI';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
    }
  };

  // Используем хук для подсветки кода с обработчиком исправлений
  useCodeAnalysis({
    editor: editorRef.current,
    analysis,
    onFixRequest: handleAIFix
  })

  // Обновим функцию isRelevantMarker, чтобы захватывать все ошибки TypeScript
  const isRelevantMarker = (marker: editor.IMarker) => {
    // Захватываем все маркеры с severity Error или Warning
    return marker.severity === monaco.MarkerSeverity.Error || 
           marker.severity === monaco.MarkerSeverity.Warning ||
           marker.severity === monaco.MarkerSeverity.Info;
  };

  // Обновим функцию getMarkerTypePrefix для более точной категоризации ошибок
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
        '1005': '[Syntax Error]',
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

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Добавляем AI дйстия в контекстное меню
    editor.addAction({
      id: 'ai-refactor',
      label: '🤖 Refactor with AI',
      contextMenuGroupId: 'ai',
      contextMenuOrder: 1.5,
      run: async (ed) => {
        const selection = ed.getSelection();
        if (selection) {
          const selectedText = ed.getModel()?.getValueInRange(selection);
          if (selectedText) {
            await handleAIRefactor(selectedText, selection);
          }
        }
      }
    });

    // Добавляем hover provider для подсказок
    monaco.languages.registerHoverProvider('typescript', {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return null;

        const range = {
          startLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endLineNumber: position.lineNumber,
          endColumn: word.endColumn
        };

        return {
          range,
          contents: [
            { value: '🤖 **AI Assistant Available**' },
            { value: 'Select code and right-click to refactor with AI' }
          ]
        };
      }
    });

    // Настраиваем поиск
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      const findController = editor.getContribution('editor.contrib.findController') as any
      if (findController) {
        const selection = editor.getSelection()
        const searchText = selection ? editor.getModel()?.getValueInRange(selection) : ''
        
        // Показываем виджет поика и фокусируемся на нём
        if (findController.start) {
          findController.start({
            searchString: searchText || '',
            isRegex: false,
            matchCase: false,
            wholeWord: false,
          })
        }
        
        // Фокусируемся на поле поиска
        setTimeout(() => {
          const findInput = document.querySelector('.monaco-editor .find-widget .input') as HTMLInputElement
          if (findInput) {
            findInput.focus()
          }
        }, 50)
      }
    })

    // В функции handleEditorDidMount добавим обработчик диагностики:
    // Добавляем слушатель диагностических сообщений
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        diagnosticCodesToIgnore: [] // Можно добавить коды, которые нужно игнорировать
    });

    // Обновляем обработчик маркеров
    monaco.editor.onDidChangeMarkers((uris) => {
        const model = editor.getModel();
        if (!model) return;

        // Проверяем, что маркеры относятся к текущему файлу
        if (!uris.some(uri => uri.toString() === model.uri.toString())) return;

        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        
        // Получаем новые маркеры только для текущего файла
        const newMarkerSuggestions = markers
            .filter(isRelevantMarker)
            .map(markerToSuggestion);
        
        // Обновляем кеш маркеров для текущего файла
        setTypescriptMarkers(newMarkerSuggestions);

        // Сохраняем существующие AI suggestions
        const aiSuggestions = analysis.suggestions.filter(s => 
            !s.message.includes('[TypeScript]') &&
            !s.message.includes('[Type Error]') &&
            !s.message.includes('[Type Mismatch]') &&
            !s.message.includes('[Missing Module]') &&
            !s.message.includes('[Syntax Error]') &&
            !s.message.includes('[Declaration Error]')
        );

        // Объединяем списки
        const combinedSuggestions = [
            ...newMarkerSuggestions,
            ...aiSuggestions
        ].sort((a, b) => {
            if (a.line !== b.line) return a.line - b.line;
            const severityOrder = { error: 0, warning: 1, info: 2 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        });

        // Обновляем состояние
        setAnalysis(prev => ({
            ...prev,
            suggestions: combinedSuggestions
        }));
        onAnalysisChange?.({
            ...analysis,
            suggestions: combinedSuggestions
        });

        // Отладочный вывод
        console.group('Markers Update for file:', currentFile?.name);
        console.log('New TypeScript markers:', newMarkerSuggestions);
        console.log('Current AI suggestions:', aiSuggestions);
        console.log('Combined result:', combinedSuggestions);
        console.groupEnd();
    });
  }

  const handleAIRefactor = async (code: string, range: IRange) => {
    if (!editorRef.current) return;

    try {
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50';
      overlay.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center gap-3">
          <svg class="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-gray-700 dark:text-gray-200">AI is analyzing your code...</span>
        </div>
      `;
      document.body.appendChild(overlay);

      const response = await refactorCode({
        code,
        context: 'Improve code quality and readability'
      });

      // Применяем изменения к выделенному тексту
      if (editorRef.current && range) {
        editorRef.current.executeEdits('ai-refactor', [{
          range: range,
          text: response.result
        }]);
      }

      // Показываем результаты анализа
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-3 rounded shadow-lg z-50';
      notification.innerHTML = `
        <div class="flex items-center gap-2">
          <span>✨ Refactoring complete! Found ${response.suggestions.length} suggestions.</span>
        </div>
      `;
      document.body.appendChild(notification);

      // Удаляем оверлей и уведомление через некоторое время
      overlay.remove();
      setTimeout(() => notification.remove(), 3000);

    } catch (error) {
      console.error('AI Refactor Error:', error);
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      notification.textContent = 'Failed to refactor code';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value)
      onChange?.(value)
      // Убираем автоматический анализ при каждом изменении
    }
  }

  // Обработка сохранения и получения новой оценки
  const handleSave = async (code: string) => {
    if (!currentFile) return;

    try {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = 'Analyzing code...';
        document.body.appendChild(notification);

        try {
            // Получаем новый анализ от API
            const newAnalysis = await analyzeCode(code, currentFile.id);

            // Используем кешированные TypeScript маркеры
            const combinedSuggestions = [
                ...typescriptMarkers, // Используем кешированные маркеры
                ...newAnalysis.suggestions.filter(suggestion => 
                    !typescriptMarkers.some(marker => 
                        marker.line === suggestion.line && 
                        suggestion.message.includes(marker.message.replace(/\[.*?\]\s/, ''))
                    )
                )
            ].sort((a, b) => {
                if (a.line !== b.line) return a.line - b.line;
                const severityOrder = { error: 0, warning: 1, info: 2 };
                return severityOrder[a.severity] - severityOrder[b.severity];
            });

            // Обновляем состояние
            const updatedAnalysis = {
                ...newAnalysis,
                suggestions: combinedSuggestions
            };

            setAnalysis(updatedAnalysis);
            onAnalysisChange?.(updatedAnalysis);

            // Сохраняем файл
            onSave?.(code);

            notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
            notification.textContent = 'File saved and analyzed!';
            setTimeout(() => notification.remove(), 2000);

            console.group('Save Analysis Update:');
            console.log('TypeScript markers (cached):', typescriptMarkers);
            console.log('AI suggestions:', newAnalysis.suggestions);
            console.log('Combined suggestions:', combinedSuggestions);
            console.groupEnd();

        } catch (analysisError) {
            console.error('Analysis failed, using TypeScript markers only:', analysisError);
            
            // В случае ошибки анализа используем только TypeScript маркеры
            const fallbackAnalysis = {
                metrics: {
                    readability: 70,
                    complexity: 70,
                    performance: 70
                },
                suggestions: typescriptMarkers
            };

            setAnalysis(fallbackAnalysis);
            onAnalysisChange?.(fallbackAnalysis);
            
            onSave?.(code);
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

  // Обработка Ctrl+S
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
