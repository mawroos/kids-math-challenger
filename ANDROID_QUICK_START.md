# Android Quick Start Guide

## 🎯 Overview

The Math Quiz Generator web app has been successfully converted to an Android mobile app using **Capacitor**. You can now build and deploy it as a native Android application.

## ⚡ Quick Commands

```bash
# Build and sync to Android
npm run android:sync

# Open in Android Studio
npm run android:open

# Build and run on device/emulator
npm run android:run
```

## 📦 What Was Added

### New Files
- `capacitor.config.ts` - Capacitor configuration
- `ANDROID_BUILD_GUIDE.md` - Comprehensive Android build documentation
- `android/` directory - Native Android project (gitignored)

### Modified Files
- `package.json` - Added Capacitor dependencies and Android scripts
- `vite.config.ts` - Added mobile build support (base path configuration)
- `index.html` - Added mobile-friendly meta tags
- `.gitignore` - Excluded Android build artifacts
- `README.md` - Added Android build section

## 🚀 Getting Started

### 1. Install Dependencies (if not done)
```bash
npm install
```

### 2. Add Android Platform (first time only)
```bash
npm run android:add
```

This creates the `android/` directory with the native Android project.

### 3. Build and Sync
```bash
npm run android:sync
```

This:
- Builds the web app with `MOBILE_BUILD=true`
- Copies assets to `android/app/src/main/assets/public/`
- Updates Capacitor configuration

### 4. Open in Android Studio
```bash
npm run android:open
```

### 5. Run the App
- In Android Studio: Click the Run button (▶️)
- Or use: `npm run android:run`

## 📱 App Details

- **App ID**: `com.mawroos.mathquiz`
- **App Name**: Math Quiz Generator
- **Package**: `com.mawroos.mathquiz`
- **Min SDK**: Android API level defined in Android project
- **Target SDK**: Latest Android API level

## 🔧 Configuration

### Mobile vs Web Build
The app now supports two build modes:

1. **Web Build** (default): `npm run build`
   - Base path: `/kids-math-challenger/`
   - For GitHub Pages deployment

2. **Mobile Build**: `npm run build:mobile`
   - Base path: `/`
   - For Android app

### Capacitor Config
```typescript
// capacitor.config.ts
{
  appId: 'com.mawroos.mathquiz',
  appName: 'Math Quiz Generator',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
}
```

## 📝 Development Workflow

1. Edit React/TypeScript code
2. Run `npm run android:sync` to build and sync
3. App auto-reloads in Android Studio/device

## 🛠️ Customization

### Change App Icon
Replace icons in: `android/app/src/main/res/mipmap-*/ic_launcher.png`

### Change App Name
Edit: `android/app/src/main/res/values/strings.xml`

### Change App ID
Edit: `capacitor.config.ts` and `android/app/build.gradle`

## 📚 Documentation

For detailed instructions, see:
- **[ANDROID_BUILD_GUIDE.md](./ANDROID_BUILD_GUIDE.md)** - Complete build guide
- **[README.md](./README.md)** - General app documentation

## ✅ Verification

The Android project has been successfully created and includes:
- ✅ Native Android project structure
- ✅ MainActivity and manifest configuration
- ✅ Web assets synced to Android
- ✅ Capacitor configuration
- ✅ Build scripts in package.json
- ✅ Proper gitignore entries

## 🐛 Troubleshooting

### Issue: Android directory not found
**Solution**: Run `npm run android:add`

### Issue: App shows blank screen
**Solution**: 
1. Check if build was for mobile: `npm run build:mobile`
2. Sync again: `npx cap sync android`

### Issue: Assets not loading
**Solution**: Verify base path is `/` for mobile builds in vite.config.ts

## 🔗 Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Studio](https://developer.android.com/studio)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)

## 💡 Tips

- Use `npm run android:sync` after any code changes
- Debug with Chrome DevTools at `chrome://inspect`
- Test on both emulator and physical device
- For production, build signed APK in Android Studio

---

**Ready to build!** 🎉

Start with: `npm run android:sync && npm run android:open`
