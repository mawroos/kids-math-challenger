
import { Question, QuizSettings, Operation } from '../types';

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateQuestions(settings: QuizSettings): Question[] {
  const { lowerBound, upperBound, operations, numQuestions } = settings;
  const questions: Question[] = [];

  for (let i = 0; i < numQuestions; i++) {
    const operation = operations[getRandomInt(0, operations.length - 1)];
    let text = '';
    let correctAnswer = 0;

    let num1 = getRandomInt(lowerBound, upperBound);
    let num2 = getRandomInt(lowerBound, upperBound);

    switch (operation) {
      case Operation.Addition:
        text = `${num1} + ${num2} = ?`;
        correctAnswer = num1 + num2;
        break;
      case Operation.Subtraction:
        if (num1 < num2) {
          [num1, num2] = [num2, num1]; // Ensure result is non-negative
        }
        text = `${num1} - ${num2} = ?`;
        correctAnswer = num1 - num2;
        break;
      case Operation.Multiplication:
        text = `${num1} × ${num2} = ?`;
        correctAnswer = num1 * num2;
        break;
      case Operation.Division:
        // To ensure integer answers, generate the answer first
        const divisor = getRandomInt(lowerBound === 0 ? 1 : lowerBound, upperBound); // Avoid division by zero
        const quotient = getRandomInt(lowerBound, upperBound);
        const dividend = divisor * quotient;
        text = `${dividend} ÷ ${divisor} = ?`;
        correctAnswer = quotient;
        break;
    }
    
    questions.push({ id: i, text, correctAnswer });
  }

  return questions;
}
