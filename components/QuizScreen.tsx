import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Question, QuizResults } from '../types';
import CheckIcon from './icons/CheckIcon';
import XIcon from './icons/XIcon';
import { soundEffects } from '../utils/soundEffects';
import { sessionStorageUtils } from '../utils/sessionStorage';
import MathRenderer from './MathRenderer';

interface QuizScreenProps {
  questions: Question[];
  onFinishQuiz: (results: QuizResults) => void;
  onCancel: () => void;
  soundEnabled: boolean;
}

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

const QuizScreen: React.FC<QuizScreenProps> = ({ questions, onFinishQuiz, onCancel, soundEnabled }) => {
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [time, setTime] = useState(0);
  // Fix: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> for browser compatibility.
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Load saved user answers and time from session storage
  useEffect(() => {
    const sessionData = sessionStorageUtils.loadSession();
    if (sessionData && sessionData.userAnswers) {
      setUserAnswers(sessionData.userAnswers);
    }
    if (sessionData && sessionData.time) {
      setTime(sessionData.time);
    }
  }, []);

  // Save user answers to session storage whenever they change
  useEffect(() => {
    if (Object.keys(userAnswers).length > 0) {
      sessionStorageUtils.updateUserAnswers(userAnswers);
    }
  }, [userAnswers]);

  // Save time to session storage periodically
  useEffect(() => {
    if (time > 0) {
      sessionStorageUtils.updateTime(time);
    }
  }, [time]);

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

  const handleAnswerChange = (answerKey: string, value: string, question: Question) => {
    // Get the previous answer state
    const previousAnswer = userAnswers[answerKey];
    
    setUserAnswers((prev) => ({ ...prev, [answerKey]: value }));
    
    // Play sound effects based on answer correctness
    if (question && value !== '' && !isNaN(parseInt(value, 10))) {
      const numericValue = parseInt(value, 10);
      let isCorrect: boolean;
      if (question.correctAnswers) {
        isCorrect = question.correctAnswers.includes(numericValue);
      } else {
        isCorrect = numericValue === question.correctAnswer;
      }
      const wasCorrect = previousAnswer !== undefined && 
                        previousAnswer !== '' && 
                        !isNaN(parseInt(previousAnswer, 10)) && 
                        (question.correctAnswers
                          ? question.correctAnswers.includes(parseInt(previousAnswer, 10))
                          : parseInt(previousAnswer, 10) === question.correctAnswer);
      
      // Only play sound if the correctness state changed and sound is enabled
      if (soundEnabled) {
        if (isCorrect && !wasCorrect) {
          soundEffects.playCorrectSound();
        } else if (!isCorrect && (wasCorrect || previousAnswer === undefined || previousAnswer === '')) {
          soundEffects.playIncorrectSound();
        }
      }
    }
  };

  const finishQuiz = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    let score = 0;
    let total = 0;
    questions.forEach(q => {
      if (q.correctAnswers) {
        total += q.correctAnswers.length;
        const hasLabels = q.answerLabels && q.answerLabels.length === q.correctAnswers.length;
        if (hasLabels) {
          // Positional matching (expanded notation)
          q.correctAnswers.forEach((expected, idx) => {
            const key = `${q.id}_${idx}`;
            const val = parseInt(userAnswers[key], 10);
            if (!isNaN(val) && val === expected) {
              score++;
            }
          });
        } else {
          // Unordered matching (factors)
          const enteredValues = new Set<number>();
          q.correctAnswers.forEach((_, idx) => {
            const key = `${q.id}_${idx}`;
            const val = parseInt(userAnswers[key], 10);
            if (!isNaN(val) && q.correctAnswers!.includes(val) && !enteredValues.has(val)) {
              enteredValues.add(val);
              score++;
            }
          });
        }
      } else {
        total++;
        const userAnswer = parseInt(userAnswers[q.id.toString()], 10);
        if (userAnswer === q.correctAnswer) {
          score++;
        }
      }
    });
    
    // Play celebration sound when quiz is completed (if sound is enabled)
    if (soundEnabled) {
      soundEffects.playCelebrationSound();
    }
    
    onFinishQuiz({ score, total, time });
  }, [questions, userAnswers, time, onFinishQuiz, soundEnabled]);

  const handleCancel = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onCancel();
  }, [onCancel]);

  const allAnswered = questions.every(q => {
    if (q.correctAnswers) {
      return q.correctAnswers.every((_, idx) => {
        const key = `${q.id}_${idx}`;
        return userAnswers[key] !== undefined && userAnswers[key] !== '';
      });
    }
    const key = q.id.toString();
    return userAnswers[key] !== undefined && userAnswers[key] !== '';
  });

  return (
    <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-slate-100">Quiz in Progress</h2>
            <Timer time={time} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {questions.map((q, index) => {
                if (q.correctAnswers) {
                    // Multi-answer question (e.g., Factors of 12 or Expanded Notation)
                    const hasLabels = q.answerLabels && q.answerLabels.length === q.correctAnswers.length;
                    
                    const enteredValues: number[] = [];
                    q.correctAnswers.forEach((_, idx) => {
                        const key = `${q.id}_${idx}`;
                        const val = parseInt(userAnswers[key], 10);
                        if (!isNaN(val)) enteredValues.push(val);
                    });

                    const allBoxesFilled = q.correctAnswers.every((_, idx) => {
                        const key = `${q.id}_${idx}`;
                        return userAnswers[key] !== undefined && userAnswers[key] !== '';
                    });
                    
                    let allCorrect: boolean;
                    if (hasLabels) {
                        // Positional matching (expanded notation): each box must match its exact answer
                        allCorrect = allBoxesFilled && q.correctAnswers.every((expected, idx) => {
                            const key = `${q.id}_${idx}`;
                            return parseInt(userAnswers[key], 10) === expected;
                        });
                    } else {
                        // Unordered matching (factors): any valid factor in any box
                        const uniqueCorrect = new Set(enteredValues.filter(v => q.correctAnswers!.includes(v)));
                        allCorrect = allBoxesFilled && uniqueCorrect.size === q.correctAnswers.length;
                    }

                    let borderColor = 'border-slate-700';
                    if (allBoxesFilled) {
                        borderColor = allCorrect ? 'border-green-500' : 'border-red-500';
                    }

                    return (
                        <div key={q.id} className={`bg-slate-800/80 p-5 rounded-lg border-2 ${borderColor} transition-colors duration-300 shadow-lg md:col-span-2`}>
                            <div className="text-xl font-semibold text-slate-100 mb-4 text-center leading-relaxed">
                                <span>{q.text}</span>
                            </div>
                            <div className="flex flex-wrap justify-center gap-3 items-end">
                                {q.correctAnswers.map((expectedVal, idx) => {
                                    const key = `${q.id}_${idx}`;
                                    const boxValue = userAnswers[key] || '';
                                    const boxNum = parseInt(boxValue, 10);
                                    const boxAnswered = boxValue !== '';
                                    
                                    let boxCorrect: boolean;
                                    if (hasLabels) {
                                        // Positional: must match exact expected value
                                        boxCorrect = boxAnswered && !isNaN(boxNum) && boxNum === expectedVal;
                                    } else {
                                        // Unordered: check for duplicates
                                        let isDuplicate = false;
                                        if (boxAnswered && !isNaN(boxNum)) {
                                            for (let j = 0; j < idx; j++) {
                                                const prevVal = parseInt(userAnswers[`${q.id}_${j}`] || '', 10);
                                                if (prevVal === boxNum) { isDuplicate = true; break; }
                                            }
                                        }
                                        boxCorrect = boxAnswered && !isNaN(boxNum) && q.correctAnswers!.includes(boxNum) && !isDuplicate;
                                    }

                                    return (
                                        <div key={idx} className="flex items-center space-x-1">
                                            {hasLabels && idx > 0 && (
                                                <span className="text-slate-400 text-lg font-bold mr-1" aria-hidden="true">+</span>
                                            )}
                                            <div className="flex flex-col items-center">
                                                <input
                                                    type="number"
                                                    value={boxValue}
                                                    onChange={(e) => handleAnswerChange(key, e.target.value, q)}
                                                    className="w-16 bg-slate-700 border border-slate-500 rounded-md px-2 py-3 text-white text-lg text-center focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition placeholder-slate-400"
                                                    placeholder="?"
                                                />
                                                {hasLabels && (
                                                    <span className="text-xs text-slate-400 mt-1">{q.answerLabels![idx]}</span>
                                                )}
                                            </div>
                                            <div className="w-6 h-6 flex items-center justify-center">
                                                {boxAnswered && (boxCorrect ? <CheckIcon /> : <XIcon />)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                }

                // Regular single-answer question
                const answerKey = q.id.toString();
                const userAnswerStr = userAnswers[answerKey];
                const userAnswerNum = parseInt(userAnswerStr, 10);
                const isAnswered = userAnswerStr !== undefined && userAnswerStr !== '';
                const isCorrect = isAnswered && userAnswerNum === q.correctAnswer;
                
                let borderColor = 'border-slate-700';
                if (isAnswered) {
                    borderColor = isCorrect ? 'border-green-500' : 'border-red-500';
                }

                return (
                    <div key={q.id} className={`bg-slate-800/80 p-5 rounded-lg border-2 ${borderColor} transition-colors duration-300 flex items-center space-x-4 shadow-lg`}>
                        <div className="text-xl font-semibold text-slate-100 flex-1 leading-relaxed">
                            {q.text.includes('\\frac') ? (
                                <MathRenderer expression={q.text} />
                            ) : (
                                <span>{q.text}</span>
                            )}
                        </div>
                        <input
                            type="number"
                            // FIX: The ref callback should not return a value. Using a block body `{}` ensures the arrow function returns void.
                            ref={el => { inputRefs.current[index] = el; }}
                            value={userAnswerStr || ''}
                            onChange={(e) => handleAnswerChange(answerKey, e.target.value, q)}
                            className="w-28 bg-slate-700 border border-slate-500 rounded-md px-3 py-3 text-white text-lg text-center focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition placeholder-slate-400"
                            placeholder="?"
                        />
                        <div className="w-7 h-7 flex items-center justify-center">
                            {isAnswered && (isCorrect ? <CheckIcon /> : <XIcon />)}
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
                onClick={handleCancel}
                className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
            >
                Cancel Quiz
            </button>
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