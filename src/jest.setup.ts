import '@testing-library/jest-dom'
import 'jest-environment-jsdom'

// Расширяем глобальные типы для тестов
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveStyle(style: { [key: string]: any }): R;
    }
  }
}

/**
 * TODO: Покрыть тестами следующие компоненты и функционал:
 * 
 * 1. Компоненты:
 *    - Editor (проверка сохранения, форматирования, поиска)
 *    - Sidebar (работа с файловой структурой)
 *    - AIAssistant (метрики и предложения)
 *    - MetricBar (разные состояния и цвета)
 * 
 * 2. Сервисы:
 *    - codeAnalysis (анализ кода и метрики)
 *    - fileSystem (операции с файлами)
 * 
 * 3. Интеграционные тесты:
 *    - Полный цикл редактирования и сохранения
 *    - Работа с файловой структурой
 *    - Взаимодействие с AI Assistant
 */
