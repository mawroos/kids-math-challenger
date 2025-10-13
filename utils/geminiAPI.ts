interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface PoemAssessment {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export const geminiAPI = {
  generatePoemPrompt: async (schoolYear: number): Promise<string> => {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `Generate a creative and age-appropriate poem writing prompt for a student in year ${schoolYear} (age ${schoolYear + 5}-${schoolYear + 6}). 
    The prompt should be:
    - Engaging and fun
    - Appropriate for their reading/writing level
    - Inspire creativity
    - Be specific enough to guide them but open enough for interpretation
    
    Return ONLY the prompt text, nothing else. Keep it to 2-3 sentences maximum.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 150,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      console.error('Error generating poem prompt:', error);
      throw error;
    }
  },

  assessPoem: async (poem: string, prompt: string, schoolYear: number): Promise<PoemAssessment> => {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const assessmentPrompt = `You are an encouraging and supportive teacher assessing a poem written by a year ${schoolYear} student (age ${schoolYear + 5}-${schoolYear + 6}).

Original Prompt: "${prompt}"

Student's Poem:
"""
${poem}
"""

Please provide a thorough but encouraging assessment in the following JSON format:
{
  "score": <number 1-10>,
  "feedback": "<2-3 sentences of encouraging overall feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<suggestion 1>", "<suggestion 2>"]
}

Scoring Guide:
- 8-10: Excellent creativity, good structure, age-appropriate vocabulary
- 6-7: Good effort, decent creativity, room for improvement
- 4-5: Basic attempt, needs more development
- 1-3: Minimal effort or off-topic

Be encouraging and specific. Focus on what they did well first, then gentle suggestions for improvement.
Return ONLY the JSON object, nothing else.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: assessmentPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      const responseText = data.candidates[0].content.parts[0].text.trim();
      
      // Extract JSON from response (remove markdown code blocks if present)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse assessment response');
      }
      
      const assessment = JSON.parse(jsonMatch[0]);
      
      return {
        score: Math.max(1, Math.min(10, assessment.score)),
        feedback: assessment.feedback,
        strengths: assessment.strengths || [],
        improvements: assessment.improvements || []
      };
    } catch (error) {
      console.error('Error assessing poem:', error);
      throw error;
    }
  }
};
