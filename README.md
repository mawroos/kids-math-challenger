<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Math Quiz Generator

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1G_dfbNrofVGtKKO3fFvWPjozxLvna40e

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
