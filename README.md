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
1. **Dev/Prod Inconsistency** (New Critical)
   - Issue: Development and production environments behave differently
   - Impact: Unreliable production deployment
   - Root Causes:
     - State initialization differences
     - Cache handling inconsistencies
     - Environment-specific code paths
   - Fix Plan:
     - [ ] Unify state initialization logic
     - [ ] Implement environment-agnostic caching
     - [ ] Add state machine for analysis lifecycle
     - [ ] Improve error boundaries and fallbacks

2. **Metrics Initialization** (Partially Fixed)
   - Issue: ~~Metrics reset to 70% after initial load~~ Fixed
   - Remaining Issues:
     - [ ] Initial state handling in production
     - [ ] Smooth transitions between states
     - [ ] Loading indicators consistency

3. **Analysis Pipeline** (New Critical)
   - Issue: Unreliable analysis results in production
   - Impact: Incorrect metrics and suggestions
   - Fix Plan:
     - [ ] Implement robust analysis state machine
     - [ ] Add request/response validation
     - [ ] Improve error recovery
     - [ ] Add analysis versioning
     - [ ] Implement proper retry logic

4. **Cache Management** (New Critical)
   - Issue: Inconsistent cache behavior between environments
   - Impact: Unreliable analysis persistence
   - Fix Plan:
     - [ ] Implement versioned cache storage
     - [ ] Add cache validation
     - [ ] Improve cache invalidation
     - [ ] Add cache migration strategy

### ✅ Completed
- [x] GROQ API integration with enhanced prompts
- [x] Base path configuration for dev/prod environments
- [x] JSON parsing improvements for API responses
- [x] Default analysis values implementation
- [x] Error handling for API failures
- [x] Basic cache implementation
- [x] TypeScript type improvements

### 🏗️ In Progress
- [ ] Analysis System Refactoring
  - [ ] State machine implementation
  - [ ] Environment-agnostic caching
  - [ ] Robust error handling
  - [ ] Request/response validation
  - [ ] Analysis versioning

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
