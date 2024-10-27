# 🚀 AI Code Assistant

<div align="center">

Modern code editor with AI-powered code analysis and real-time quality metrics, powered by GROQ API.

<a href="https://web.89281112.xyz/project8/" target="_blank">
  <img src="https://img.shields.io/badge/LIVE-DEMO-blue?style=for-the-badge&logo=vercel&labelColor=000000&color=3178C6" alt="Live Demo" style="height: 40px; margin: 20px 0;" />
</a>

</div>

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Add your GROQ API key to .env
echo "VITE_GROQ_API_KEY=your_key_here" > .env

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Prerequisites
- Node.js 16+
- npm or yarn
- GROQ API key

### Development Setup
1. Clone the repository
2. Install dependencies
3. Set up your environment variables
4. Start the development server

## ✨ Features

### 🎯 Core Features
- **Real-time Code Analysis**
  - [x] Enhanced quality metrics (readability, complexity, performance, security)
  - [x] Detailed metric explanations with strengths and improvements
  - [x] Smart code suggestions with TypeScript integration
  - [x] Line-specific improvement recommendations
  - [x] AI-powered auto-fix functionality (subscription-based)
  - [x] Interactive metric visualization with tooltips

- **Advanced Editor**
  - [x] Monaco-based code editor with TypeScript support
  - [x] Custom dark theme optimized for long coding sessions
  - [x] File tree navigation
  - [x] Smart search functionality (Ctrl+F)
  - [x] Auto-save with analysis caching
  - [x] Context menu AI integration

- **AI Integration**
  - [x] GROQ API integration for code analysis
  - [x] Context-aware suggestions
  - [x] Intelligent code explanations
  - [x] Performance and security insights
  - [x] Subscription-based advanced features

### 🎨 UI/UX
- Clean, modern interface with Tailwind CSS
- Responsive layout design
- Dark/Light theme support
- Enhanced metric visualization with interactive tooltips
- Animated success states and feedback
- Premium subscription UI
- Improved code analysis presentation

## 🚦 Project Status

### 🔴 Critical Issues (Alpha Testing)
1. **Metrics Initialization**
   - Issue: Metrics reset to 70% after initial load
   - Impact: Poor UX, misleading display
   - Fix Plan:
     - [ ] Refactor metrics initialization
     - [ ] Implement proper loading states
     - [ ] Add smooth transitions

2. **Explanations Consistency**
   - Issue: Unstable explanations visibility
   - Impact: Confusing interface
   - Fix Plan:
     - [ ] Implement persistent states
     - [ ] Add proper state management
     - [ ] Store user preferences

3. **TypeScript Integration**
   - Issue: Issues disappear after AI analysis
   - Impact: Loss of development feedback
   - Fix Plan:
     - [ ] Implement markers persistence
     - [ ] Merge with AI suggestions
     - [ ] Prevent cleanup during analysis

4. **UI/UX Improvements**
   - Issue: Layout and usability concerns
   - Impact: Suboptimal user experience
   - Fix Plan:
     - [ ] Fix scrollbar layout shifts
     - [ ] Improve save action visibility
     - [ ] Add proper loading indicators

### ✅ Completed
- [x] GROQ API integration with enhanced prompts
- [x] Advanced code analysis system with explanations
- [x] Custom dark theme with improved contrast
- [x] File system implementation
- [x] Analysis caching system
- [x] Enhanced code metrics with security focus
- [x] Smart search functionality
- [x] Error handling and fallbacks
- [x] Subscription system UI
- [x] Interactive metrics display
- [x] Success state animations
- [x] Component Testing Infrastructure
  - [x] MetricBar component test coverage
    - Basic rendering and ARIA attributes
    - Color schemes for different metric types
    - Interactivity and details display
    - Edge cases handling

### 🏗️ In Progress
- [ ] Metrics Stability Issues
  - [ ] Fix initial metrics flickering
  - [ ] Prevent metrics jumping when switching files
  - [ ] Maintain consistent TypeScript issues display
  - [ ] Fix AI suggestions persistence
  - [ ] Improve real-time code analysis updates

- [ ] Analysis System Improvements
  - [ ] Implement proper state management for metrics
  - [ ] Fix TypeScript markers synchronization
  - [ ] Add real-time AI suggestions updates
  - [ ] Improve caching mechanism
  - [ ] Add analysis state persistence

### 📋 Planned
- [ ] Testing Infrastructure
  - [ ] Unit Tests
    - [ ] AIAssistant component tests
    - [ ] Code analysis service tests
  - [ ] Integration Tests
    - [ ] Editor-AIAssistant interaction
    - [ ] Analysis pipeline tests
  - [ ] Test Coverage Goals
    - [ ] Core components: 90%+
    - [ ] Services: 85%+

## 🎯 Next Steps Priority

1. Fix Critical Issues
   - Metrics initialization and stability
   - TypeScript integration
   - UI/UX improvements

2. Testing Infrastructure
   - Complete AIAssistant tests
   - Add analysis service tests
   - Implement integration tests

3. Analysis System
   - Refactor analysis pipeline
   - Implement proper caching
   - Add real-time updates

4. Documentation
   - Add testing documentation
   - Update API documentation
   - Create contribution guidelines

## 🛠️ Tech Stack
- React 18
- TypeScript
- Monaco Editor
- Tailwind CSS
- GROQ API
- Vite
- Jest
- Testing Library
- MSW (Mock Service Worker)

## 📁 Project Structure
```
src/
├── components/
│   ├── Editor/
│   │   └── Editor.tsx
│   ├── AIAssistant/
│   │   ├── AIAssistant.tsx
│   │   ├── MetricBar.tsx
│   │   ├── MetricBar.test.tsx
│   │   ├── components/
│   │   │   ├── MetricsSection.tsx
│   │   │   └── SuggestionsSection.tsx
│   │   └── hooks/
│   │       ├── useMetricsState.ts
│   │       └── useSuggestionsState.ts
│   ├── Layout/
│   │   └── MainLayout.tsx
│   ├── Popup/
│   │   └── subscription.tsx
│   ├── Settings/
│   │   └── SettingsPanel.tsx
│   ├── Sidebar/
│   │   └── Sidebar.tsx
│   ├── Toolbar/
│   │   └── Toolbar.tsx
│   └── store/
│       └── analysisStore.ts
├── services/
│   ├── codeAnalysis/
│   │   ├── api.ts
│   │   ├── cache.ts
│   │   └── types.ts
│   └── fileSystem.ts
└── types/
    └── codeAnalysis.ts
```

## 🤝 Contributing

We welcome contributions! Fork the repository and create a pull request with your improvements.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

MIT License

## 🙏 Acknowledgments
- GROQ API for powerful AI capabilities
- Monaco Editor team
- React and TypeScript communities

---

<div align="center">

### Made with ❤️ by developers, for developers

</div>
