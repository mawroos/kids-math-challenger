import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProblemSolvingQuestion, ProblemSolvingResults } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface ProblemSolvingScreenProps {
  questions: ProblemSolvingQuestion[];
  onFinish: (results: ProblemSolvingResults) => void;
  onCancel: () => void;
  soundEnabled: boolean;
}

const difficultyLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Easy', color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  2: { label: 'Medium', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
  3: { label: 'Hard', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
};

const problemTypeLabels: Record<string, { label: string; icon: string }> = {
  'word-problem': { label: 'Word Problem', icon: '📝' },
  'column-calculation': { label: 'Column Calculation', icon: '🔢' },
  'money-problem': { label: 'Money Problem', icon: '💷' },
  'missing-number': { label: 'Missing Number', icon: '❓' },
};

const Timer: React.FC<{ time: number }> = ({ time }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-2xl font-mono bg-slate-800 text-slate-100 px-5 py-3 rounded-lg border border-slate-600 shadow-lg">
      {formatTime(time)}
    </div>
  );
};

const ProblemSolvingScreen: React.FC<ProblemSolvingScreenProps> = ({ questions, onFinish, onCancel, soundEnabled }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showStepByStep, setShowStepByStep] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Shuffle answer options when question changes
  useEffect(() => {
    if (currentQuestion) {
      const options = [currentQuestion.correctAnswer, ...currentQuestion.distractorAnswers];
      // Fisher-Yates shuffle
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      setShuffledOptions(options);
    }
  }, [currentIndex, currentQuestion]);

  const handleSelectAnswer = useCallback((answer: number) => {
    if (answered) return;

    setSelectedAnswer(answer);
    setAnswered(true);

    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
      if (soundEnabled) soundEffects.playCorrectSound();
    } else {
      setShowHint(true);
      if (soundEnabled) soundEffects.playIncorrectSound();
    }
  }, [answered, currentQuestion, soundEnabled]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowHint(false);
      setShowStepByStep(false);
      setAnswered(false);
      setIsCorrect(false);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (soundEnabled) soundEffects.playCelebrationSound();
      onFinish({ score, total: questions.length, time });
    }
  }, [currentIndex, questions.length, score, time, onFinish, soundEnabled]);

  const handleCancel = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    onCancel();
  }, [onCancel]);

  const diffInfo = difficultyLabels[currentQuestion.difficultyLevel];
  const typeInfo = problemTypeLabels[currentQuestion.problemType];

  const formatAnswer = (val: number): string => {
    if (currentQuestion.problemType === 'money-problem') {
      return `£${val.toFixed(2)}`;
    }
    return val.toLocaleString();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-100">Problem Solving</h2>
        <Timer time={time} />
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-400 mb-1">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>Score: {score}/{currentIndex + (answered ? 1 : 0)}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-sky-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + (answered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-slate-700/50 rounded-xl p-6 mb-6 border border-slate-600">
        {/* Tags */}
        <div className="flex gap-2 mb-4">
          <span className={`text-xs px-2 py-1 rounded-full border ${diffInfo.color}`}>
            {diffInfo.label}
          </span>
          <span className="text-xs px-2 py-1 rounded-full border text-sky-400 bg-sky-400/10 border-sky-400/30">
            {typeInfo.icon} {typeInfo.label}
          </span>
        </div>

        {/* Question text */}
        <p className="text-xl text-slate-100 leading-relaxed">{currentQuestion.questionText}</p>
      </div>

      {/* Answer options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {shuffledOptions.map((option, idx) => {
          let btnClass = 'bg-slate-700 border-slate-500 hover:bg-slate-600 hover:border-sky-400 text-slate-100';

          if (answered) {
            if (option === currentQuestion.correctAnswer) {
              btnClass = 'bg-green-600/30 border-green-500 text-green-300';
            } else if (option === selectedAnswer && !isCorrect) {
              btnClass = 'bg-red-600/30 border-red-500 text-red-300';
            } else {
              btnClass = 'bg-slate-800 border-slate-700 text-slate-500';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectAnswer(option)}
              disabled={answered}
              className={`p-4 rounded-lg border-2 font-semibold text-lg transition-all duration-200 ${btnClass} ${
                !answered ? 'cursor-pointer transform hover:scale-102' : 'cursor-default'
              }`}
            >
              {formatAnswer(option)}
            </button>
          );
        })}
      </div>

      {/* Feedback section */}
      {answered && (
        <div className="space-y-4 mb-6 animate-fade-in">
          {/* Correct/Incorrect message */}
          <div className={`p-4 rounded-lg border ${
            isCorrect
              ? 'bg-green-500/10 border-green-500/30 text-green-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            <p className="font-bold text-lg">
              {isCorrect ? '🎉 Correct! Well done!' : '❌ Not quite right.'}
            </p>
            {!isCorrect && (
              <p className="mt-1">The correct answer is <strong>{formatAnswer(currentQuestion.correctAnswer)}</strong></p>
            )}
          </div>

          {/* Hint (shown on wrong answer) */}
          {showHint && !isCorrect && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300">
              <p className="font-semibold mb-1">💡 Hint:</p>
              <p>{currentQuestion.hintText}</p>
            </div>
          )}

          {/* Step-by-step toggle */}
          <button
            onClick={() => setShowStepByStep(!showStepByStep)}
            className="text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors"
          >
            {showStepByStep ? '▼ Hide Step-by-Step' : '▶ Show Step-by-Step Solution'}
          </button>

          {showStepByStep && (
            <div className="p-4 rounded-lg bg-sky-500/10 border border-sky-500/30">
              <p className="font-semibold text-sky-300 mb-3">📋 Step-by-Step:</p>
              <ol className="space-y-2">
                {currentQuestion.stepByStep.map((step, idx) => (
                  <li key={idx} className="text-slate-300 flex gap-2">
                    <span className="text-sky-400 font-mono text-sm mt-0.5">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={handleCancel}
          className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
        >
          Cancel
        </button>
        {answered && (
          <button
            onClick={handleNext}
            className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
          >
            {currentIndex < questions.length - 1 ? 'Next Question →' : 'Finish Quiz'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProblemSolvingScreen;
