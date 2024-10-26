/// <reference types="@testing-library/jest-dom" />
// src/components/AIAssistant/MetricBar.test.tsx
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import MetricBar from './MetricBar'

describe('MetricBar Component', () => {
  it('renders with correct label and value', () => {
    render(<MetricBar value={75} label="Test Metric" />)
    
    expect(screen.getByText('Test Metric:')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('renders progress bar with correct width', () => {
    render(<MetricBar value={75} label="Test Metric" />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveStyle({ width: '75%' })
  })

  it('applies correct color based on value', () => {
    const { rerender } = render(<MetricBar value={90} label="High Score" />)
    expect(screen.getByRole('progressbar')).toHaveClass('bg-green-500')

    rerender(<MetricBar value={65} label="Medium Score" />)
    expect(screen.getByRole('progressbar')).toHaveClass('bg-blue-500')

    rerender(<MetricBar value={45} label="Low Score" />)
    expect(screen.getByRole('progressbar')).toHaveClass('bg-orange-500')

    rerender(<MetricBar value={25} label="Critical Score" />)
    expect(screen.getByRole('progressbar')).toHaveClass('bg-red-500')
  })
})
