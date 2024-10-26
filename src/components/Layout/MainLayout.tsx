import React, { useState } from 'react'
import { BaseProps } from '@/types'
import Sidebar from '@/components/Sidebar/Sidebar'
import AIAssistant from '@/components/AIAssistant/AIAssistant'
import Toolbar from '@/components/Toolbar/Toolbar'
import CodeEditor from '@/components/Editor/Editor'
import SettingsPanel from '@/components/Settings/SettingsPanel'
import { ChevronLeft } from 'lucide-react'
import { analyzeCode, getCachedAnalysis } from '@/services/codeAnalysis'
import type { CodeAnalysisResult } from '@/types/codeAnalysis'  // Добавляем импорт типа

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

    const [modifiedFiles, setModifiedFiles] = React.useState<Set<string>>(new Set())

    // Используем единое состояние для анализа
    const [currentAnalysis, setCurrentAnalysis] = useState<CodeAnalysisResult>(() => {
        const savedAnalysis = localStorage.getItem(`analysis_${currentFile?.id}`);
        return savedAnalysis ? JSON.parse(savedAnalysis) : {
            metrics: {
                readability: 70,
                complexity: 70,
                performance: 70
            },
            suggestions: []
        };
    });

    // Обработчик изменения анализа
    const handleAnalysisChange = (analysis: CodeAnalysisResult) => {
        console.log('Analysis updated:', analysis);
        setCurrentAnalysis(analysis);
        
        // Сохраняем в localStorage
        if (currentFile) {
            localStorage.setItem(`analysis_${currentFile.id}`, JSON.stringify(analysis));
        }
    };

    // Эффект для инициализации анализа при смене файла
    React.useEffect(() => {
        async function initializeAnalysis() {
            if (!currentFile) return;

            try {
                const cachedAnalysis = getCachedAnalysis(currentFile.id, currentFile.content);
                if (cachedAnalysis) {
                    setCurrentAnalysis(cachedAnalysis);
                    return;
                }

                const analysis = await analyzeCode(currentFile.content, currentFile.id);
                setCurrentAnalysis(analysis);
                localStorage.setItem(`analysis_${currentFile.id}`, JSON.stringify(analysis));
            } catch (error) {
                console.error('Failed to initialize analysis:', error);
            }
        }

        initializeAnalysis();
    }, [currentFile?.id]);

    const handleFileSelect = React.useCallback(async (file: CurrentFile) => {
        setCurrentFile(file);
        localStorage.setItem('currentFile', JSON.stringify(file));
    }, []);

    const handleEditorChange = React.useCallback((code: string) => {
        if (currentFile && code !== currentFile.content) {
            setModifiedFiles(prev => new Set(prev).add(currentFile.id))
        }
    }, [currentFile]);

    const handleSave = React.useCallback(async (code: string) => {
        if (!currentFile) return;
        
        setCurrentFile(prev => prev ? { ...prev, content: code } : null);
        setModifiedFiles(prev => {
            const newSet = new Set(prev);
            newSet.delete(currentFile.id);
            return newSet;
        });
    }, [currentFile]);

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
                    onAnalysisChange={handleAnalysisChange}
                />
            </div>

            <div className={`transition-all duration-300 ${isAssistantOpen ? 'w-80' : 'w-0'}`}>
                <AIAssistant 
                    isOpen={isAssistantOpen} 
                    toggleAssistant={toggleAssistant}
                    metrics={currentAnalysis.metrics}
                    suggestions={currentAnalysis.suggestions}
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
