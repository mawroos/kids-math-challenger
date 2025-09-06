import { Question, QuizSettings, Operation } from '../types';

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Finds all integer factors of a given number.
 * @param num The number to factorize.
 * @returns An array of unique factors.
 */
function getFactors(num: number): number[] {
    const factors = new Set<number>();
    if (num === 0) return [0];
    const limit = Math.sqrt(Math.abs(num));
    for (let i = 1; i <= limit; i++) {
        if (num % i === 0) {
            factors.add(i);
            factors.add(num / i);
        }
    }
    return Array.from(factors);
}

export function generateQuestions(settings: QuizSettings): Question[] {
  const { lowerBound1, upperBound1, lowerBound2, upperBound2, operations, numQuestions } = settings;
  const questions: Question[] = [];

  for (let i = 0; i < numQuestions; i++) {
    const operation = operations[getRandomInt(0, operations.length - 1)];
    let text = '';
    let correctAnswer = 0;

    let num1 = getRandomInt(lowerBound1, upperBound1);
    let num2 = getRandomInt(lowerBound2, upperBound2);

    switch (operation) {
      case Operation.Addition:
        text = `${num1} + ${num2} = ?`;
        correctAnswer = num1 + num2;
        break;
      case Operation.Subtraction:
        text = `${num1} - ${num2} = ?`;
        correctAnswer = num1 - num2;
        break;
      case Operation.Multiplication:
        text = `${num1} × ${num2} = ?`;
        correctAnswer = num1 * num2;
        break;
      case Operation.Division: {
        let dividend: number;
        let divisor: number;
        
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loops for tricky ranges

        while (attempts < maxAttempts) {
            dividend = getRandomInt(lowerBound1, upperBound1);
            
            // Skip 0 as a dividend for typical quiz questions.
            if (dividend === 0) {
                attempts++;
                continue;
            }

            const allFactors = getFactors(dividend);
            
            const validDivisors = allFactors.filter(f => f >= lowerBound2 && f <= upperBound2);
            
            // Prefer divisors that aren't 1 or the number itself, for a better challenge.
            const nonTrivialDivisors = validDivisors.filter(d => d !== 1 && d !== dividend);

            if (nonTrivialDivisors.length > 0) {
                divisor = nonTrivialDivisors[getRandomInt(0, nonTrivialDivisors.length - 1)];
                text = `${dividend} ÷ ${divisor} = ?`;
                correctAnswer = dividend / divisor;
                break; // Found a good question
            } else if (validDivisors.length > 0) {
                // If only trivial divisors are available (e.g., for prime numbers), use one.
                divisor = validDivisors[getRandomInt(0, validDivisors.length - 1)];
                text = `${dividend} ÷ ${divisor} = ?`;
                correctAnswer = dividend / divisor;
                break; // Found an acceptable question
            }
            
            attempts++;
        }

        // Fallback if the loop couldn't find a suitable division problem.
        if (!text) {
          divisor = getRandomInt(lowerBound2 === 0 ? 1 : lowerBound2, upperBound2);
          dividend = divisor;
          text = `${dividend} ÷ ${divisor} = ?`;
          correctAnswer = 1;
        }
        break;
      }
    }
    
    questions.push({ id: i, text, correctAnswer });
  }

  return questions;
}