import React from 'react'
import { BaseProps } from '@/types'
import { Search, Bookmark, LayoutGrid, Settings, Moon, Sun, Menu, Upload } from 'lucide-react'

interface ToolbarProps extends BaseProps {
    toggleSidebar: () => void
    toggleTheme: () => void
    isDarkMode: boolean
    toggleSettings: () => void
}

export default function Toolbar({ toggleSidebar, toggleTheme, isDarkMode, toggleSettings }: ToolbarProps) {
    const [fileSearchQuery, setFileSearchQuery] = React.useState('')
    
    const handleFileSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setFileSearchQuery(value)
        // Демо поиска по файлам
        console.log('Searching files for:', value)
    }

    const handleProjectImport = React.useCallback(async () => {
        try {
            const mockProject = [
                { name: 'index.js', content: 'console.log("Hello, World!");', path: 'src/index.js' },
                { name: 'utils.js', content: 'export const add = (a, b) => a + b;', path: 'src/utils/utils.js' },
            ]

            // Демо импорта проекта
            console.log('Importing project...')
            await new Promise(resolve => setTimeout(resolve, 1000))
            console.log('Project imported:', mockProject)
        } catch (error) {
            console.error('Import failed:', error)
        }
    }, [])

    // Обработка Ctrl+F для поиска в редакторе
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'f' || e.key === 'а')) {
                e.preventDefault()
                const editor = window.monaco?.editor.getEditors()[0]
                if (editor) {
                    editor.getAction('actions.find').run()
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <button onClick={toggleSidebar} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
                <div className="relative">
                    <Search className="w-5 h-5 text-gray-500 dark:text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                        type="text"
                        value={fileSearchQuery}
                        onChange={handleFileSearch}
                        placeholder="Search in files..."
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors"
                    />
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <button onClick={handleProjectImport} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
                <button onClick={toggleTheme} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    {isDarkMode ? (
                        <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                        <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                </button>
                <button onClick={toggleSettings} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
            </div>
        </div>
    )
}
