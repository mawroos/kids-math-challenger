export enum Operation {
  Addition = 'addition',
  Subtraction = 'subtraction',
  Multiplication = 'multiplication',
  Division = 'division',
}

export interface QuizSettings {
  lowerBound1: number;
  upperBound1: number;
  lowerBound2: number;
  upperBound2: number;
  operations: Operation[];
  numQuestions: number;
  soundEnabled?: boolean;
}

export interface Question {
  id: number;
  text: string;
  correctAnswer: number;
}

export interface QuizResults {
  score: number;
  total: number;
  time: number;
}

export enum AppState {
    SETUP,
    QUIZ,
    RESULTS
}