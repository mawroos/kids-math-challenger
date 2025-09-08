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

const SESSION_KEY = 'mathQuizSession';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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
  }
};
