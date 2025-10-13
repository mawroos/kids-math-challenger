import React, { useState, useEffect } from 'react';
import { sessionStorageUtils } from '../utils/sessionStorage';
import { QuizSettings, Operation } from '../types';

interface CompletedSession {
  id: string;
  timestamp: number;
  timeTaken: number;
  questionsAnswered: number;
  totalQuestions: number;
  score: number;
  settings: QuizSettings;
  isCompleted: boolean;
}

interface SessionHistoryProps {
  onLoadSession: (sessionId: string) => void;
  onClose: () => void;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ onLoadSession, onClose }) => {
  const [sessions, setSessions] = useState<CompletedSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    const history = sessionStorageUtils.loadHistory();
    setSessions(history.sessions);
  }, []);

  const handleDelete = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this session?')) {
      sessionStorageUtils.deleteSession(sessionId);
      const history = sessionStorageUtils.loadHistory();
      setSessions(history.sessions);
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all session history?')) {
      sessionStorageUtils.clearHistory();
      setSessions([]);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  const getOperationLabel = (op: Operation): string => {
    const labels: Record<Operation, string> = {
      [Operation.Addition]: 'Add',
      [Operation.Subtraction]: 'Sub',
      [Operation.Multiplication]: 'Mult',
      [Operation.Division]: 'Div',
      [Operation.FractionEquivalents]: 'Frac Equiv',
      [Operation.FractionAddition]: 'Frac +',
      [Operation.FractionMultiplication]: 'Frac ×',
      [Operation.FractionDivision]: 'Frac ÷',
      [Operation.GroupingToTarget]: 'Grouping',
      [Operation.GroupingByTensHundreds]: '10s/100s',
    };
    return labels[op] || op;
  };

  const getScoreColor = (score: number, total: number): string => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-700 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-sky-400">Session History</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <p className="text-lg mb-2">No previous sessions found</p>
              <p className="text-sm">Complete a quiz to see your history here!</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-slate-400">
                {sessions.length} session{sessions.length !== 1 ? 's' : ''} saved
              </p>
              <button
                onClick={handleClearAll}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All History
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`bg-slate-700/50 rounded-lg p-4 cursor-pointer transition-all duration-200 border-2 ${
                    selectedSession === session.id
                      ? 'border-sky-500 bg-slate-700'
                      : 'border-transparent hover:border-slate-600 hover:bg-slate-700/70'
                  }`}
                  onClick={() => setSelectedSession(session.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-slate-300 font-semibold">
                          {formatDate(session.timestamp)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(session.timestamp).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        {session.isCompleted ? (
                          <span className={`font-bold ${getScoreColor(session.score, session.totalQuestions)}`}>
                            Score: {session.score}/{session.totalQuestions} ({Math.round((session.score / session.totalQuestions) * 100)}%)
                          </span>
                        ) : (
                          <span className="font-bold text-yellow-400">
                            In Progress
                          </span>
                        )}
                        <span className="text-slate-400">
                          ⏱️ {formatTime(session.timeTaken)}
                        </span>
                        <span className="text-slate-400">
                          📝 {session.questionsAnswered}/{session.totalQuestions} questions
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => handleDelete(session.id, e)}
                      className="text-red-400 hover:text-red-300 transition-colors ml-2"
                      title="Delete session"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="border-t border-slate-600 pt-2 mt-2">
                    <div className="text-xs text-slate-400">
                      <div className="mb-1">
                        <span className="font-semibold">Operations:</span>{' '}
                        {session.settings.operations.map(getOperationLabel).join(', ')}
                      </div>
                      {!session.settings.customMode && (
                        <div>
                          <span className="font-semibold">Ranges:</span>{' '}
                          {session.settings.lowerBound1}-{session.settings.upperBound1},{' '}
                          {session.settings.lowerBound2}-{session.settings.upperBound2}
                        </div>
                      )}
                      {session.settings.customMode && (
                        <div>
                          <span className="font-semibold">Mode:</span> Custom ranges per operation
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedSession && onLoadSession(selectedSession)}
                disabled={!selectedSession}
                className={`flex-1 font-medium py-3 px-4 rounded-lg transition-colors duration-200 ${
                  selectedSession
                    ? 'bg-sky-600 hover:bg-sky-700 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {selectedSession && sessions.find(s => s.id === selectedSession)?.isCompleted 
                  ? 'Review Selected Session' 
                  : 'Continue Session'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SessionHistory;
