import React from 'react';
import { WritingChallengeResult } from '../types';

interface WritingResultsScreenProps {
  result: WritingChallengeResult;
  onRestart: () => void;
}

const WritingResultsScreen: React.FC<WritingResultsScreenProps> = ({ result, onRestart }) => {
  const { assessment, userResponse, prompt } = result;
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    if (score >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 9) return '🌟';
    if (score >= 8) return '🎉';
    if (score >= 6) return '😊';
    if (score >= 4) return '👍';
    return '💪';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Outstanding!';
    if (score >= 8) return 'Excellent!';
    if (score >= 7) return 'Great!';
    if (score >= 6) return 'Good!';
    if (score >= 5) return 'Nice Try!';
    return 'Keep Practicing!';
  };

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mb-4 shadow-xl">
          <span className="text-5xl">{getScoreEmoji(assessment.score)}</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-sky-400 mb-2">
          {getScoreLabel(assessment.score)}
        </h2>
        <div className="flex items-center justify-center gap-3">
          <span className="text-slate-400 text-lg">Your Score:</span>
          <span className={`text-4xl font-bold ${getScoreColor(assessment.score)}`}>
            {assessment.score}/10
          </span>
        </div>
      </div>

      {/* Overall Feedback */}
      <div className="bg-gradient-to-r from-sky-500/20 to-cyan-500/20 border-2 border-sky-500/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-sky-300 mb-3 flex items-center gap-2">
          <span>💬</span>
          <span>Teacher's Feedback</span>
        </h3>
        <p className="text-slate-100 text-lg leading-relaxed">{assessment.feedback}</p>
      </div>

      {/* Strengths */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-green-300 mb-4 flex items-center gap-2">
          <span>✨</span>
          <span>What You Did Well</span>
        </h3>
        <ul className="space-y-2">
          {assessment.strengths.map((strength, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-green-400 text-xl flex-shrink-0">✓</span>
              <span className="text-slate-100">{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Areas for Improvement */}
      {assessment.improvements.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-purple-300 mb-4 flex items-center gap-2">
            <span>🚀</span>
            <span>Ways to Improve</span>
          </h3>
          <ul className="space-y-2">
            {assessment.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-purple-400 text-xl flex-shrink-0">→</span>
                <span className="text-slate-100">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Your Poem */}
      <div className="bg-slate-700 border-2 border-slate-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-300 mb-3">📝 Your Poem:</h3>
        <div className="bg-slate-800 rounded-lg p-4 mb-4">
          <p className="text-slate-400 text-sm italic mb-2">Prompt: {prompt}</p>
        </div>
        <div className="whitespace-pre-wrap text-slate-100 font-mono text-base leading-relaxed">
          {userResponse}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onRestart}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          ✨ Try Another Challenge
        </button>
      </div>

      {/* Encouragement */}
      <div className="text-center text-slate-400 text-sm">
        <p>Keep writing and expressing yourself! Every poem makes you a better writer. 📚✍️</p>
      </div>
    </div>
  );
};

export default WritingResultsScreen;
