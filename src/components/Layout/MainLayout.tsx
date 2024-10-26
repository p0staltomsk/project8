import React from 'react'
import { BaseProps } from '@/types'
import Sidebar from '@/components/Sidebar/Sidebar'
import AIAssistant from '@/components/AIAssistant/AIAssistant'
import Toolbar from '@/components/Toolbar/Toolbar'
import CodeEditor from '@/components/Editor/Editor'
import SettingsPanel from '@/components/Settings/SettingsPanel'
import { ChevronLeft } from 'lucide-react'
import { analyzeCode, getCachedAnalysis } from '@/services/codeAnalysis'

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

    // Инициализируем метрики из кеша или дефолтные
    const [codeMetrics, setCodeMetrics] = React.useState(() => {
        const savedMetrics = localStorage.getItem(`metrics_${currentFile?.id}`)
        return savedMetrics ? JSON.parse(savedMetrics) : {
            readability: 75,
            complexity: 70,
            performance: 80
        }
    })

    // Инициализируем suggestions из кеша или дефолтные
    const [codeSuggestions, setCodeSuggestions] = React.useState(() => {
        const savedSuggestions = localStorage.getItem(`suggestions_${currentFile?.id}`)
        return savedSuggestions ? JSON.parse(savedSuggestions) : [
            { line: 1, message: 'Consider adding JSDoc documentation', severity: 'info' }
        ]
    })

    const [modifiedFiles, setModifiedFiles] = React.useState<Set<string>>(new Set())

    // Анализируем код при первой загрузке
    React.useEffect(() => {
        async function initializeAnalysis() {
            if (!currentFile) return;

            try {
                // Проверяем кеш анализа
                const cachedAnalysis = getCachedAnalysis(currentFile.id, currentFile.content);
                if (cachedAnalysis) {
                    setCodeMetrics(cachedAnalysis.metrics);
                    setCodeSuggestions(cachedAnalysis.suggestions);
                    return;
                }

                // Если нет в кеше, делаем новый анализ
                const analysis = await analyzeCode(currentFile.content, currentFile.id);
                setCodeMetrics(analysis.metrics);
                setCodeSuggestions(analysis.suggestions);

                // Сохраняем результаты в localStorage
                localStorage.setItem(`metrics_${currentFile.id}`, JSON.stringify(analysis.metrics));
                localStorage.setItem(`suggestions_${currentFile.id}`, JSON.stringify(analysis.suggestions));
            } catch (error) {
                console.error('Failed to initialize analysis:', error);
            }
        }

        initializeAnalysis();
    }, [currentFile?.id]);

    const handleFileSelect = React.useCallback(async (file: { id: string; name: string; content: string }) => {
        setCurrentFile(file);
        localStorage.setItem('currentFile', JSON.stringify(file));
        
        try {
            const analysis = await analyzeCode(file.content, file.id);
            setCodeMetrics(analysis.metrics);
            setCodeSuggestions(analysis.suggestions);
            
            // Сохраняем результаты в localStorage
            localStorage.setItem(`metrics_${file.id}`, JSON.stringify(analysis.metrics));
            localStorage.setItem(`suggestions_${file.id}`, JSON.stringify(analysis.suggestions));
        } catch (error) {
            console.error('Failed to analyze selected file:', error);
        }
    }, []);

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
