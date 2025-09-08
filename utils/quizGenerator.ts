import { Question, QuizSettings, Operation } from '../types';

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Finds the greatest common divisor of two numbers
 */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Simplifies a fraction to its lowest terms
 */
function simplifyFraction(numerator: number, denominator: number): { numerator: number; denominator: number } {
  const divisor = gcd(Math.abs(numerator), Math.abs(denominator));
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor
  };
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
        // To prevent negative results, ensure the first number is the largest.
        if (num1 < num2) {
          [num1, num2] = [num2, num1]; // Simple swap
        }
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
      case Operation.EquivalentFractions: {
        // Generate a simple fraction
        const baseDenominator = getRandomInt(Math.max(2, lowerBound2), Math.min(12, upperBound2)); // Keep denominators reasonable
        const baseNumerator = getRandomInt(1, baseDenominator - 1); // Ensure proper fraction
        
        // Simplify the base fraction
        const simplified = simplifyFraction(baseNumerator, baseDenominator);
        
        // Generate a multiplier to create equivalent fraction
        const multiplier = getRandomInt(2, Math.min(6, Math.max(2, upperBound1))); // Keep multipliers reasonable
        
        const equivalentNumerator = simplified.numerator * multiplier;
        const equivalentDenominator = simplified.denominator * multiplier;
        
        // Randomly choose which fraction to show and which to ask for
        if (getRandomInt(0, 1) === 0) {
          // Show simplified, ask for equivalent
          text = `\\frac{${simplified.numerator}}{${simplified.denominator}} = \\frac{?}{${equivalentDenominator}}`;
          correctAnswer = equivalentNumerator;
        } else {
          // Show equivalent, ask for simplified
          text = `\\frac{${equivalentNumerator}}{${equivalentDenominator}} = \\frac{${simplified.numerator}}{?}`;
          correctAnswer = simplified.denominator;
        }
        break;
      }
    }
    
    questions.push({ id: i, text, correctAnswer });
  }

  return questions;
}
