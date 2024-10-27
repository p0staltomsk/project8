import React from 'react'
import { BaseProps } from '@/types'
import { Folder, FileText, ChevronRight, ChevronDown } from 'lucide-react'
// import { fileSystem } from '@/services/fileSystem'

interface SidebarProps extends BaseProps {
    isOpen: boolean;
    onFileSelect: (file: { id: string; name: string; content: string }) => void;
    currentFile?: { id: string; name: string; content: string } | null;
    modifiedFiles?: Set<string>;  // Новый проп для отслеживания измененных файлов
}

interface TreeItem {
    id: string;
    name: string;
    content?: string;
    parentId: string;
    children?: TreeItem[];
}

const DEMO_FILES: TreeItem[] = [
    {
        id: '1',
        name: 'src',
        parentId: 'root',
        children: [
            {
                id: '2',
                name: 'components',
                parentId: '1',
                children: [
                    {
                        id: '3',
                        name: 'example.js',
                        content: `function example() {
  console.log('Hello, World!');
  return 42;
}`,
                        parentId: '2'
                    },
                    {
                        id: '4',
                        name: 'Editor.tsx',
                        content: `import React, { useState, useEffect } from 'react';

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: string;
    theme?: 'light' | 'dark';
}

export function Editor({ value, onChange, language = 'javascript', theme = 'light' }: EditorProps) {
    const [content, setContent] = useState(value);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onChange(content);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [content, onChange]);

    return (
        <div className={\`editor-container \${theme}\`}>
            <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                className="editor-textarea"
            />
        </div>
    );
}`,
                        parentId: '2'
                    },
                    {
                        id: '5',
                        name: 'ThemeContext.tsx',
                        content: `import React, { createContext, useContext, useState } from 'react';

interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}`,
                        parentId: '2'
                    }
                ]
            },
            {
                id: '6',
                name: 'utils',
                parentId: '1',
                children: [
                    {
                        id: '7',
                        name: 'formatters.ts',
                        content: `export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(amount);
}

export function formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return \`\${size.toFixed(1)} \${units[unitIndex]}\`;
}`,
                        parentId: '6'
                    },
                    {
                        id: '8',
                        name: 'validation.ts',
                        content: `export function validateEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

export function validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors = [];
    
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}`,
                        parentId: '6'
                    }
                ]
            },
            {
                id: '9',
                name: 'styles',
                parentId: '1',
                children: [
                    {
                        id: '10',
                        name: 'theme.css',
                        content: `/* Theme Variables */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #10b981;
  --background-light: #ffffff;
  --background-dark: #1f2937;
  --text-light: #374151;
  --text-dark: #f3f4f6;
}

/* Dark Mode Styles */
.dark {
  background-color: var(--background-dark);
  color: var(--text-dark);
}

/* Animations */
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Components */
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.button-primary {
  background-color: var(--primary-color);
  color: white;
}

.button-secondary {
  background-color: var(--secondary-color);
  color: white;
}`,
                        parentId: '9'
                    }
                ]
            },
            {
                id: '11',
                name: 'config',
                parentId: '1',
                children: [
                    {
                        id: '12',
                        name: 'settings.json',
                        content: `{
  "editor": {
    "theme": "dark",
    "fontSize": 14,
    "fontFamily": "Monaco, 'Courier New', monospace",
    "tabSize": 2,
    "insertSpaces": true,
    "wordWrap": "on",
    "autoSave": true,
    "formatOnSave": true
  },
  "analysis": {
    "autoAnalyze": true,
    "suggestionsEnabled": true,
    "metrics": {
      "readability": true,
      "complexity": true,
      "performance": true,
      "security": true
    }
  },
  "features": {
    "aiAssistant": true,
    "autoComplete": true,
    "livePreview": true,
    "debugger": false
  }
}`,
                        parentId: '11'
                    }
                ]
            },
            {
                id: '13',
                name: 'UI',
                parentId: '1',
                children: [
                    {
                        id: '14',
                        name: 'Button.jsx',
                        content: `import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  className,
  ...props 
}) => {
  const baseClasses = 'button';
  const variantClasses = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    outline: 'button-outline',
  };
  const sizeClasses = {
    small: 'button-sm',
    medium: 'button-md', 
    large: 'button-lg',
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled && 'button-disabled',
    loading && 'button-loading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="button-spinner" />
      ) : children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default Button;`,
                        parentId: '13'
                    }
                ]
            }
        ]
    }
]

interface TreeItemProps {
    item: TreeItem;
    onSelect: (item: TreeItem) => void;
}

interface OpenFolders {
    [key: string]: boolean
}

export default function Sidebar({ isOpen, onFileSelect, currentFile, modifiedFiles = new Set() }: SidebarProps) {
    const fileTree = DEMO_FILES;
    const [openFolders, setOpenFolders] = React.useState<OpenFolders>(() => {
        const saved = localStorage.getItem('openFolders')
        return saved ? JSON.parse(saved) : {}
    })

    const handleSelect = (item: TreeItem) => {
        if (item.content) {
            onFileSelect({
                id: item.id,
                name: item.name,
                content: item.content
            })
        }
    }

    const handleFolderToggle = (folderId: string) => {
        const newOpenFolders = { ...openFolders, [folderId]: !openFolders[folderId] }
        setOpenFolders(newOpenFolders)
        localStorage.setItem('openFolders', JSON.stringify(newOpenFolders))
    }

    const TreeItem: React.FC<TreeItemProps> = React.useCallback(({ item, onSelect }) => {
        const hasChildren = item.children && item.children.length > 0
        const isOpen = openFolders[item.id]
        const isActive = currentFile?.id === item.id
        const isModified = modifiedFiles.has(item.id)

        return (
            <div>
                <div 
                    className={`flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer
                        ${isActive ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                    onClick={() => {
                        if (hasChildren) {
                            handleFolderToggle(item.id)
                        } else {
                            onSelect(item)
                        }
                    }}
                >
                    {hasChildren ? (
                        isOpen ? 
                            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : 
                            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    ) : null}
                    {item.content ? 
                        <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : 
                        <Folder className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    }
                    <span className={`text-sm text-gray-700 dark:text-gray-300 ${isActive ? 'font-medium' : ''}`}>
                        {item.name}
                        {isModified && <span className="ml-1 text-blue-500">●</span>}
                    </span>
                </div>
                {hasChildren && isOpen && item.children && (
                    <div className="ml-4">
                        {item.children.map((child: TreeItem) => (
                            <TreeItem key={child.id} item={child} onSelect={onSelect} />
                        ))}
                    </div>
                )}
            </div>
        )
    }, [openFolders, currentFile, modifiedFiles])

    return (
        <div className={`h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
            isOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}>
            <div className="h-full p-4 overflow-y-auto">
                <h2 className="text-lg font-semibold dark:text-white mb-4">Files</h2>
                {fileTree.map(item => (
                    <TreeItem key={item.id} item={item} onSelect={handleSelect} />
                ))}
            </div>
        </div>
    )
}
