import React from 'react';
import { ProblemSolvingResults } from '../types';

interface ProblemSolvingResultsScreenProps {
  results: ProblemSolvingResults;
  onRestart: () => void;
  soundEnabled: boolean;
}

const ProblemSolvingResultsScreen: React.FC<ProblemSolvingResultsScreenProps> = ({ results, onRestart, soundEnabled }) => {
  const percentage = Math.round((results.score / results.total) * 100);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getMessage = (): { text: string; emoji: string } => {
    if (percentage === 100) return { text: 'Perfect Score! You\'re a maths superstar!', emoji: '🌟' };
    if (percentage >= 80) return { text: 'Excellent work! You\'re doing brilliantly!', emoji: '🎉' };
    if (percentage >= 60) return { text: 'Good effort! Keep practising!', emoji: '👍' };
    if (percentage >= 40) return { text: 'Nice try! You\'re getting there!', emoji: '💪' };
    return { text: 'Keep going! Practice makes perfect!', emoji: '📚' };
  };

  const message = getMessage();

  return (
    <div className="animate-fade-in text-center">
      <div className="text-6xl mb-4">{message.emoji}</div>
      <h2 className="text-3xl font-bold text-slate-100 mb-2">Problem Solving Complete!</h2>
      <p className="text-xl text-slate-300 mb-8">{message.text}</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
          <p className="text-3xl font-bold text-sky-400">{results.score}/{results.total}</p>
          <p className="text-sm text-slate-400 mt-1">Score</p>
        </div>
        <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
          <p className="text-3xl font-bold text-cyan-400">{percentage}%</p>
          <p className="text-sm text-slate-400 mt-1">Accuracy</p>
        </div>
        <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
          <p className="text-3xl font-bold text-purple-400">{formatTime(results.time)}</p>
          <p className="text-sm text-slate-400 mt-1">Time</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="w-full bg-slate-700 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all duration-1000 ${
              percentage >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : percentage >= 60 ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                : percentage >= 40 ? 'bg-gradient-to-r from-orange-500 to-amber-600'
                : 'bg-gradient-to-r from-red-500 to-rose-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <button
        onClick={onRestart}
        className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
      >
        🔄 Try Again
      </button>
    </div>
  );
};

export default ProblemSolvingResultsScreen;
