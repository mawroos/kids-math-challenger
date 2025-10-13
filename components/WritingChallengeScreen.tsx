import React, { useState, useEffect } from 'react';
import { WritingChallengeSettings, WritingChallengeResult } from '../types';
import { geminiAPI } from '../utils/geminiAPI';

interface WritingChallengeScreenProps {
  settings: WritingChallengeSettings;
  onFinish: (result: WritingChallengeResult) => void;
  onCancel: () => void;
}

const WritingChallengeScreen: React.FC<WritingChallengeScreenProps> = ({ settings, onFinish, onCancel }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [userPoem, setUserPoem] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState<string>('Generating your poem prompt...');

  useEffect(() => {
    loadPrompt();
  }, []);

  const loadPrompt = async () => {
    try {
      setLoading(true);
      setError('');
      const generatedPrompt = await geminiAPI.generatePoemPrompt(settings.schoolYear);
      setPrompt(generatedPrompt);
    } catch (err) {
      setError('Failed to generate prompt. Please check your API key and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userPoem.trim()) {
      setError('Please write your poem before submitting!');
      return;
    }

    if (userPoem.trim().length < 20) {
      setError('Your poem seems too short. Try adding a bit more!');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setLoadingMessage('Assessing your poem...');
      
      const assessment = await geminiAPI.assessPoem(userPoem, prompt, settings.schoolYear);
      
      const result: WritingChallengeResult = {
        prompt,
        userResponse: userPoem,
        assessment,
        timestamp: Date.now()
      };

      onFinish(result);
    } catch (err) {
      setError('Failed to assess poem. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent mb-4"></div>
        <p className="text-slate-300 text-lg">{loadingMessage}</p>
      </div>
    );
  }

  if (error && !prompt) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 mb-6">
          <p className="text-red-300 text-lg mb-4">{error}</p>
          <button
            onClick={loadPrompt}
            className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-300 underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-sky-400 mb-2">
          ✍️ Writing Challenge - Year {settings.schoolYear}
        </h2>
        <p className="text-slate-400">Write a creative poem based on the prompt below</p>
      </div>

      {/* Prompt Card */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-500/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-300 mb-3">📝 Your Prompt:</h3>
        <p className="text-slate-100 text-lg leading-relaxed">{prompt}</p>
      </div>

      {/* Writing Area */}
      <div className="space-y-3">
        <label htmlFor="poem-textarea" className="block text-sm font-medium text-slate-300">
          Your Poem:
        </label>
        <textarea
          id="poem-textarea"
          value={userPoem}
          onChange={(e) => {
            setUserPoem(e.target.value);
            setError('');
          }}
          placeholder="Start writing your poem here..."
          className="w-full h-64 px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/50 transition-colors resize-y font-mono text-base"
          disabled={submitting}
        />
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            {userPoem.trim().length} characters
          </span>
          <span className="text-slate-400">
            Minimum: 20 characters
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={handleSubmit}
          disabled={submitting || !userPoem.trim()}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
              {loadingMessage}
            </span>
          ) : (
            '✨ Submit for Assessment'
          )}
        </button>
        
        <button
          onClick={onCancel}
          disabled={submitting}
          className="px-6 py-4 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
        >
          Cancel
        </button>
      </div>

      {/* Tips */}
      <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-4">
        <h4 className="text-sky-300 font-semibold mb-2">💡 Writing Tips:</h4>
        <ul className="text-slate-300 text-sm space-y-1 list-disc list-inside">
          <li>Be creative and imaginative</li>
          <li>Use descriptive words to paint a picture</li>
          <li>Think about rhythm and flow</li>
          <li>Don't worry about being perfect - have fun!</li>
        </ul>
      </div>
    </div>
  );
};

export default WritingChallengeScreen;
