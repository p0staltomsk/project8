import React, { useCallback, useEffect, useRef } from 'react'
import { BaseProps } from '@/types'
import Editor, { Monaco, OnMount } from '@monaco-editor/react'

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
 * 3. Интегрировать с Grog API:
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
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const [code, setCode] = React.useState(currentFile?.content || "// Select a file to start editing")

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

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

  // Обновляем код при смене файла
  useEffect(() => {
    if (currentFile) {
      setCode(currentFile.content)
    }
  }, [currentFile])

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value)
      onChange?.(value)
    }
  }

  // Обработка Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 's' || e.key === 'ы')) {
        e.preventDefault()
        if (currentFile) {
          console.log('🚀 Sending code for analysis...');
          console.log('📝 Code:', code);
          console.log('⏳ Waiting for Grog API response...');
          
          // Имитация задержки API
          setTimeout(() => {
            console.log('✅ Code analysis completed!');
            onSave?.(code)
          }, 500);
          
          const notification = document.createElement('div')
          notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50'
          notification.textContent = `File ${currentFile.name} saved and analyzed!`
          document.body.appendChild(notification)
          setTimeout(() => notification.remove(), 2000)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [code, onSave, currentFile])

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
