import { Question, QuizResults, QuizSettings, AppState, WritingChallengeSettings, WritingChallengeResult } from '../types';
import { idbGet, idbSet, idbDelete, idbAtomicUpdate } from './db';

interface QuizSessionData {
  appState: AppState;
  questions: Question[];
  quizResults: QuizResults | null;
  quizSettings: QuizSettings | null;
  writingSettings?: WritingChallengeSettings | null;
  writingResult?: WritingChallengeResult | null;
  userAnswers?: Record<string, string>;
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
  quizResults: QuizResults | null;
  isCompleted: boolean;
  userAnswers?: Record<string, string>;
  appState?: AppState;
}

interface SessionHistory {
  sessions: CompletedSession[];
  timestamp: number;
}

const SESSION_KEY = 'mathQuizSession';
const HISTORY_KEY = 'mathQuizHistory';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
const HISTORY_DURATION = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
const MAX_HISTORY_SESSIONS = 100;

// One-time migration of any pre-upgrade data sitting in localStorage into
// IndexedDB, so users mid-quiz when this ships don't lose their progress.
let migrationPromise: Promise<void> | null = null;

const migrateLegacyLocalStorage = (): Promise<void> => {
  if (migrationPromise) return migrationPromise;

  migrationPromise = (async () => {
    for (const key of [SESSION_KEY, HISTORY_KEY]) {
      try {
        const existing = await idbGet(key);
        if (existing !== undefined) continue;

        const raw = localStorage.getItem(key);
        if (raw) {
          await idbSet(key, JSON.parse(raw));
        }
      } catch (error) {
        console.warn(`Failed to migrate legacy data for ${key}:`, error);
      }
    }
  })();

  return migrationPromise;
};

// IndexedDB is the primary, durable store (survives tablet restarts far more
// reliably than localStorage — see requestPersistentStorage in utils/db.ts).
// Every write is mirrored to localStorage too, as a synchronous-friendly
// second copy in case IndexedDB is ever unavailable.
const readValue = async <T>(key: string): Promise<T | null> => {
  await migrateLegacyLocalStorage();

  try {
    const fromIdb = await idbGet<T>(key);
    if (fromIdb !== undefined) return fromIdb;
  } catch (error) {
    console.warn(`Failed to read ${key} from IndexedDB:`, error);
  }

  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Failed to read ${key} from localStorage:`, error);
  }

  return null;
};

const deleteValue = async (key: string): Promise<void> => {
  try {
    await idbDelete(key);
  } catch (error) {
    console.warn(`Failed to delete ${key} from IndexedDB:`, error);
  }
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to delete ${key} from localStorage:`, error);
  }
};

// Atomic read-modify-write, used for anything that can be updated from more
// than one place in quick succession (e.g. answers + timer ticking in the
// same second). Returning undefined from `mutate` skips the write.
const updateValue = async <T>(
  key: string,
  mutate: (current: T | undefined) => T | undefined
): Promise<T | undefined> => {
  await migrateLegacyLocalStorage();

  let next: T | undefined;
  try {
    next = await idbAtomicUpdate<T>(key, mutate);
  } catch (error) {
    console.warn(`Failed to update ${key} in IndexedDB:`, error);
    const current = await readValue<T>(key);
    next = mutate(current ?? undefined);
  }

  if (next !== undefined) {
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch (error) {
      console.warn(`Failed to mirror ${key} to localStorage:`, error);
    }
  }

  return next;
};

export const sessionStorageUtils = {
  // Callers like the top-level App auto-save effect only track appState/
  // questions/settings and don't pass userAnswers/time at all — merge (via
  // an atomic update) rather than overwrite, so that write can't race with
  // updateUserAnswers/updateTime or a session restore and silently wipe them.
  saveSession: async (data: Omit<QuizSessionData, 'timestamp'>): Promise<void> => {
    try {
      await updateValue<QuizSessionData>(SESSION_KEY, (current) => {
        const sessionData: QuizSessionData = {
          ...data,
          timestamp: Date.now(),
        };
        if (!('userAnswers' in data) && current?.userAnswers !== undefined) {
          sessionData.userAnswers = current.userAnswers;
        }
        if (!('time' in data) && current?.time !== undefined) {
          sessionData.time = current.time;
        }
        return sessionData;
      });
    } catch (error) {
      console.warn('Failed to save session data:', error);
    }
  },

  loadSession: async (): Promise<QuizSessionData | null> => {
    try {
      const sessionData = await readValue<QuizSessionData>(SESSION_KEY);
      if (!sessionData) return null;

      // Check if session has expired (older than 30 days)
      if (Date.now() - sessionData.timestamp > SESSION_DURATION) {
        await sessionStorageUtils.clearSession();
        return null;
      }

      return sessionData;
    } catch (error) {
      console.warn('Failed to load session data:', error);
      await sessionStorageUtils.clearSession();
      return null;
    }
  },

  clearSession: async (): Promise<void> => {
    try {
      await deleteValue(SESSION_KEY);
    } catch (error) {
      console.warn('Failed to clear session data:', error);
    }
  },

  updateUserAnswers: async (userAnswers: Record<string, string>): Promise<void> => {
    try {
      await updateValue<QuizSessionData>(SESSION_KEY, (current) =>
        current ? { ...current, userAnswers, timestamp: Date.now() } : undefined
      );
    } catch (error) {
      console.warn('Failed to update user answers:', error);
    }
  },

  updateTime: async (time: number): Promise<void> => {
    try {
      await updateValue<QuizSessionData>(SESSION_KEY, (current) =>
        current ? { ...current, time, timestamp: Date.now() } : undefined
      );
    } catch (error) {
      console.warn('Failed to update time:', error);
    }
  },

  // Session History Management
  saveCompletedSession: async (
    questions: Question[],
    quizResults: QuizResults,
    settings: QuizSettings
  ): Promise<void> => {
    try {
      await updateValue<SessionHistory>(HISTORY_KEY, (current) => {
        const history: SessionHistory = current ?? { sessions: [], timestamp: Date.now() };

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
          isCompleted: true,
        };

        // Add new session at the beginning, keep only the last 100 sessions
        const sessions = [completedSession, ...history.sessions].slice(0, MAX_HISTORY_SESSIONS);

        return { sessions, timestamp: Date.now() };
      });
    } catch (error) {
      console.warn('Failed to save completed session:', error);
    }
  },

  saveIncompleteSession: async (
    questions: Question[],
    settings: QuizSettings,
    userAnswers: Record<string, string>,
    time: number,
    appState: AppState
  ): Promise<void> => {
    try {
      // Calculate current progress
      const answeredCount = Object.keys(userAnswers).filter(key => userAnswers[key] !== '').length;

      await updateValue<SessionHistory>(HISTORY_KEY, (current) => {
        const history: SessionHistory = current ?? { sessions: [], timestamp: Date.now() };

        const incompleteSession: CompletedSession = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          timeTaken: time,
          questionsAnswered: answeredCount,
          totalQuestions: questions.length,
          score: 0,
          settings,
          questions,
          quizResults: null,
          isCompleted: false,
          userAnswers,
          appState,
        };

        // Add new session at the beginning, keep only the last 100 sessions
        const sessions = [incompleteSession, ...history.sessions].slice(0, MAX_HISTORY_SESSIONS);

        return { sessions, timestamp: Date.now() };
      });
    } catch (error) {
      console.warn('Failed to save incomplete session:', error);
    }
  },

  loadHistory: async (): Promise<SessionHistory> => {
    try {
      const history = await readValue<SessionHistory>(HISTORY_KEY);
      if (!history) {
        return { sessions: [], timestamp: Date.now() };
      }

      // Check if history has expired (older than 1 year)
      if (Date.now() - history.timestamp > HISTORY_DURATION) {
        await sessionStorageUtils.clearHistory();
        return { sessions: [], timestamp: Date.now() };
      }

      // Filter out expired sessions (older than 1 year)
      const sessions = history.sessions.filter(
        (session) => Date.now() - session.timestamp <= HISTORY_DURATION
      );

      return { ...history, sessions };
    } catch (error) {
      console.warn('Failed to load session history:', error);
      return { sessions: [], timestamp: Date.now() };
    }
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    try {
      await updateValue<SessionHistory>(HISTORY_KEY, (current) => {
        const history: SessionHistory = current ?? { sessions: [], timestamp: Date.now() };
        return {
          sessions: history.sessions.filter((s) => s.id !== sessionId),
          timestamp: Date.now(),
        };
      });
    } catch (error) {
      console.warn('Failed to delete session:', error);
    }
  },

  clearHistory: async (): Promise<void> => {
    try {
      await deleteValue(HISTORY_KEY);
    } catch (error) {
      console.warn('Failed to clear session history:', error);
    }
  },

  loadSessionById: async (sessionId: string): Promise<CompletedSession | null> => {
    try {
      const history = await sessionStorageUtils.loadHistory();
      return history.sessions.find((s) => s.id === sessionId) || null;
    } catch (error) {
      console.warn('Failed to load session by ID:', error);
      return null;
    }
  },
};
