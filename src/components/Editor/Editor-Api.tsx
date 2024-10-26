import React, { useEffect } from 'react'
import { BaseProps } from '@/types'
import Editor from '@monaco-editor/react'
import { io, Socket } from 'socket.io-client'

interface EditorProps extends BaseProps {
  isDarkMode: boolean
  onAnalysis: (analysis: any) => void
}

export default function CodeEditor({ isDarkMode, onAnalysis }: EditorProps) {
  const [code, setCode] = React.useState("function example() {\n  console.log('Hello, World!');\n  return 42;\n}")
  const [socket, setSocket] = React.useState<Socket | null>(null)

  useEffect(() => {
    const newSocket = io('http://localhost:3000')
    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('codeChange', (newCode: string) => {
        setCode(newCode)
      })
    }
  }, [socket])

  const handleEditorChange = async (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value)
      socket?.emit('codeChange', value)
      
      try {
        const response = await fetch('/api/analyze-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: value }),
        })
        
        if (response.ok) {
          const analysis = await response.json()
          onAnalysis(analysis)
        }
      } catch (error) {
        console.error('Failed to analyze code:', error)
      }
    }
  }

  return (
    <div className="flex-1 overflow-hidden">
      <Editor
        height="100%"
        language="javascript"
        theme={isDarkMode ? 'vs-dark' : 'light'}
        value={code}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          tabSize: 2,
          automaticLayout: true,
          wordWrap: 'on'
        }}
      />
    </div>
  )
}
