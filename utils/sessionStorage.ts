import { Question, QuizResults, QuizSettings, AppState } from '../types';

interface QuizSessionData {
  appState: AppState;
  questions: Question[];
  quizResults: QuizResults | null;
  quizSettings: QuizSettings | null;
  userAnswers?: Record<number, string>;
  time?: number;
  timestamp: number;
}

interface CompletedSession {
  id: string;
  timestamp: number;
  timeTaken: number;
  questionsAnswered: number;
  totalQuestions: number;
  score: number;
  settings: QuizSettings;
  questions: Question[];
  quizResults: QuizResults;
}

interface SessionHistory {
  sessions: CompletedSession[];
  timestamp: number;
}

const SESSION_KEY = 'mathQuizSession';
const HISTORY_KEY = 'mathQuizHistory';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const HISTORY_DURATION = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
const MAX_HISTORY_SESSIONS = 100;

export const sessionStorageUtils = {
  saveSession: (data: Omit<QuizSessionData, 'timestamp'>) => {
    try {
      const sessionData: QuizSessionData = {
        ...data,
        timestamp: Date.now()
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.warn('Failed to save session data:', error);
    }
  },

  loadSession: (): QuizSessionData | null => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (!stored) return null;

      const sessionData: QuizSessionData = JSON.parse(stored);
      
      // Check if session has expired (older than 24 hours)
      if (Date.now() - sessionData.timestamp > SESSION_DURATION) {
        sessionStorageUtils.clearSession();
        return null;
      }

      return sessionData;
    } catch (error) {
      console.warn('Failed to load session data:', error);
      sessionStorageUtils.clearSession();
      return null;
    }
  },

  clearSession: () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.warn('Failed to clear session data:', error);
    }
  },

  updateUserAnswers: (userAnswers: Record<number, string>) => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const sessionData: QuizSessionData = JSON.parse(stored);
        sessionData.userAnswers = userAnswers;
        sessionData.timestamp = Date.now(); // Update timestamp
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      }
    } catch (error) {
      console.warn('Failed to update user answers:', error);
    }
  },

  updateTime: (time: number) => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const sessionData: QuizSessionData = JSON.parse(stored);
        sessionData.time = time;
        sessionData.timestamp = Date.now(); // Update timestamp
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      }
    } catch (error) {
      console.warn('Failed to update time:', error);
    }
  },

  // Session History Management
  saveCompletedSession: (
    questions: Question[],
    quizResults: QuizResults,
    settings: QuizSettings
  ) => {
    try {
      const history = sessionStorageUtils.loadHistory();
      
      const completedSession: CompletedSession = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        timeTaken: quizResults.time,
        questionsAnswered: quizResults.total,
        totalQuestions: quizResults.total,
        score: quizResults.score,
        settings,
        questions,
        quizResults,
      };

      // Add new session at the beginning
      history.sessions.unshift(completedSession);

      // Keep only last 100 sessions
      if (history.sessions.length > MAX_HISTORY_SESSIONS) {
        history.sessions = history.sessions.slice(0, MAX_HISTORY_SESSIONS);
      }

      history.timestamp = Date.now();
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to save completed session:', error);
    }
  },

  loadHistory: (): SessionHistory => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (!stored) {
        return { sessions: [], timestamp: Date.now() };
      }

      const history: SessionHistory = JSON.parse(stored);

      // Check if history has expired (older than 1 year)
      if (Date.now() - history.timestamp > HISTORY_DURATION) {
        sessionStorageUtils.clearHistory();
        return { sessions: [], timestamp: Date.now() };
      }

      // Filter out expired sessions (older than 1 year)
      history.sessions = history.sessions.filter(
        (session) => Date.now() - session.timestamp <= HISTORY_DURATION
      );

      return history;
    } catch (error) {
      console.warn('Failed to load session history:', error);
      return { sessions: [], timestamp: Date.now() };
    }
  },

  deleteSession: (sessionId: string) => {
    try {
      const history = sessionStorageUtils.loadHistory();
      history.sessions = history.sessions.filter((s) => s.id !== sessionId);
      history.timestamp = Date.now();
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to delete session:', error);
    }
  },

  clearHistory: () => {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.warn('Failed to clear session history:', error);
    }
  },

  loadSessionById: (sessionId: string): CompletedSession | null => {
    try {
      const history = sessionStorageUtils.loadHistory();
      return history.sessions.find((s) => s.id === sessionId) || null;
    } catch (error) {
      console.warn('Failed to load session by ID:', error);
      return null;
    }
  },
};
