import React, { useState, useEffect, useRef, useCallback } from 'react'
import { BaseProps } from '@/types'
import Sidebar from '@/components/Sidebar/Sidebar'
import AIAssistant from '@/components/AIAssistant/AIAssistant'
import Toolbar from '@/components/Toolbar/Toolbar'
import CodeEditor from '@/components/Editor/Editor'
import SettingsPanel from '@/components/Settings/SettingsPanel'
import { ChevronLeft } from 'lucide-react'
import { analyzeCode } from '@/services/codeAnalysis'
import type { CodeAnalysisResult } from '@/types/codeAnalysis'
import type { editor } from 'monaco-editor'

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

    // Изменяем логику инициализации
    const [currentAnalysis, setCurrentAnalysis] = useState<CodeAnalysisResult>(() => {
        return {
            metrics: { readability: 0, complexity: 0, performance: 0, security: 0 },
            explanations: {
                readability: { score: 0, strengths: [], improvements: [] },
                complexity: { score: 0, strengths: [], improvements: [] },
                performance: { score: 0, strengths: [], improvements: [] },
                security: { score: 0, strengths: [], improvements: [] }
            },
            suggestions: [],
            isInitialState: true
        };
    });

    // Добавляем эффект для сброса анализа при смене файла
    useEffect(() => {
        setCurrentAnalysis({
            metrics: { readability: 0, complexity: 0, performance: 0, security: 0 },
            explanations: {
                readability: { score: 0, strengths: [], improvements: [] },
                complexity: { score: 0, strengths: [], improvements: [] },
                performance: { score: 0, strengths: [], improvements: [] },
                security: { score: 0, strengths: [], improvements: [] }
            },
            suggestions: [], // TypeScript ошибки добавятся автоматически через Editor
            isInitialState: true
        });
    }, [currentFile?.id]); // Зависимость от ID файла

    // Обновляем handleAnalysisChange
    const handleAnalysisChange = React.useCallback((analysis: CodeAnalysisResult) => {
        // Если это TypeScript ошибки, сохраняем их отдельно
        if (analysis.isInitialState) {
            const typeScriptErrors = analysis.suggestions.filter(s => 
                s.message.includes('[TypeScript]') || 
                s.message.includes('[Type Error]') ||
                s.message.includes('[Type Mismatch]') ||
                s.message.includes('[Missing Property]') ||
                s.message.includes('[Unreachable Code]') ||
                s.message.includes('[Missing Module]') ||
                s.message.includes('[Missing Declaration]') ||
                s.message.includes('[Import Error]') ||
                s.message.includes('[Declaration Error]') ||
                s.message.includes('[Syntax Error]')
            );
            
            setCurrentAnalysis(prev => ({
                ...prev,
                suggestions: typeScriptErrors,
                isInitialState: true
            }));
            return;
        }

        // Для результатов анализа - объединяем с существующими TypeScript ошибками
        const updatedAnalysis = {
            ...analysis,
            suggestions: [
                ...currentAnalysis.suggestions.filter(s => 
                    s.message.includes('[TypeScript]') || 
                    s.message.includes('[Type Error]') ||
                    s.message.includes('[Type Mismatch]') ||
                    s.message.includes('[Missing Property]') ||
                    s.message.includes('[Unreachable Code]') ||
                    s.message.includes('[Missing Module]') ||
                    s.message.includes('[Missing Declaration]') ||
                    s.message.includes('[Import Error]') ||
                    s.message.includes('[Declaration Error]') ||
                    s.message.includes('[Syntax Error]')
                ),
                ...analysis.suggestions.filter(s => !s.message.includes('[TypeScript]'))
            ],
            isInitialState: false
        };

        console.log('Analysis updated:', updatedAnalysis);
        setCurrentAnalysis(updatedAnalysis);
        
        if (currentFile && !analysis.isInitialState) {
            localStorage.setItem(`analysis_${currentFile.id}`, JSON.stringify(updatedAnalysis));
        }
    }, [currentFile, currentAnalysis.suggestions]);

    // Анализ только по Ctrl+S
    const handleSave = React.useCallback(async (code: string) => {
        if (!currentFile) return;
        
        try {
            // Сначала анализ
            const analysis = await analyzeCode(code, currentFile.id);
            
            // Сохраняем текущие TypeScript ошибки
            const currentTypeScriptErrors = currentAnalysis.suggestions.filter(s => 
                s.message.includes('[TypeScript]') || 
                s.message.includes('[Type Error]') ||
                s.message.includes('[Type Mismatch]') ||
                s.message.includes('[Missing Property]') ||
                s.message.includes('[Unreachable Code]') ||
                s.message.includes('[Missing Module]') ||
                s.message.includes('[Missing Declaration]') ||
                s.message.includes('[Import Error]') ||
                s.message.includes('[Declaration Error]') ||
                s.message.includes('[Syntax Error]')
            );
            
            // Объединяем TypeScript ошбки с результатами анализа
            const updatedAnalysis = {
                ...analysis,
                suggestions: [
                    ...currentTypeScriptErrors, // Сначала TypeScript ошибки
                    ...analysis.suggestions.filter(s => !s.message.includes('[TypeScript]')) // Потом остальные
                ],
                isInitialState: false
            };
            
            setCurrentAnalysis(updatedAnalysis);
            
            // Потом сохраняем файл
            setCurrentFile(prev => prev ? { ...prev, content: code } : null);
            setModifiedFiles(prev => {
                const newSet = new Set(prev);
                newSet.delete(currentFile.id);
                return newSet;
            });

            console.log('Analysis completed:', updatedAnalysis);
        } catch (error) {
            console.error('Analysis failed:', error);
        }
    }, [currentFile, currentAnalysis.suggestions]);

    const handleFileSelect = React.useCallback(async (file: CurrentFile) => {
        setCurrentFile(file);
        localStorage.setItem('currentFile', JSON.stringify(file));
    }, []);

    const handleEditorChange = React.useCallback((code: string) => {
        if (currentFile && code !== currentFile.content) {
            setModifiedFiles(prev => new Set(prev).add(currentFile.id))
        }
    }, [currentFile]);

    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    // Добавляем обработчик клика по проблеме
    const handleProblemClick = useCallback((line: number) => {
        if (editorRef.current) {
            editorRef.current.revealLineInCenter(line);
            editorRef.current.setPosition({ lineNumber: line, column: 1 });
            editorRef.current.focus();
        }
    }, []);

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
                    editorRef={editorRef}
                />
            </div>

            <div className={`transition-all duration-300 ${isAssistantOpen ? 'w-80' : 'w-0'}`}>
                <AIAssistant 
                    isOpen={isAssistantOpen} 
                    toggleAssistant={toggleAssistant}
                    metrics={currentAnalysis.metrics}
                    suggestions={currentAnalysis.suggestions}
                    explanations={currentAnalysis.explanations}
                    onProblemClick={handleProblemClick}
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
