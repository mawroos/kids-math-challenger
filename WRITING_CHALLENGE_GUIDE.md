# Writing Challenge Guide

## Overview

The Writing Challenge feature allows students to practice creative writing with AI-powered feedback. Students select their school year, receive an age-appropriate prompt, write a poem, and get detailed assessment and suggestions for improvement.

## How It Works

### 1. Setup
- Student selects "Writing Challenge" from the challenge type selector
- Adjusts the school year slider (Years 1-12) for age-appropriate content
- Clicks "✨ Start Writing Challenge"

### 2. Prompt Generation
The app uses Google's Gemini API to generate a creative, age-appropriate poem prompt. For example:

**Year 3 Prompt (Age 8-9):**
> "Write a short poem about your favorite animal. Describe what it looks like, how it moves, and why you like it. Try to use words that help us imagine the animal clearly!"

**Year 7 Prompt (Age 12-13):**
> "Write a poem about a moment of change - perhaps the changing of seasons, growing older, or a friendship that evolved. Use descriptive language to capture both the 'before' and 'after' of your chosen moment."

### 3. Writing
- Student writes their poem in the provided textarea
- Minimum 20 characters required
- Cancel option available to go back

### 4. Assessment
The AI analyzes the poem and provides:

#### Score (1-10)
- 9-10: Outstanding - Excellent creativity, structure, and vocabulary
- 8: Excellent - Strong work with minor room for improvement
- 6-7: Good - Solid effort with clear areas to develop
- 4-5: Nice Try - Basic attempt, needs more development
- 1-3: Keep Practicing - Needs significant work

#### Feedback Components

**Overall Feedback**: 2-3 sentences of encouraging feedback about the poem

**Strengths** (3 items): Specific things the student did well
- Examples:
  - "Great use of descriptive words that paint a vivid picture"
  - "Nice rhythm and flow in your lines"
  - "Creative choice of topic and original perspective"

**Improvements** (2 items): Gentle, constructive suggestions
- Examples:
  - "Try adding more sensory details - what does it smell/sound/feel like?"
  - "Consider varying your line lengths to create more rhythm"

### 5. Results Display
Shows:
- Score out of 10 with emoji and label
- Overall feedback in a highlighted card
- Strengths list with checkmarks
- Improvement suggestions with arrows
- The original poem and prompt for reference
- Button to try another challenge

## Example Assessment

### Input
**Prompt:** "Write a poem about your favorite animal."

**Student's Poem:**
```
My dog is brown and fluffy,
He runs around the yard.
He wags his tail when happy,
And barks when guarding hard.

His ears are soft and floppy,
His nose is wet and cold.
He's been my friend forever,
Even though he's getting old.
```

### Output Assessment
```json
{
  "score": 8,
  "feedback": "This is a lovely poem about your dog! You've done a great job describing both how your dog looks and how he behaves. The rhyming pattern works well and makes the poem fun to read.",
  "strengths": [
    "Good use of rhyme scheme (ABAB pattern) that makes it easy to read",
    "Nice sensory details like 'soft and floppy' ears and 'wet and cold' nose",
    "Shows emotion and connection with 'been my friend forever'"
  ],
  "improvements": [
    "Try adding one more unique detail that makes YOUR dog special and different from other dogs",
    "Consider using a metaphor or simile in one line - e.g., 'tail wags like a happy flag'"
  ]
}
```

## API Configuration

### Required Environment Variable
```bash
GEMINI_API_KEY=your_api_key_here
```

Get your free API key from: https://aistudio.google.com/app/apikey

### API Endpoints Used

**Prompt Generation:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

**Poem Assessment:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

Both use the `gemini-1.5-flash` model for fast, cost-effective responses.

## Error Handling

The app gracefully handles errors:
- No API key configured: Shows error message
- Network failure: Displays retry option
- Invalid response: Falls back to error state
- All errors allow the user to go back to setup

## Future Enhancements

Potential additions:
- [ ] Support for different writing types (stories, descriptions, letters)
- [ ] Save writing history
- [ ] Export poems as PDF or text file
- [ ] Compare poems over time to track improvement
- [ ] Teacher/parent view with aggregated feedback
- [ ] Multiple language support
- [ ] Voice-to-text input for younger students
