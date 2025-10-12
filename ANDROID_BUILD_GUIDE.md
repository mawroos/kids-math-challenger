# Android Build Guide for Math Quiz Generator

This guide explains how to build and deploy the Math Quiz Generator as a native Android mobile application using Capacitor.

## Overview

The app has been configured with Capacitor to allow building it as a native Android app. The web assets are bundled into the Android project and run in a WebView with native capabilities.

## Prerequisites

Before building the Android app, ensure you have:

1. **Node.js** (v16 or higher)
2. **Android Studio** (latest stable version recommended)
3. **Java JDK** (version 17 or higher)
4. **Android SDK** (installed via Android Studio)

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required dependencies including Capacitor and the Android platform.

### 2. Configure Environment Variables (Optional)

If your app uses the Gemini API, set up the `.env.local` file:

```bash
GEMINI_API_KEY=your_api_key_here
```

## Building for Android

### Quick Start Commands

The package.json includes convenient scripts for Android development:

```bash
# Build web assets for mobile and sync to Android
npm run android:sync

# Open the Android project in Android Studio
npm run android:open

# Build and run on connected device/emulator
npm run android:run
```

### Step-by-Step Build Process

#### 1. Build the Web Assets

Build the web application with mobile-specific configuration:

```bash
npm run build:mobile
```

This sets `MOBILE_BUILD=true` which configures the base path to `/` instead of `/kids-math-challenger/`.

#### 2. Sync Assets to Android Project

Copy the built web assets to the Android project:

```bash
npx cap sync android
```

This command:
- Copies files from `dist/` to `android/app/src/main/assets/public/`
- Updates native dependencies
- Refreshes the Capacitor configuration

#### 3. Open in Android Studio

```bash
npm run android:open
```

Or manually:
```bash
npx cap open android
```

This opens the Android project in Android Studio.

#### 4. Build and Run

**In Android Studio:**
1. Wait for Gradle sync to complete
2. Connect an Android device or start an emulator
3. Click the "Run" button (green play icon) or press Shift+F10

**Via Command Line:**
```bash
npx cap run android
```

Or use the npm script:
```bash
npm run android:run
```

## Project Structure

```
android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── assets/
│   │       │   └── public/          # Web assets (HTML, JS, CSS)
│   │       ├── java/
│   │       │   └── com/mawroos/mathquiz/
│   │       │       └── MainActivity.java
│   │       ├── res/                 # Android resources (icons, strings, etc.)
│   │       └── AndroidManifest.xml
│   └── build.gradle
├── gradle/
├── build.gradle
└── settings.gradle
```

## Customization

### App Icon

The default Capacitor icon is located in:
```
android/app/src/main/res/mipmap-*/ic_launcher.png
```

To customize:
1. Generate icons in multiple densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
2. Replace the icon files in the corresponding mipmap directories
3. Or use Android Studio's Image Asset Studio: Right-click `res` → New → Image Asset

### App Name

The app name is defined in:
```xml
android/app/src/main/res/values/strings.xml
```

Change the `app_name` value:
```xml
<string name="app_name">Math Quiz Generator</string>
```

### App ID and Package

The app ID is configured in:
- `capacitor.config.ts` - `appId: 'com.mawroos.mathquiz'`
- `android/app/build.gradle` - `applicationId`

### Splash Screen

To add a custom splash screen:
1. Add splash screen images to `android/app/src/main/res/drawable-*/`
2. Configure in `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  // ... other config
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0f172a",
      androidScaleType: "CENTER_CROP",
      showSpinner: false
    }
  }
};
```

## Building for Release

### 1. Generate a Signing Key

```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configure Signing in Android Studio

1. Open `android/app/build.gradle`
2. Add signing configuration:

```gradle
android {
    signingConfigs {
        release {
            storeFile file("path/to/my-release-key.keystore")
            storePassword "your-store-password"
            keyAlias "my-key-alias"
            keyPassword "your-key-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. Build Release APK

In Android Studio:
1. Build → Generate Signed Bundle / APK
2. Select APK
3. Choose your keystore and signing configuration
4. Select "release" build variant
5. Click Finish

Or via command line:
```bash
cd android
./gradlew assembleRelease
```

The APK will be generated at:
```
android/app/build/outputs/apk/release/app-release.apk
```

### 4. Build App Bundle (for Google Play)

```bash
cd android
./gradlew bundleRelease
```

The bundle will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

## Development Workflow

### Making Changes

1. Edit web code (React components, TypeScript, etc.)
2. Build for mobile: `npm run build:mobile`
3. Sync to Android: `npx cap sync android`
4. Run/reload in Android Studio or device

### Live Reload (Optional)

For faster development, you can use live reload:

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Update `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'http://YOUR_LOCAL_IP:5173',
     cleartext: true
   }
   ```

3. Sync and run on device

**Note:** Don't forget to remove or comment out the `server.url` before building for production!

## Troubleshooting

### Gradle Build Fails

- Ensure Android SDK is properly installed
- Check that JAVA_HOME is set to JDK 17+
- Try invalidating caches: File → Invalidate Caches / Restart in Android Studio

### App Crashes on Launch

- Check Android Studio Logcat for errors
- Verify web assets were synced: `npx cap sync android`
- Ensure all permissions are declared in AndroidManifest.xml

### White Screen on Launch

- Check if web assets are in `android/app/src/main/assets/public/`
- Verify `capacitor.config.json` is present in the assets folder
- Check browser console in Chrome DevTools (chrome://inspect)

### Assets Not Loading

- Ensure `base` path in `vite.config.ts` is set to `/` for mobile builds
- Use `MOBILE_BUILD=true npm run build` or `npm run build:mobile`
- Clear app data and reinstall

## Testing

### Debug on Physical Device

1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect device via USB
4. Run `npm run android:run`

### Test on Emulator

1. Open Android Studio → AVD Manager
2. Create a virtual device (recommended: Pixel 5 with Android 11+)
3. Start the emulator
4. Run `npm run android:run`

### Chrome DevTools

Debug the WebView using Chrome DevTools:
1. Open chrome://inspect in Chrome browser
2. Your device/emulator should appear
3. Click "inspect" to debug the WebView

## Configuration Files

### capacitor.config.ts

Main Capacitor configuration:
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mawroos.mathquiz',
  appName: 'Math Quiz Generator',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

### vite.config.ts

Build configuration with mobile support:
```typescript
export default defineConfig(({ mode }) => {
  const isMobileBuild = process.env.MOBILE_BUILD === 'true';
  
  return {
    base: isMobileBuild ? '/' : '/kids-math-challenger/',
    // ... other config
  };
});
```

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
- [Android Studio User Guide](https://developer.android.com/studio/intro)
- [Publishing on Google Play](https://developer.android.com/studio/publish)

## Support

For issues specific to:
- **Web app functionality**: Check the main README.md
- **Android build issues**: Refer to Capacitor documentation
- **Android-specific features**: Check Android developer documentation
