# 🚀 AI Code Assistant

Modern code editor with AI-powered code analysis and real-time quality metrics, powered by GROQ API.

## ✨ Features

### 🎯 Core Features
- **Real-time Code Analysis**
  - Quality metrics (readability, complexity, performance)
  - Smart code suggestions
  - Line-specific improvement recommendations
  - AI-powered refactoring suggestions

- **Advanced Editor**
  - Monaco-based code editor with TypeScript support
  - Custom dark theme optimized for long coding sessions
  - File tree navigation
  - Smart search functionality (Ctrl+F)
  - Auto-save with analysis caching

- **AI Integration**
  - GROQ API integration for code analysis
  - Context-aware suggestions
  - Intelligent code refactoring
  - Performance optimization hints

### 🎨 UI/UX
- Clean, modern interface with Tailwind CSS
- Responsive layout design
- Customizable editor theme
- Intuitive file management
- Real-time feedback system

## 🚦 Project Status

### ✅ Completed
- [x] GROQ API integration
- [x] Code analysis system
- [x] Custom dark theme
- [x] File system implementation
- [x] Analysis caching system
- [x] Basic code metrics
- [x] Search functionality
- [x] Error handling

### 🏗️ In Progress
- [ ] Advanced refactoring features
- [ ] Code formatting on save
- [ ] Settings panel implementation
- [ ] Project-wide analysis
- [ ] Performance optimizations

### 📋 Planned
- [ ] Prettier integration
- [ ] Git integration
- [ ] Team collaboration features
- [ ] Custom analysis rules
- [ ] Export/Import functionality

## 🛠️ Tech Stack
- React 18
- TypeScript
- Monaco Editor
- Tailwind CSS
- GROQ API
- Vite

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
```

## 📁 Project Structure
```
src/
├── components/
│   ├── Editor/
│   │   ├── Editor.tsx
│   │   ├── MonacoConfig.ts
│   │   └── useCodeAnalysis.ts
│   ├── Layout/
│   └── Sidebar/
├── services/
│   ├── aiRefactor.ts
│   ├── codeAnalysis.ts
│   └── fileSystem.ts
├── config/
│   └── groq.ts
├── types/
└── styles/
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

<p align="center">Made with ❤️ by developers, for developers</p>
