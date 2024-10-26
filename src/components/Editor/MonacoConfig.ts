import { editor } from 'monaco-editor';

// Определяем кастомную тему
editor.defineTheme('customDarkTheme', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
        // Основной фон редактора - глубокий серый с легким синим оттенком
        'editor.background': '#1E1E2E',
        // Цвет текста - мягкий белый
        'editor.foreground': '#E4E4E7',
        // Подсветка текущей строки - чуть светлее основного фона
        'editor.lineHighlightBackground': '#2A2A3C',
        // Цвет выделения - приглушенный синий
        'editor.selectionBackground': '#2E3250',
        // Цвет неактивного выделения
        'editor.inactiveSelectionBackground': '#292937',
        // Цвет границ
        'editorLineNumber.foreground': '#4A4A6A',
        // Цвет активной строки в нумерации
        'editorLineNumber.activeForeground': '#7A7AA0',
        // Цвет курсора
        'editorCursor.foreground': '#7A7AA0',
        // Подсветка скобок
        'editorBracketMatch.background': '#363654',
        'editorBracketMatch.border': '#5A5A8A'
    }
});

export const editorOptions: editor.IStandaloneEditorConstructionOptions = {
    theme: 'customDarkTheme',
    fontSize: 14,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    renderLineHighlight: 'all',
    contextmenu: true,
    scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
        // Цвета скроллбара
        verticalSliderBackground: '#2A2A3C',
        horizontalSliderBackground: '#2A2A3C',
        verticalSliderHoverBackground: '#363654',
        horizontalSliderHoverBackground: '#363654'
    },
    // Дополнительные настройки для комфортного чтения
    lineHeight: 1.5,
    letterSpacing: 0.5,
    renderWhitespace: 'none',
    smoothScrolling: true,
    padding: { top: 10, bottom: 10 }
};
