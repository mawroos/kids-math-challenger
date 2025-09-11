
import React, { useState, useCallback, useEffect } from 'react';
import { QuizSettings, Question, QuizResults, AppState } from './types';
import SetupScreen from './components/SetupScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import { generateQuestions } from './utils/quizGenerator';
import { sessionStorageUtils } from './utils/sessionStorage';
import { urlUtils } from './utils/urlUtils';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [quizSettings, setQuizSettings] = useState<QuizSettings | null>(null);
  const [sessionRestored, setSessionRestored] = useState<boolean>(false);
  const [isFromUrl, setIsFromUrl] = useState<boolean>(false);

  // Load session data on mount
  useEffect(() => {
    // First, check for URL parameters (takes priority over session)
    const urlParams = urlUtils.getCurrentUrlParams();
    if (urlParams) {
      const urlSettings = urlUtils.decodeQuizSettings(urlParams);
      if (urlSettings) {
        // Auto-start quiz from URL parameters
        setQuizSettings(urlSettings);
        setQuestions(generateQuestions(urlSettings));
        setAppState(AppState.QUIZ);
        setSessionRestored(true);
        setIsFromUrl(true);
        
        // Clear URL parameters after processing to keep URL clean
        urlUtils.updateUrl('');
        
        // Hide the notification after 3 seconds
        setTimeout(() => setSessionRestored(false), 3000);
        return;
      }
    }
    
    // If no valid URL parameters, try to load session data
    const sessionData = sessionStorageUtils.loadSession();
    if (sessionData) {
      setAppState(sessionData.appState);
      setQuestions(sessionData.questions);
      setQuizResults(sessionData.quizResults);
      setQuizSettings(sessionData.quizSettings);
      setSessionRestored(true);
      setIsFromUrl(false);
      
      // Hide the notification after 3 seconds
      setTimeout(() => setSessionRestored(false), 3000);
    }
  }, []);

  // Save session data whenever state changes
  useEffect(() => {
    if (appState !== AppState.SETUP || questions.length > 0 || quizResults || quizSettings) {
      sessionStorageUtils.saveSession({
        appState,
        questions,
        quizResults,
        quizSettings
      });
    }
  }, [appState, questions, quizResults, quizSettings]);

  const handleStartQuiz = useCallback((settings: QuizSettings) => {
    setQuizSettings(settings);
    setQuestions(generateQuestions(settings));
    setAppState(AppState.QUIZ);
  }, []);

  const handleFinishQuiz = useCallback((results: QuizResults) => {
    setQuizResults(results);
    setAppState(AppState.RESULTS);
  }, []);

  const handleCancelQuiz = useCallback(() => {
    setQuestions([]);
    setQuizResults(null);
    setQuizSettings(null);
    setAppState(AppState.SETUP);
    sessionStorageUtils.clearSession();
  }, []);

  const handleRestart = useCallback(() => {
    setQuestions([]);
    setQuizResults(null);
    setQuizSettings(null);
    setAppState(AppState.SETUP);
    sessionStorageUtils.clearSession();
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.QUIZ:
        return <QuizScreen questions={questions} onFinishQuiz={handleFinishQuiz} onCancel={handleCancelQuiz} soundEnabled={quizSettings?.soundEnabled ?? true} />;
      case AppState.RESULTS:
        return <ResultsScreen results={quizResults!} onRestart={handleRestart} soundEnabled={quizSettings?.soundEnabled ?? true} />;
      case AppState.SETUP:
      default:
        return <SetupScreen onStartQuiz={handleStartQuiz} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      {/* Session restored notification */}
      {sessionRestored && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {isFromUrl ? 'Quiz started from shared link!' : 'Session restored! Your progress has been saved.'}
        </div>
      )}
      
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
