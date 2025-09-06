
import React, { useState, useCallback } from 'react';
import { QuizSettings, Question, QuizResults, AppState } from './types';
import SetupScreen from './components/SetupScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import { generateQuestions } from './utils/quizGenerator';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [quizSettings, setQuizSettings] = useState<QuizSettings | null>(null);

  const handleStartQuiz = useCallback((settings: QuizSettings) => {
    setQuizSettings(settings);
    setQuestions(generateQuestions(settings));
    setAppState(AppState.QUIZ);
  }, []);

  const handleFinishQuiz = useCallback((results: QuizResults) => {
    setQuizResults(results);
    setAppState(AppState.RESULTS);
  }, []);

  const handleRestart = useCallback(() => {
    setQuestions([]);
    setQuizResults(null);
    setQuizSettings(null);
    setAppState(AppState.SETUP);
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.QUIZ:
        return <QuizScreen questions={questions} onFinishQuiz={handleFinishQuiz} soundEnabled={quizSettings?.soundEnabled ?? true} />;
      case AppState.RESULTS:
        return <ResultsScreen results={quizResults!} onRestart={handleRestart} soundEnabled={quizSettings?.soundEnabled ?? true} />;
      case AppState.SETUP:
      default:
        return <SetupScreen onStartQuiz={handleStartQuiz} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
            Math Quiz Generator
          </h1>
          <p className="text-slate-400 mt-2">Sharpen your mind with custom math challenges.</p>
        </header>
        <main className="bg-slate-800 rounded-xl shadow-2xl shadow-slate-950/50 p-6 md:p-8 transition-all duration-500">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
