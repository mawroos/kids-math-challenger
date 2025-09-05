import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Question, QuizResults } from '../types';
import CheckIcon from './icons/CheckIcon';
import XIcon from './icons/XIcon';

interface QuizScreenProps {
  questions: Question[];
  onFinishQuiz: (results: QuizResults) => void;
}

const Timer: React.FC<{ time: number }> = ({ time }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-2xl font-mono bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
      {formatTime(time)}
    </div>
  );
};

const QuizScreen: React.FC<QuizScreenProps> = ({ questions, onFinishQuiz }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [time, setTime] = useState(0);
  // Fix: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> for browser compatibility.
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleAnswerChange = (id: number, value: string) => {
    setUserAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const finishQuiz = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const score = questions.reduce((acc, q) => {
      const userAnswer = parseInt(userAnswers[q.id], 10);
      return userAnswer === q.correctAnswer ? acc + 1 : acc;
    }, 0);
    onFinishQuiz({ score, total: questions.length, time });
  }, [questions, userAnswers, time, onFinishQuiz]);

  const allAnswered = Object.keys(userAnswers).length === questions.length && Object.values(userAnswers).every(v => v !== '');

  return (
    <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-200">Quiz in Progress</h2>
            <Timer time={time} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((q, index) => {
                const userAnswerStr = userAnswers[q.id];
                const userAnswerNum = parseInt(userAnswerStr, 10);
                const isAnswered = userAnswerStr !== undefined && userAnswerStr !== '';
                const isCorrect = isAnswered && userAnswerNum === q.correctAnswer;
                
                let borderColor = 'border-slate-700';
                if (isAnswered) {
                    borderColor = isCorrect ? 'border-green-500' : 'border-red-500';
                }

                return (
                    <div key={q.id} className={`bg-slate-900/50 p-4 rounded-lg border-2 ${borderColor} transition-colors duration-300 flex items-center space-x-4`}>
                        <span className="text-lg font-medium text-slate-400 w-2/5">{q.text}</span>
                        <input
                            type="number"
                            ref={el => inputRefs.current[index] = el}
                            value={userAnswerStr || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="flex-grow bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        />
                        <div className="w-6 h-6">
                            {isAnswered && (isCorrect ? <CheckIcon /> : <XIcon />)}
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="mt-8 text-center">
            <button
                onClick={finishQuiz}
                disabled={!allAnswered}
                className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200 disabled:bg-slate-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed disabled:scale-100"
            >
                {allAnswered ? 'Finish Quiz' : 'Answer all questions to finish'}
            </button>
        </div>
    </div>
  );
};

export default QuizScreen;