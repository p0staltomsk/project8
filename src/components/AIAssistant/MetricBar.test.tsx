/// <reference types="@testing-library/jest-dom" />
// src/components/AIAssistant/MetricBar.test.tsx
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import MetricBar from './MetricBar'
import { MetricExplanation } from '@/types/codeAnalysis'
import userEvent from '@testing-library/user-event'

const createMockExplanation = (
  score: number,
  strengths: string[] = [],
  improvements: string[] = []
): MetricExplanation => ({
  score,
  strengths,
  improvements
})

describe('MetricBar Component', () => {
  // Базовые тесты рендеринга
  describe('Basic Rendering', () => {
    const basicExplanation = createMockExplanation(75, ['Good point'], ['Improvement needed'])

    it('renders with correct label and value', () => {
      render(
        <MetricBar 
          value={75} 
          label="Test Metric" 
          explanation={basicExplanation}
        />
      )
      
      expect(screen.getByText('Test Metric')).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('sets correct ARIA attributes', () => {
      render(
        <MetricBar 
          value={75} 
          label="Test Metric" 
          explanation={basicExplanation}
        />
      )
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '75')
      expect(progressBar).toHaveAttribute('aria-valuemin', '0')
      expect(progressBar).toHaveAttribute('aria-valuemax', '100')
    })
  })

  // Тесты цветовой схемы для разных типов метрик
  describe('Color Schemes', () => {
    const testCases = [
      { type: 'readability', baseColor: 'emerald' },
      { type: 'complexity', baseColor: 'blue' },
      { type: 'performance', baseColor: 'purple' },
      { type: 'security', baseColor: 'orange' }
    ]

    testCases.forEach(({ type, baseColor }) => {
      describe(`${type} metric`, () => {
        const explanation = createMockExplanation(80)

        it(`applies correct color classes for different scores`, () => {
          const { rerender } = render(
            <MetricBar 
              value={90} 
              label={`${type} Test`} 
              type={type}
              explanation={explanation}
            />
          )
          
          // Высокий показатель
          expect(screen.getByRole('progressbar')).toHaveClass(`bg-${baseColor}-500`)

          // Средний показатель
          rerender(
            <MetricBar 
              value={65} 
              label={`${type} Test`} 
              type={type}
              explanation={explanation}
            />
          )
          expect(screen.getByRole('progressbar')).toHaveClass(`bg-${baseColor}-400`)

          // Низкий показатель
          rerender(
            <MetricBar 
              value={45} 
              label={`${type} Test`} 
              type={type}
              explanation={explanation}
            />
          )
          expect(screen.getByRole('progressbar')).toHaveClass(`bg-${baseColor}-300`)
        })
      })
    })
  })

  // Тесты интерактивности и отображения деталей
  describe('Interactivity and Details', () => {
    const detailedExplanation = createMockExplanation(
      75,
      ['Strength 1', 'Strength 2'],
      ['Improvement 1', 'Improvement 2']
    )

    it('shows and hides details on click when details exist', async () => {
      render(
        <MetricBar 
          value={75} 
          label="Interactive Test" 
          explanation={detailedExplanation}
        />
      )
      
      // Изначально детали скрыты
      expect(screen.queryByText('Strengths:')).not.toBeInTheDocument()
      
      // Клик для показа деталей
      await userEvent.click(screen.getByText('Interactive Test').closest('div')!)
      
      // Проверяем наличие всех деталей
      expect(screen.getByText('Strengths:')).toBeInTheDocument()
      expect(screen.getByText('• Strength 1')).toBeInTheDocument()
      expect(screen.getByText('• Strength 2')).toBeInTheDocument()
      expect(screen.getByText('Improvements:')).toBeInTheDocument()
      expect(screen.getByText('• Improvement 1')).toBeInTheDocument()
      expect(screen.getByText('• Improvement 2')).toBeInTheDocument()

      // Клик для скрытия деталей
      await userEvent.click(screen.getByText('Interactive Test').closest('div')!)
      expect(screen.queryByText('Strengths:')).not.toBeInTheDocument()
    })

    it('does not show details section when no details exist', async () => {
      const emptyExplanation = createMockExplanation(75, [], [])
      
      render(
        <MetricBar 
          value={75} 
          label="No Details Test" 
          explanation={emptyExplanation}
        />
      )
      
      await userEvent.click(screen.getByText('No Details Test').closest('div')!)
      expect(screen.queryByText('Strengths:')).not.toBeInTheDocument()
      expect(screen.queryByText('Improvements:')).not.toBeInTheDocument()
    })
  })
})
