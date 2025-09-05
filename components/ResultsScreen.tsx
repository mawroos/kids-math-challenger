
import React from 'react';
import { QuizResults } from '../types';

interface ResultsScreenProps {
  results: QuizResults;
  onRestart: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, onRestart }) => {
    const { score, total, time } = results;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    };
    
    const getPerformanceColor = () => {
        if (percentage >= 80) return 'text-green-400';
        if (percentage >= 50) return 'text-yellow-400';
        return 'text-red-400';
    }

    return (
        <div className="text-center animate-fade-in flex flex-col items-center">
            <h2 className="text-3xl font-bold text-slate-100 mb-2">Quiz Complete!</h2>
            <p className="text-slate-400 mb-8">Here's how you did.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md mb-8">
                <div className="bg-slate-900/50 p-6 rounded-lg">
                    <p className="text-sm font-medium text-slate-400 mb-2">SCORE</p>
                    <p className={`text-5xl font-bold ${getPerformanceColor()}`}>{score}<span className="text-3xl text-slate-500">/{total}</span></p>
                    <p className={`text-xl font-semibold mt-2 ${getPerformanceColor()}`}>{percentage}%</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-lg">
                    <p className="text-sm font-medium text-slate-400 mb-2">TIME</p>
                    <p className="text-5xl font-bold text-sky-400">{formatTime(time)}</p>
                </div>
            </div>

            <button
                onClick={onRestart}
                className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
            >
                Try Again
            </button>
        </div>
    );
};

export default ResultsScreen;
