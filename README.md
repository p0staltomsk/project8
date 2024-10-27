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

For detailed setup instructions, see our [Development Guide](DEVELOPMENT.md).

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
  - [ ] Fix initial metrics flickering (70% default values)
  - [ ] Prevent metrics jumping when switching files
  - [ ] Maintain consistent TypeScript issues display
  - [ ] Fix AI suggestions persistence
  - [ ] Improve real-time code analysis updates
  - [ ] Disable AI Suggestions button when no analysis available
  - [ ] Add "Save document to get Suggestions" tooltip

- [ ] Analysis System Improvements
  - [ ] Implement proper state management for metrics
  - [ ] Fix TypeScript markers synchronization
  - [ ] Add real-time AI suggestions updates
  - [ ] Improve caching mechanism
  - [ ] Add analysis state persistence

- [ ] UX Improvements
  - [ ] Add loading states for metrics
  - [ ] Smooth transitions for metric changes
  - [ ] Better error handling and feedback
  - [ ] Improve analysis update indicators

### 📋 Planned
- [ ] Prettier integration
- [ ] Git integration
- [ ] Custom analysis rules editor
- [ ] Team dashboard
- [ ] Export/Import functionality
- [ ] Code review automation
- [ ] Performance profiling tools
- [ ] Custom plugin system
- [ ] Testing Infrastructure
  - [ ] Unit Tests
    - [ ] AIAssistant component tests
    - [ ] Code analysis service tests
    - [ ] File system service tests
    - [ ] GROQ API integration tests
  - [ ] Integration Tests
    - [ ] Editor-AIAssistant interaction
    - [ ] File system-Editor integration
    - [ ] Analysis pipeline tests
  - [ ] E2E Tests
    - [ ] Complete user workflows
    - [ ] Performance testing
    - [ ] Error handling scenarios
  - [ ] Test Coverage Goals
    - [ ] Core components: 90%+
    - [ ] Services: 85%+
    - [ ] Utils: 80%+

## 🎯 Next Steps Priority

1. Testing Infrastructure Enhancement
   - Complete AIAssistant component tests
   - Add tests for code analysis services
   - Implement integration tests for core workflows

2. Metrics Stability Issues
   - Fix metrics initialization (70% default values)
   - Implement proper state management
   - Add loading states and transitions

3. Analysis System Improvements
   - Refactor analysis pipeline
   - Implement proper caching
   - Add real-time updates

4. Documentation
   - Add testing documentation
   - Update component API documentation
   - Create contribution guidelines for tests

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
│   │   ├── core/
│   │   │   ├── EditorCore.tsx
│   │   │   └── MonacoConfig.ts
│   │   ├── hooks/
│   │   │   ├── useMonacoSetup.ts
│   │   │   ├── useEditorState.ts
│   │   │   └── useEditorActions.ts
│   │   └── utils/
│   │       ├── markers.ts
│   │       └── monacoTheme.ts
│   ├── AIAssistant/
│   │   ├── components/
│   │   │   ├── MetricsSection.tsx
│   │   │   └── SuggestionsSection.tsx
│   │   └── hooks/
│   │       ├── useMetricsState.ts
│   │       └── useSuggestionsState.ts
│   ├── Layout/
│   └── Sidebar/
├── services/
│   ├── codeAnalysis/
│   │   ├── api.ts
│   │   ├── cache.ts
│   │   ├── validation.ts
│   │   └── types.ts
│   └── fileSystem.ts
└── types/
    └── codeAnalysis.ts
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments
- GROQ API for powerful AI capabilities
- Monaco Editor team
- React and TypeScript communities

---

<div align="center">

### Made with ❤️ by developers, for developers

</div>
