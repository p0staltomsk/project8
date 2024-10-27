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

    // Используем единое состояние для анализа с корректными начальными значениями
    const [currentAnalysis, setCurrentAnalysis] = useState<CodeAnalysisResult>(() => {
        const savedAnalysis = localStorage.getItem(`analysis_${currentFile?.id}`);
        return savedAnalysis ? JSON.parse(savedAnalysis) : {
            metrics: {
                readability: 100,
                complexity: 100,
                performance: 100,
                security: 100
            },
            explanations: {
                readability: { score: 100, strengths: ["Initial code analysis pending"], improvements: [] },
                complexity: { score: 100, strengths: ["Initial code analysis pending"], improvements: [] },
                performance: { score: 100, strengths: ["Initial code analysis pending"], improvements: [] },
                security: { score: 100, strengths: ["Initial code analysis pending"], improvements: [] }
            },
            suggestions: [],
            isInitialState: true // Добавляем флаг для отслеживания начального состояния
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

    // Обновляем эффект для правильной инициализации анализа
    React.useEffect(() => {
        async function initializeAnalysis() {
            if (!currentFile) return;

            // Если это не начальное состояние и есть кэш - используем его
            const cachedAnalysis = getCachedAnalysis(currentFile.id, currentFile.content);
            if (cachedAnalysis) {
                setCurrentAnalysis(cachedAnalysis);
                return;
            }

            // Если это начальное состояние или нет кэша - делаем анализ
            if (currentAnalysis.isInitialState || !cachedAnalysis) {
                try {
                    const analysis = await analyzeCode(currentFile.content, currentFile.id);
                    if (analysis) {
                        const updatedAnalysis = {
                            ...analysis,
                            isInitialState: false
                        };
                        setCurrentAnalysis(updatedAnalysis);
                        localStorage.setItem(`analysis_${currentFile.id}`, JSON.stringify(updatedAnalysis));
                    }
                } catch (error) {
                    console.error('Analysis failed:', error);
                    // В случае ошибки сохраняем текущее состояние, но убираем флаг начального состояния
                    setCurrentAnalysis(prev => ({
                        ...prev,
                        isInitialState: false,
                        error: true
                    }));
                }
            }
        }

        initializeAnalysis();
    }, [currentFile?.id, currentFile?.content]);

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
                    explanations={currentAnalysis.explanations} // Явно передаем explanations
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
