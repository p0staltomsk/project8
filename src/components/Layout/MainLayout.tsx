import React from 'react'
import { BaseProps } from '@/types'
import Sidebar from '@/components/Sidebar/Sidebar'
import AIAssistant from '@/components/AIAssistant/AIAssistant'
import Toolbar from '@/components/Toolbar/Toolbar'
import CodeEditor from '@/components/Editor/Editor'
import SettingsPanel from '@/components/Settings/SettingsPanel'
import { ChevronLeft } from 'lucide-react'
import { analyzeCode } from '@/services/codeAnalysis'

interface MainLayoutProps extends BaseProps {
    isSidebarOpen: boolean
    isAssistantOpen: boolean
    toggleSidebar: () => void
    toggleAssistant: () => void
    isDarkMode: boolean
    toggleTheme: () => void
}

interface CurrentFile {
    id: string;
    name: string;
    content: string;
}

const calculateMetrics = (code: string) => {
    // Простая демо-логика для подсчета метрик
    const lines = code.split('\n').length
    const hasTypes = code.includes(': ') || code.includes('interface ') || code.includes('type ')
    const hasComments = code.includes('//') || code.includes('/*')
    const hasTryCatch = code.includes('try') && code.includes('catch')
    
    const readability = hasComments ? 85 : 60
    const complexity = lines > 50 ? 40 : lines > 20 ? 60 : 90
    const performance = hasTryCatch ? 70 : 95

    return {
        readability: hasTypes ? readability + 10 : readability,
        complexity: Math.min(complexity + (hasTypes ? 20 : 0), 100),
        performance: Math.min(performance + (hasTryCatch ? -10 : 0), 100)
    }
}

export default function MainLayout({
    isSidebarOpen,
    isAssistantOpen,
    toggleSidebar,
    toggleAssistant,
    isDarkMode,
    toggleTheme
}: MainLayoutProps) {
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
    const [currentFile, setCurrentFile] = React.useState<CurrentFile | null>(() => {
        const savedFile = localStorage.getItem('currentFile')
        if (savedFile) {
            return JSON.parse(savedFile)
        }
        // Возвращаем example.js по умолчанию
        return {
            id: '3',
            name: 'example.js',
            content: `function example() {
  console.log('Hello, World!');
  return 42;
}`
        }
    })
    
    const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen)

    const [codeMetrics, setCodeMetrics] = React.useState({
        readability: 85,
        complexity: 60,
        performance: 95
    })

    const [codeSuggestions, setCodeSuggestions] = React.useState([
        { line: 1, message: 'Consider adding a return type for better type safety.' },
        { line: 2, message: 'Use template literals for string interpolation.' },
        { line: 3, message: 'Add a comment explaining the significance of 42.' }
    ])

    const [modifiedFiles, setModifiedFiles] = React.useState<Set<string>>(new Set())

    const handleFileSelect = React.useCallback((file: { id: string; name: string; content: string }) => {
        setCurrentFile(file)
        localStorage.setItem('currentFile', JSON.stringify(file))
        
        // Генерируем новые метрики при смене файла
        const newMetrics = {
            readability: Math.floor(Math.random() * 30) + 70,
            complexity: Math.floor(Math.random() * 40) + 40,
            performance: Math.floor(Math.random() * 20) + 80
        }
        setCodeMetrics(newMetrics)

        // Генерируем новые предложения
        const newSuggestions = [
            { line: Math.floor(Math.random() * 10) + 1, message: 'Consider using const instead of let.' },
            { line: Math.floor(Math.random() * 10) + 1, message: 'Add type annotations to function parameters.' },
            { line: Math.floor(Math.random() * 10) + 1, message: 'Consider breaking this function into smaller parts.' }
        ]
        setCodeSuggestions(newSuggestions)
    }, [])

    const handleEditorChange = React.useCallback((code: string) => {
        if (currentFile && code !== currentFile.content) {
            setModifiedFiles(prev => new Set(prev).add(currentFile.id))
        }
    }, [currentFile])

    const handleSave = React.useCallback(async (code: string) => {
        if (currentFile) {
            setCurrentFile({ ...currentFile, content: code })
            setModifiedFiles(prev => {
                const newSet = new Set(prev)
                newSet.delete(currentFile.id)
                return newSet
            })

            // Анализируем код при сохранении
            const analysis = await analyzeCode(code)
            setCodeMetrics(analysis.metrics)
            setCodeSuggestions(analysis.suggestions)
        }
    }, [currentFile])

    return (
        <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''} overflow-hidden`}>
            <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    onFileSelect={handleFileSelect}
                    currentFile={currentFile}
                    modifiedFiles={modifiedFiles}
                />
            </div>

            <div className='flex-1 flex flex-col min-w-0'>
                <Toolbar
                    toggleSidebar={toggleSidebar}
                    toggleTheme={toggleTheme}
                    isDarkMode={isDarkMode}
                    toggleSettings={toggleSettings}
                />
                <CodeEditor 
                    isDarkMode={isDarkMode} 
                    onSave={handleSave}
                    onChange={handleEditorChange}
                    currentFile={currentFile}
                />
            </div>

            <div className={`transition-all duration-300 ${isAssistantOpen ? 'w-80' : 'w-0'}`}>
                <AIAssistant 
                    isOpen={isAssistantOpen} 
                    toggleAssistant={toggleAssistant}
                    metrics={codeMetrics}
                    suggestions={codeSuggestions}
                />
            </div>

            {!isAssistantOpen && (
                <button
                    onClick={toggleAssistant}
                    className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-l-md hover:bg-blue-600 transition-colors"
                    aria-label="Open AI Assistant"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            )}

            <SettingsPanel isOpen={isSettingsOpen} toggleSettings={toggleSettings} />
        </div>
    )
}
