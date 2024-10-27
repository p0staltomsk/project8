import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CodeMetrics, CodeExplanations } from '@/types/codeAnalysis'

type AnalysisState = {
  currentFileId: string | null;
  metrics: CodeMetrics;
  explanations: CodeExplanations;
  expandedMetrics: string[];
  isLoading: boolean;
  setMetrics: (metrics: CodeMetrics) => void;
  setExplanations: (explanations: CodeExplanations) => void;
  toggleMetricExpansion: (metricKey: string) => void;
  setLoading: (loading: boolean) => void;
  setCurrentFileId: (fileId: string | null) => void;
  resetState: () => void;
}

const initialMetrics: CodeMetrics = {
  readability: 0,
  complexity: 0,
  performance: 0,
  security: 0
}

const initialExplanations: CodeExplanations = {
  readability: { score: 0, strengths: [], improvements: [] },
  complexity: { score: 0, strengths: [], improvements: [] },
  performance: { score: 0, strengths: [], improvements: [] },
  security: { score: 0, strengths: [], improvements: [] }
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set) => ({
      currentFileId: null,
      metrics: initialMetrics,
      explanations: initialExplanations,
      expandedMetrics: [],
      isLoading: true,
      setMetrics: (metrics) => set({ metrics }),
      setExplanations: (explanations) => set({ explanations }),
      toggleMetricExpansion: (metricKey) =>
        set((state) => ({
          expandedMetrics: state.expandedMetrics.includes(metricKey)
            ? state.expandedMetrics.filter(key => key !== metricKey)
            : [...state.expandedMetrics, metricKey]
        })),
      setLoading: (loading) => set({ isLoading: loading }),
      setCurrentFileId: (fileId) => set({ currentFileId: fileId }),
      resetState: () => set({
        metrics: initialMetrics,
        explanations: initialExplanations,
        isLoading: true
      })
    }),
    {
      name: 'analysis-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        expandedMetrics: state.expandedMetrics,
        currentFileId: state.currentFileId
      })
    }
  )
)
