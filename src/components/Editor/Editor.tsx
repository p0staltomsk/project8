import React, { useCallback, useEffect, useRef, useState } from 'react'
import { BaseProps } from '@/types'
import Editor, { Monaco, OnMount } from '@monaco-editor/react'
import { useCodeAnalysis } from './useCodeAnalysis'
import axios from 'axios'
import type { editor, IRange, Position } from 'monaco-editor'
import { refactorCode } from '../../services/aiRefactor'
import { analyzeCode, getCachedAnalysis } from '../../services/codeAnalysis'

/**
 * TODO: 
 * 1. Добавить автоформатирование кода при сохранении:
 *    - Использовать prettier для форматирования
 *    - Добавить настройки форматирования в конфиг проекта
 *    - Добавить кнопку для ручного форматирования (Alt+Shift+F)
 * 
 * 2. Улучшить обработку сохранения:
 *    - Добавить индикатор несохраненных изменений
 *    - Предупреждать при закрытии с несохраненными изменениями
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
}

export default function CodeEditor({ isDarkMode, onSave, onChange, currentFile }: EditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const [code, setCode] = React.useState(currentFile?.content || "// Select a file to start editing")
  const [analysis, setAnalysis] = useState<CodeAnalysisResult | null>(null)
  const lastAnalyzedFileId = useRef<string | null>(null)

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

  // Обновляем только контент редактора при смене файла
  useEffect(() => {
    if (currentFile) {
      setCode(currentFile.content);
    }
  }, [currentFile]);

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

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Добавляем AI действия в контекстное меню
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
        
        // Показываем виджет поиска и фокусируемся на нём
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
  }

  const handleAIRefactor = async (code: string, range: IRange) => {
    if (!editorRef.current) return;

    try {
        // Добавляем оверлей затемнения
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

        // Показываем результаты анализа
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-3 rounded shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center gap-2">
                <span>✨ Analysis complete! Found ${response.suggestions.length} suggestions.</span>
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
        notification.textContent = 'Failed to analyze code';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value)
      onChange?.(value)
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

      // Получаем новый анализ от API только при сохранении
      const newAnalysis = await analyzeCode(code, currentFile.id);
      setAnalysis(newAnalysis);
      lastAnalyzedFileId.current = currentFile.id;

      // Сохраняем файл
      onSave?.(code);

      notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      notification.textContent = 'File saved and analyzed!';
      setTimeout(() => notification.remove(), 2000);
    } catch (error) {
      console.error('Save and analysis error:', error);
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      notification.textContent = 'Error during analysis';
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
