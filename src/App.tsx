import React from 'react'
import MainLayout from './components/Layout/MainLayout'

export default function App() {
    const [isDarkMode, setIsDarkMode] = React.useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark'
        }
        return false
    })
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
    const [isAssistantOpen, setIsAssistantOpen] = React.useState(true)

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            document.body.classList.toggle('dark', isDarkMode)
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
        }
    }, [isDarkMode])

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
    const toggleAssistant = () => setIsAssistantOpen(!isAssistantOpen)
    const toggleTheme = () => setIsDarkMode(!isDarkMode)

    return (
        <MainLayout
            isSidebarOpen={isSidebarOpen}
            isAssistantOpen={isAssistantOpen}
            toggleSidebar={toggleSidebar}
            toggleAssistant={toggleAssistant}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
        />
    )
}
