# Math Quiz Generator - Architecture Overview

## 🏗️ Project Architecture

This document describes the architecture of the Math Quiz Generator, including both the web and Android mobile implementations.

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│          User Interface (React)                 │
│  ┌──────────────┬──────────────┬──────────────┐ │
│  │ SetupScreen  │  QuizScreen  │ResultsScreen │ │
│  └──────────────┴──────────────┴──────────────┘ │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│             Application Core                     │
│  ┌──────────────────────────────────────────┐  │
│  │ App.tsx (State Management & Routing)     │  │
│  └──────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│               Utilities                          │
│  ┌─────────────┬──────────────┬──────────────┐ │
│  │quizGenerator│sessionStorage│ soundEffects  │ │
│  │   urlUtils  │              │              │ │
│  └─────────────┴──────────────┴──────────────┘ │
└──────────────────────────────────────────────────┘
                  │
    ┌─────────────┴─────────────┐
    │                           │
┌───▼────────┐         ┌────────▼──────┐
│ Web Build  │         │ Mobile Build  │
│ (Vite)     │         │ (Capacitor)   │
└────────────┘         └───────┬───────┘
                               │
                      ┌────────▼────────┐
                      │ Android WebView │
                      │ (Native App)    │
                      └─────────────────┘
```

## 🌐 Platform Support

### Web Application
- **Technology**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS (CDN)
- **Deployment**: GitHub Pages
- **Base Path**: `/kids-math-challenger/`

### Android Mobile Application  
- **Technology**: Capacitor 7 + React WebView
- **Platform**: Android 5.0+ (API level 21+)
- **Package**: `com.mawroos.mathquiz`
- **Base Path**: `/` (root)

## 📁 Project Structure

```
kids-math-challenger/
│
├── 📱 Web Application
│   ├── index.html              # Entry HTML (mobile-optimized)
│   ├── index.tsx               # React entry point
│   ├── App.tsx                 # Main app component
│   ├── types.ts                # TypeScript definitions
│   ├── vite.config.ts          # Build configuration
│   │
│   ├── components/             # React components
│   │   ├── SetupScreen.tsx     # Quiz setup UI
│   │   ├── QuizScreen.tsx      # Quiz taking UI
│   │   ├── ResultsScreen.tsx   # Results display
│   │   ├── MathRenderer.tsx    # Fraction rendering
│   │   └── QRCodeGenerator.tsx # QR code for sharing
│   │
│   └── utils/                  # Utility modules
│       ├── quizGenerator.ts    # Question generation
│       ├── sessionStorage.ts   # Session persistence
│       ├── soundEffects.ts     # Audio feedback
│       └── urlUtils.ts         # URL encoding/sharing
│
├── 📱 Android Application
│   ├── capacitor.config.ts     # Capacitor configuration
│   │
│   └── android/                # Native Android project
│       ├── app/
│       │   ├── src/main/
│       │   │   ├── java/       # Java/Kotlin code
│       │   │   ├── res/        # Android resources
│       │   │   └── assets/     # Web app assets
│       │   │       └── public/ # Built web files
│       │   └── build.gradle    # App-level build config
│       │
│       ├── gradle/             # Gradle wrapper
│       ├── build.gradle        # Project-level build config
│       └── settings.gradle     # Project settings
│
└── 📚 Documentation
    ├── README.md               # General documentation
    ├── ANDROID_BUILD_GUIDE.md  # Detailed build guide
    ├── ANDROID_QUICK_START.md  # Quick reference
    └── ARCHITECTURE.md         # This file
```

## 🔄 Build Process

### Web Build Flow

```
Source Code (TS/TSX)
      ↓
  TypeScript Compilation
      ↓
  Vite Bundling
      ↓
  dist/ directory
      ↓
  GitHub Pages / Web Server
```

### Android Build Flow

```
Source Code (TS/TSX)
      ↓
  MOBILE_BUILD=true
      ↓
  TypeScript Compilation
      ↓
  Vite Bundling (base: '/')
      ↓
  dist/ directory
      ↓
  Capacitor Sync
      ↓
  android/app/src/main/assets/public/
      ↓
  Android Studio / Gradle Build
      ↓
  APK / AAB
```

## 🔌 Key Technologies

### Frontend Framework
- **React 19**: UI framework with hooks
- **TypeScript 5.8**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework

### Build Tools
- **Vite 6**: Fast build tool and dev server
- **Capacitor 7**: Native mobile wrapper
- **Android Gradle**: Android build system

### Libraries
- **QRCode**: Generate shareable quiz links
- **KaTeX**: Math equation rendering (if needed)

## 💾 Data Flow

### State Management

```
User Input → SetupScreen
              ↓
         Quiz Settings
              ↓
    Quiz Generator (utils)
              ↓
       Questions Array
              ↓
         QuizScreen
              ↓
      User Answers
              ↓
      Results Calculation
              ↓
      ResultsScreen
```

### Session Persistence

```
Quiz State Changes
      ↓
Session Storage Utility
      ↓
localStorage (browser)
      ↓
Auto-restore on page reload
      ↓
Continue Quiz
```

## 🎨 UI Components

### SetupScreen
- Configure quiz parameters
- Select operations
- Set number ranges
- Custom mode per operation
- Generate shareable links

### QuizScreen
- Display questions
- Input answers
- Real-time validation
- Timer display
- Progress indicator
- Sound effects

### ResultsScreen
- Score display
- Question review
- Time taken
- Correct/incorrect answers
- Restart option

### MathRenderer
- Render fractions visually
- Display mathematical symbols
- Format equations

## 🔐 Security & Privacy

- No backend server required
- All data stored locally
- No user tracking
- No external API calls (except Gemini API if configured)
- Session data auto-expires after 24 hours

## 📱 Mobile-Specific Features

### Android Optimizations
- Native WebView with hardware acceleration
- HTTPS scheme for secure content loading
- Mobile-friendly viewport settings
- Touch-optimized UI
- No scaling/zooming
- Full-screen mode support

### Capacitor Bridge
- Provides native device access (if needed in future)
- File system access
- Camera/photo library (for future features)
- Local notifications (for future features)
- Share API integration

## 🚀 Performance

### Web Performance
- Lazy loading components
- Optimized bundle size (~253KB)
- CDN-loaded dependencies
- Client-side rendering
- Session storage for persistence

### Mobile Performance
- Native WebView rendering
- Offline support (assets bundled)
- Fast startup time
- Smooth animations
- Hardware acceleration

## 🔧 Configuration Files

### vite.config.ts
```typescript
// Handles build configuration
// - Web build: base = '/kids-math-challenger/'
// - Mobile build: base = '/'
// - Environment variables (GEMINI_API_KEY)
```

### capacitor.config.ts
```typescript
// Capacitor configuration
// - App ID: com.mawroos.mathquiz
// - Web directory: dist
// - Android scheme: https
```

### package.json
```json
// Scripts:
// - build: Web build
// - build:mobile: Mobile build
// - android:sync: Build & sync to Android
// - android:open: Open in Android Studio
// - android:run: Build & run on device
```

## 🧪 Testing Strategy

### Development Testing
- Local dev server: `npm run dev`
- Test in browser
- Chrome DevTools
- Responsive design testing

### Mobile Testing
- Android Emulator
- Physical Android devices
- Chrome DevTools (chrome://inspect)
- USB debugging

### Build Testing
- Web build: `npm run build`
- Mobile build: `npm run build:mobile`
- Android sync: `npm run android:sync`

## 🔮 Future Enhancements

### Potential Features
- iOS support (add Capacitor iOS platform)
- Offline mode with service workers
- Progressive Web App (PWA)
- Native share functionality
- Push notifications for quiz reminders
- Dark/light theme toggle
- Multiple language support
- Cloud sync (optional)

### Technical Improvements
- Add unit tests (Jest/Vitest)
- Add E2E tests (Playwright/Cypress)
- Implement CI/CD pipeline
- Add error boundary components
- Implement analytics (optional)
- Add accessibility improvements

## 📝 Development Workflow

### For Web Development
```bash
1. Edit code
2. npm run dev        # Test locally
3. npm run build      # Build for production
4. Deploy to GitHub Pages
```

### For Android Development
```bash
1. Edit code
2. npm run android:sync    # Build & sync
3. npm run android:open    # Open Android Studio
4. Run/Debug in Android Studio
```

## 🤝 Contributing

When contributing to this project:
1. Understand the architecture
2. Follow the existing code style
3. Test both web and mobile builds
4. Update documentation
5. Ensure backward compatibility

## 📚 Additional Resources

- **React**: https://react.dev/
- **Capacitor**: https://capacitorjs.com/
- **Vite**: https://vitejs.dev/
- **TailwindCSS**: https://tailwindcss.com/
- **Android Developer**: https://developer.android.com/

---

**Last Updated**: October 2025  
**Version**: 1.0.0 (Android support added)
