// src/components/AIAssistant/MetricBar.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import MetricBar from './MetricBar'

describe('MetricBar', () => {
  it('renders correctly with given props', () => {
    render(<MetricBar value={75} label="Test Metric" />)
    
    expect(screen.getByText('Test Metric:')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveStyle('width: 75%')
  })
})