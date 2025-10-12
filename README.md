

# Math Quiz Generator

This contains everything you need to run your app locally.



## Features

- **Custom Quiz Generation**: Configure number ranges, operations, and question count (up to 500 questions)
- **Custom Ranges per Operation**: Advanced mode allowing different number ranges for each operation type
- **Multiple Math Operations**: Addition, Subtraction, Multiplication, Division, and **Equivalent Fractions**
- **Fraction Support**: Interactive fraction questions with visual rendering (e.g., ½ = ?/4)
- **Session Persistence**: Your quiz progress is automatically saved for 24 hours. If you refresh the page or close the browser, you can continue where you left off
- **Sound Effects**: Optional audio feedback for correct/incorrect answers and celebration sounds
- **Real-time Feedback**: Instant visual feedback with checkmarks for correct answers and X marks for incorrect ones
- **Timer**: Track how long it takes to complete your quiz
- **Cancel Quiz**: Option to cancel and restart at any time

## Setup Modes

### Standard Mode
- Set global number ranges that apply to all selected operations
- Simple and quick setup for general practice

### Custom Mode
- Configure unique number ranges for each operation
- Perfect for targeted practice or mixed difficulty levels
- Example: Easy addition (1-10) with harder multiplication (1-100)

## Question Types

1. **Basic Arithmetic**: Addition, subtraction, multiplication, and division with customizable number ranges
2. **Equivalent Fractions**: Find missing numerators or denominators in equivalent fractions
   - Example: `½ = ?/4` (Answer: 2)
   - Example: `6/9 = 2/?` (Answer: 3)

## Session Storage

The app automatically saves your progress including:
- Current quiz state (setup, in-progress, or results)
- All questions and your answers
- Timer progress
- Quiz settings

Session data expires after 24 hours and can be manually cleared using the "Clear Saved Session" button on the setup screen.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Build as Android App

The app can be deployed as a native Android mobile app using Capacitor. 

**Prerequisites:**
- Node.js
- Android Studio
- Java JDK 17 or higher

**Steps:**

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Build the web app for mobile:
   ```bash
   npm run build:mobile
   ```

3. Add Android platform (first time only):
   ```bash
   npm run android:add
   ```

4. Sync the web assets to Android project:
   ```bash
   npm run android:sync
   ```

5. Open Android Studio to build and run:
   ```bash
   npm run android:open
   ```

   Or build and run directly on connected device/emulator:
   ```bash
   npm run android:run
   ```

**Notes:**
- The Android project is located in the `android/` directory
- You can customize the app icon, splash screen, and other Android-specific settings in Android Studio
- The app will run as a native Android application with full access to device capabilities
- For production builds, use Android Studio to generate a signed APK or AAB file
