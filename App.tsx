
import React, { useState, useCallback, useEffect } from 'react';
import { QuizSettings, Question, QuizResults, AppState, WritingChallengeSettings, WritingChallengeResult } from './types';
import SetupScreen from './components/SetupScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import WritingChallengeScreen from './components/WritingChallengeScreen';
import WritingResultsScreen from './components/WritingResultsScreen';
import { generateQuestions } from './utils/quizGenerator';
import { sessionStorageUtils } from './utils/sessionStorage';
import { urlUtils } from './utils/urlUtils';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [quizSettings, setQuizSettings] = useState<QuizSettings | null>(null);
  const [writingSettings, setWritingSettings] = useState<WritingChallengeSettings | null>(null);
  const [writingResult, setWritingResult] = useState<WritingChallengeResult | null>(null);
  const [sessionRestored, setSessionRestored] = useState<boolean>(false);
  const [isFromUrl, setIsFromUrl] = useState<boolean>(false);
  const [showSessionConflict, setShowSessionConflict] = useState<boolean>(false);
  const [urlSettingsFromLink, setUrlSettingsFromLink] = useState<QuizSettings | null>(null);
  const [existingSessionData, setExistingSessionData] = useState<any>(null);

  // Load session data on mount
  useEffect(() => {
    const urlParams = urlUtils.getCurrentUrlParams();
    const sessionData = sessionStorageUtils.loadSession();
    
    if (urlParams) {
      const urlSettings = urlUtils.decodeQuizSettings(urlParams);
      if (urlSettings) {
        // Check if there's existing session data
        if (sessionData && (sessionData.appState !== AppState.SETUP || sessionData.questions.length > 0)) {
          // Show conflict resolution dialog
          setUrlSettingsFromLink(urlSettings);
          setExistingSessionData(sessionData);
          setShowSessionConflict(true);
          
          // Clear URL parameters to keep URL clean
          urlUtils.updateUrl('');
        } else {
          // No existing session or only setup screen, proceed with URL settings
          startQuizFromUrl(urlSettings);
        }
        return;
      }
    }
    
    // No URL parameters, try to load session data
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

  const startQuizFromUrl = (urlSettings: QuizSettings) => {
    setQuizSettings(urlSettings);
    setQuestions(generateQuestions(urlSettings));
    setAppState(AppState.QUIZ);
    setSessionRestored(true);
    setIsFromUrl(true);
    
    // Clear URL parameters after processing to keep URL clean
    urlUtils.updateUrl('');
    
    // Hide the notification after 3 seconds
    setTimeout(() => setSessionRestored(false), 3000);
  };

  const handleUseUrlSettings = () => {
    if (urlSettingsFromLink) {
      startQuizFromUrl(urlSettingsFromLink);
    }
    setShowSessionConflict(false);
    setUrlSettingsFromLink(null);
    setExistingSessionData(null);
  };

  const handleUseExistingSession = () => {
    if (existingSessionData) {
      setAppState(existingSessionData.appState);
      setQuestions(existingSessionData.questions);
      setQuizResults(existingSessionData.quizResults);
      setQuizSettings(existingSessionData.quizSettings);
      setSessionRestored(true);
      setIsFromUrl(false);
      
      // Hide the notification after 3 seconds
      setTimeout(() => setSessionRestored(false), 3000);
    }
    setShowSessionConflict(false);
    setUrlSettingsFromLink(null);
    setExistingSessionData(null);
  };

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
    
    // Save completed session to history
    if (quizSettings) {
      sessionStorageUtils.saveCompletedSession(questions, results, quizSettings);
    }
  }, [questions, quizSettings]);

  const handleCancelQuiz = useCallback(() => {
    setQuestions([]);
    setQuizResults(null);
    setQuizSettings(null);
    setAppState(AppState.SETUP);
  }, []);

  const handleRestart = useCallback(() => {
    setQuestions([]);
    setQuizResults(null);
    setQuizSettings(null);
    setWritingSettings(null);
    setWritingResult(null);
    setAppState(AppState.SETUP);
    sessionStorageUtils.clearSession();
  }, []);

  const handleStartWritingChallenge = useCallback((settings: WritingChallengeSettings) => {
    setWritingSettings(settings);
    setAppState(AppState.WRITING_CHALLENGE);
  }, []);

  const handleFinishWritingChallenge = useCallback((result: WritingChallengeResult) => {
    setWritingResult(result);
    setAppState(AppState.WRITING_RESULTS);
  }, []);

  const handleCancelWritingChallenge = useCallback(() => {
    setWritingSettings(null);
    setWritingResult(null);
    setAppState(AppState.SETUP);
  }, []);

  const handleLoadSession = useCallback((sessionId: string) => {
    const session = sessionStorageUtils.loadSessionById(sessionId);
    if (session) {
      setQuizSettings(session.settings);
      setQuestions(session.questions);
      setQuizResults(session.quizResults);
      setAppState(AppState.RESULTS);
    }
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.QUIZ:
        return <QuizScreen questions={questions} onFinishQuiz={handleFinishQuiz} onCancel={handleCancelQuiz} soundEnabled={quizSettings?.soundEnabled ?? true} />;
      case AppState.RESULTS:
        return <ResultsScreen results={quizResults!} onRestart={handleRestart} soundEnabled={quizSettings?.soundEnabled ?? true} />;
      case AppState.WRITING_CHALLENGE:
        return <WritingChallengeScreen settings={writingSettings!} onFinish={handleFinishWritingChallenge} onCancel={handleCancelWritingChallenge} />;
      case AppState.WRITING_RESULTS:
        return <WritingResultsScreen result={writingResult!} onRestart={handleRestart} />;
      case AppState.SETUP:
      default:
        return <SetupScreen onStartQuiz={handleStartQuiz} onStartWritingChallenge={handleStartWritingChallenge} onLoadSession={handleLoadSession} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      {/* Session conflict resolution dialog */}
      {showSessionConflict && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-700">
            <h2 className="text-xl font-bold text-sky-400 mb-4">Choose Your Option</h2>
            <p className="text-slate-300 mb-6">
              You opened a shared quiz link, but you have an existing quiz in progress. What would you like to do?
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleUseUrlSettings}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Start New Quiz from Link
              </button>
              
              <button
                onClick={handleUseExistingSession}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Continue Existing Quiz
              </button>
            </div>
            
            <div className="mt-4 text-xs text-slate-400">
              <p>• <strong>New Quiz:</strong> Start fresh with the shared quiz settings</p>
              <p>• <strong>Existing:</strong> Continue where you left off</p>
            </div>
          </div>
        </div>
      )}

      {/* Session restored notification */}
      {sessionRestored && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {isFromUrl ? 'Quiz started from shared link!' : 'Session restored! Your progress has been saved.'}
        </div>
      )}
      
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
            Kids Learning Challenger
          </h1>
          <p className="text-slate-400 mt-2">Sharpen your mind with custom math and writing challenges.</p>
        </header>
        <main className="bg-slate-800 rounded-xl shadow-2xl shadow-slate-950/50 p-6 md:p-8 transition-all duration-500">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
