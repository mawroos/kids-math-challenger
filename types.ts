export enum Operation {
  Addition = 'addition',
  Subtraction = 'subtraction',
  Multiplication = 'multiplication',
  Division = 'division',
  FractionEquivalents = 'fraction-equivalents',
  FractionAddition = 'fraction-addition',
  FractionMultiplication = 'fraction-multiplication',
  FractionDivision = 'fraction-division',
  GroupingToTarget = 'grouping-to-target',
  GroupingByTensHundreds = 'grouping-by-tens-hundreds',
  DecimalAddition = 'decimal-addition',
  DecimalSubtraction = 'decimal-subtraction',
  DecimalRepresentation = 'decimal-representation',
  FractionToOne = 'fraction-to-one',
}

export interface OperationRanges {
  [Operation.Addition]: { lowerBound1: number; upperBound1: number; lowerBound2: number; upperBound2: number; };
  [Operation.Subtraction]: { lowerBound1: number; upperBound1: number; lowerBound2: number; upperBound2: number; };
  [Operation.Multiplication]: { lowerBound1: number; upperBound1: number; lowerBound2: number; upperBound2: number; };
  [Operation.Division]: { lowerBound1: number; upperBound1: number; lowerBound2: number; upperBound2: number; };
  [Operation.FractionEquivalents]: { lowerBound1: number; upperBound1: number; lowerBound2: number; upperBound2: number; };
  [Operation.FractionAddition]: { lowerBound1: number; upperBound1: number; lowerBound2: number; upperBound2: number; };
  [Operation.FractionMultiplication]: { lowerBound1: number; upperBound1: number; lowerBound2: number; upperBound2: number; };
  [Operation.FractionDivision]: { lowerBound1: number; upperBound1: number; lowerBound2: number; upperBound2: number; };
  [Operation.GroupingToTarget]: { lowerBound1: number; upperBound1: number; lowerBound2: number; upperBound2: number; };
  [Operation.GroupingByTensHundreds]: { lowerBound1: number; upperBound1: number; lowerBound2: number; upperBound2: number; };
  [Operation.DecimalAddition]: { lowerBound1: number; upperBound1: number; lowerBound2: number; upperBound2: number; };
  [Operation.DecimalSubtraction]: { lowerBound1: number; upperBound1: number; lowerBound2: number; upperBound2: number; };
  [Operation.DecimalRepresentation]: { lowerBound1: number; upperBound1: number; lowerBound2: number; upperBound2: number; };
  [Operation.FractionToOne]: { lowerBound1: number; upperBound1: number; lowerBound2: number; upperBound2: number; };
}

export interface QuizSettings {
  lowerBound1: number;
  upperBound1: number;
  lowerBound2: number;
  upperBound2: number;
  operations: Operation[];
  numQuestions: number;
  soundEnabled?: boolean;
  customMode?: boolean;
  operationRanges?: Partial<OperationRanges>;
}

export interface Question {
  id: number;
  text: string;
  correctAnswer: number;
  answerType?: 'number' | 'fraction';
  fractionAnswer?: {
    numerator: number;
    denominator: number;
  };
}

export interface QuizResults {
  score: number;
  total: number;
  time: number;
}

export enum AppState {
    SETUP,
    QUIZ,
    RESULTS,
    WRITING_CHALLENGE,
    WRITING_RESULTS
}

export enum ChallengeType {
  MATH = 'math',
  WRITING = 'writing'
}

export interface WritingChallengeSettings {
  schoolYear: number;
  challengeType: 'poem';
}

export interface WritingChallengeResult {
  prompt: string;
  userResponse: string;
  assessment: {
    score: number; // 1-10
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
  timestamp: number;
}