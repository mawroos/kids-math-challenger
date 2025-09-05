
export enum Operation {
  Addition = 'addition',
  Subtraction = 'subtraction',
  Multiplication = 'multiplication',
  Division = 'division',
}

export interface QuizSettings {
  lowerBound: number;
  upperBound: number;
  operations: Operation[];
  numQuestions: number;
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
