# AI Code Assistant

Modern code editor with AI-powered code analysis and real-time quality metrics.

## Features

### Editor
- Monaco-based code editor with TypeScript support
- Dark/Light theme switching
- File tree navigation with modification tracking
- Search functionality (Ctrl+F)
- Auto-save and file state persistence

### AI Analysis
- Real-time code quality metrics:
  - Readability score
  - Complexity assessment
  - Performance evaluation
- Smart code suggestions
- Line-specific improvement recommendations

### UI/UX
- Clean, modern interface with Tailwind CSS
- Collapsible sidebar and AI assistant panels
- File modification indicators
- Keyboard shortcuts support
- Responsive layout design

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Tech Stack
- React 18
- TypeScript
- Monaco Editor
- Tailwind CSS
- Jest + Testing Library

## Development

### Project Structure
```
src/
├── components/
│   ├── AIAssistant/
│   ├── Editor/
│   ├── Layout/
│   ├── Sidebar/
│   └── Toolbar/
├── services/
│   ├── codeAnalysis.ts
│   └── fileSystem.ts
└── types/
```

### TODO
- [ ] Implement Grog API integration for code analysis
- [ ] Add file creation/editing functionality
- [ ] Add code formatting on save
- [ ] Complete test coverage
- [ ] Implement project import/export

## Contributing
Feel free to submit issues and pull requests.

## License
MIT
