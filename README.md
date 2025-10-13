

# Kids Learning Challenger

This contains everything you need to run your app locally.



## Features

### Math Quiz
- **Custom Quiz Generation**: Configure number ranges, operations, and question count (up to 500 questions)
- **Custom Ranges per Operation**: Advanced mode allowing different number ranges for each operation type
- **Multiple Math Operations**: Addition, Subtraction, Multiplication, Division, and **Equivalent Fractions**
- **Fraction Support**: Interactive fraction questions with visual rendering (e.g., ½ = ?/4)
- **Session Persistence**: Your quiz progress is automatically saved for 24 hours. If you refresh the page or close the browser, you can continue where you left off
- **Sound Effects**: Optional audio feedback for correct/incorrect answers and celebration sounds
- **Real-time Feedback**: Instant visual feedback with checkmarks for correct answers and X marks for incorrect ones
- **Timer**: Track how long it takes to complete your quiz
- **Cancel Quiz**: Option to cancel and restart at any time

### Writing Challenges (NEW! ✨)
- **AI-Powered Poetry Prompts**: Get age-appropriate creative writing prompts tailored to your school year (Years 1-12)
- **Intelligent Assessment**: Submit your poem and receive AI-powered feedback using Google's Gemini API
- **Constructive Feedback**: Get encouraging feedback with specific strengths highlighted
- **Personalized Suggestions**: Receive targeted recommendations to improve your writing skills
- **Score & Encouragement**: See how well you did with scores from 1-10 and motivating messages

## Setup Modes

### Standard Mode
- Set global number ranges that apply to all selected operations
- Simple and quick setup for general practice

### Custom Mode
- Configure unique number ranges for each operation
- Perfect for targeted practice or mixed difficulty levels
- Example: Easy addition (1-10) with harder multiplication (1-100)

## Challenge Types

### Math Quiz Question Types

1. **Basic Arithmetic**: Addition, subtraction, multiplication, and division with customizable number ranges
2. **Equivalent Fractions**: Find missing numerators or denominators in equivalent fractions
   - Example: `½ = ?/4` (Answer: 2)
   - Example: `6/9 = 2/?` (Answer: 3)

### Writing Challenge Types

1. **Poetry Writing**: Write creative poems based on age-appropriate prompts
   - Prompts are generated dynamically by AI based on your school year
   - Get detailed feedback on creativity, structure, and language use

## Session Storage

The app automatically saves your progress including:
- Current quiz state (setup, in-progress, or results)
- All questions and your answers
- Timer progress
- Quiz settings

Session data expires after 24 hours and can be manually cleared using the "Clear Saved Session" button on the setup screen.

## Analytics & Tracking

This app supports Google Tag Manager (GTM) for tracking usage analytics, including:

### What's Tracked
- **Geolocation**: Automatic geographic data collection (country, region, city) via Google Analytics in GTM
- **Device Information**: Browser type, operating system, screen resolution, viewport size
- **User Interactions**: Quiz starts, completions, scores, and time taken
- **Writing Challenges**: Challenge starts and completion rates with scores
- **Page Views**: Navigation and screen transitions within the app

### Privacy & Data
- All data is collected anonymously through Google Tag Manager
- No personally identifiable information (PII) is collected
- Geolocation is approximate (city-level) and provided by Google Analytics based on IP address
- Users can opt out of tracking by using browser privacy settings or extensions

### Setting Up Analytics
To enable analytics tracking for your deployment:

1. Create a Google Tag Manager container at https://tagmanager.google.com/
2. Set up Google Analytics 4 tag within GTM (optional - GTM can manage multiple tracking services)
3. Get your GTM Container ID (format: GTM-XXXXXXX)
4. Add it to your `.env.local` file:
   ```
   GTM_CONTAINER_ID=GTM-XXXXXXX
   ```
5. For GitHub Pages deployment, set the `GTM_CONTAINER_ID` as a repository secret and configure your build workflow to inject it

**Note**: Analytics tracking is optional. The app works fully without it. GTM provides flexibility to add/modify tracking tags without code changes.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your API keys:
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key (required for Writing Challenges):
     ```
     GEMINI_API_KEY=your_api_key_here
     ```
   - Get your free API key from: https://aistudio.google.com/app/apikey
   
   - (Optional) Add your Google Tag Manager Container ID for tracking:
     ```
     GTM_CONTAINER_ID=GTM-XXXXXXX
     ```
   - Get your Container ID from: https://tagmanager.google.com/

3. Run the app:
   ```bash
   npm run dev
   ```

**Note**: Math quizzes work without an API key. The API key is only required for Writing Challenges.
