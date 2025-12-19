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
  const { lowerBound1, upperBound1, lowerBound2, upperBound2, operations, numQuestions, customMode, operationRanges } = settings;
  const questions: Question[] = [];

  for (let i = 0; i < numQuestions; i++) {
    const operation = operations[getRandomInt(0, operations.length - 1)];
    let text = '';
    let correctAnswer = 0;

    // Get ranges for this operation
    let currentLowerBound1, currentUpperBound1, currentLowerBound2, currentUpperBound2;
    
    if (customMode && operationRanges && operationRanges[operation]) {
      const ranges = operationRanges[operation]!;
      currentLowerBound1 = ranges.lowerBound1;
      currentUpperBound1 = ranges.upperBound1;
      currentLowerBound2 = ranges.lowerBound2;
      currentUpperBound2 = ranges.upperBound2;
    } else {
      currentLowerBound1 = lowerBound1;
      currentUpperBound1 = upperBound1;
      currentLowerBound2 = lowerBound2;
      currentUpperBound2 = upperBound2;
    }

    let num1 = getRandomInt(currentLowerBound1, currentUpperBound1);
    let num2 = getRandomInt(currentLowerBound2, currentUpperBound2);

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
            dividend = getRandomInt(currentLowerBound1, currentUpperBound1);
            
            // Skip 0 as a dividend for typical quiz questions.
            if (dividend === 0) {
                attempts++;
                continue;
            }

            const allFactors = getFactors(dividend);
            
            const validDivisors = allFactors.filter(f => f >= currentLowerBound2 && f <= currentUpperBound2);
            
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
          divisor = getRandomInt(currentLowerBound2 === 0 ? 1 : currentLowerBound2, currentUpperBound2);
          dividend = divisor;
          text = `${dividend} ÷ ${divisor} = ?`;
          correctAnswer = 1;
        }
        break;
      }
      case Operation.FractionEquivalents: {
        // Generate a simple fraction
        const baseDenominator = getRandomInt(Math.max(2, currentLowerBound2), Math.min(12, currentUpperBound2)); // Keep denominators reasonable
        const baseNumerator = getRandomInt(1, baseDenominator - 1); // Ensure proper fraction
        
        // Simplify the base fraction
        const simplified = simplifyFraction(baseNumerator, baseDenominator);
        
        // Generate a multiplier to create equivalent fraction
        const multiplier = getRandomInt(2, Math.min(6, Math.max(2, currentUpperBound1))); // Keep multipliers reasonable
        
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
      case Operation.FractionAddition: {
        // Generate two fractions with same denominator for addition
        const denominator = getRandomInt(Math.max(2, currentLowerBound2), Math.min(12, currentUpperBound2));
        const numerator1 = getRandomInt(1, Math.min(currentUpperBound1, denominator - 1));
        const numerator2 = getRandomInt(1, Math.min(currentUpperBound1, denominator - numerator1 - 1)); // Ensure sum < denominator
        
        const sumNumerator = numerator1 + numerator2;
        
        text = `\\frac{${numerator1}}{${denominator}} + \\frac{${numerator2}}{${denominator}} = \\frac{?}{${denominator}}`;
        correctAnswer = sumNumerator;
        break;
      }
      case Operation.FractionMultiplication: {
        // Generate two simple fractions for multiplication
        const denom1 = getRandomInt(Math.max(2, currentLowerBound2), Math.min(8, currentUpperBound2));
        const denom2 = getRandomInt(Math.max(2, currentLowerBound2), Math.min(8, currentUpperBound2));
        const num1 = getRandomInt(1, Math.min(currentUpperBound1, denom1 - 1));
        const num2 = getRandomInt(1, Math.min(currentUpperBound1, denom2 - 1));
        
        const resultNum = num1 * num2;
        const resultDenom = denom1 * denom2;
        
        // Simplify the result
        const simplified = simplifyFraction(resultNum, resultDenom);
        
        // Randomly ask for numerator or denominator of the simplified result
        if (getRandomInt(0, 1) === 0) {
          text = `\\frac{${num1}}{${denom1}} \\times \\frac{${num2}}{${denom2}} = \\frac{?}{${simplified.denominator}}`;
          correctAnswer = simplified.numerator;
        } else {
          text = `\\frac{${num1}}{${denom1}} \\times \\frac{${num2}}{${denom2}} = \\frac{${simplified.numerator}}{?}`;
          correctAnswer = simplified.denominator;
        }
        break;
      }
      case Operation.FractionDivision: {
        // Generate division of fractions (a/b ÷ c/d = a/b × d/c)
        const denom1 = getRandomInt(Math.max(2, currentLowerBound2), Math.min(8, currentUpperBound2));
        const denom2 = getRandomInt(Math.max(2, currentLowerBound2), Math.min(8, currentUpperBound2));
        const num1 = getRandomInt(1, Math.min(currentUpperBound1, denom1 - 1));
        const num2 = getRandomInt(1, Math.min(currentUpperBound1, denom2 - 1));
        
        // Result of division: (num1/denom1) ÷ (num2/denom2) = (num1 × denom2) / (denom1 × num2)
        const resultNum = num1 * denom2;
        const resultDenom = denom1 * num2;
        
        // Simplify the result
        const simplified = simplifyFraction(resultNum, resultDenom);
        
        // Randomly ask for numerator or denominator of the simplified result
        if (getRandomInt(0, 1) === 0) {
          text = `\\frac{${num1}}{${denom1}} \\div \\frac{${num2}}{${denom2}} = \\frac{?}{${simplified.denominator}}`;
          correctAnswer = simplified.numerator;
        } else {
          text = `\\frac{${num1}}{${denom1}} \\div \\frac{${num2}}{${denom2}} = \\frac{${simplified.numerator}}{?}`;
          correctAnswer = simplified.denominator;
        }
        break;
      }
      case Operation.GroupingToTarget: {
        // Use currentLowerBound1 and currentUpperBound1 for target values (like 100, 1000)
        // Use currentLowerBound2 and currentUpperBound2 for the known number range
        
        const targetValues = [];
        for (let target = currentLowerBound1; target <= currentUpperBound1; target += 
             (target < 100 ? 10 : target < 1000 ? 100 : 1000)) {
          if (target % 10 === 0) targetValues.push(target); // Only round targets
        }
        
        const target = targetValues[getRandomInt(0, targetValues.length - 1)] || 100;
        const knownNumber = getRandomInt(currentLowerBound2, Math.min(currentUpperBound2, target - 1));
        
        // Randomly choose between addition to target or subtraction from target
        if (getRandomInt(0, 1) === 0) {
          // Addition to target: knownNumber + ? = target
          text = `${knownNumber} + ? = ${target}`;
          correctAnswer = target - knownNumber;
        } else {
          // Subtraction from target: target - ? = knownNumber
          text = `${target} - ? = ${knownNumber}`;
          correctAnswer = target - knownNumber;
        }
        break;
      }
      case Operation.GroupingByTensHundreds: {
        // Create questions with multiples of 10s and 100s to reach 100 or 1000
        // Examples: 20 + ? = 100, 300 + ? = 1000
        
        // Define target values (100 and 1000)
        const targets = [100, 1000];
        const target = targets[getRandomInt(0, targets.length - 1)];
        
        let knownNumber;
        if (target === 100) {
          // For target 100, use multiples of 10 from 10 to 90
          const multiplier = getRandomInt(1, 9); // 1-9 to get 10-90
          knownNumber = multiplier * 10;
        } else {
          // For target 1000, use multiples of 100 from 100 to 900
          const multiplier = getRandomInt(1, 9); // 1-9 to get 100-900
          knownNumber = multiplier * 100;
        }
        
        // Randomly choose between addition to target or subtraction from target
        if (getRandomInt(0, 1) === 0) {
          // Addition to target: knownNumber + ? = target
          text = `${knownNumber} + ? = ${target}`;
          correctAnswer = target - knownNumber;
        } else {
          // Subtraction from target: target - ? = knownNumber
          text = `${target} - ? = ${knownNumber}`;
          correctAnswer = target - knownNumber;
        }
        break;
      }
      case Operation.DecimalAddition: {
        // Decimal addition with tenths and hundredths
        // Generate random decimal numbers
        const decimalPlaces = getRandomInt(1, 2); // 1 for tenths, 2 for hundredths
        const multiplier = decimalPlaces === 1 ? 10 : 100;
        
        // Generate numbers in the range and convert to decimals
        const intNum1 = getRandomInt(currentLowerBound1 * multiplier, currentUpperBound1 * multiplier);
        const intNum2 = getRandomInt(currentLowerBound2 * multiplier, currentUpperBound2 * multiplier);
        
        const decNum1 = intNum1 / multiplier;
        const decNum2 = intNum2 / multiplier;
        const sum = Math.round((decNum1 + decNum2) * multiplier) / multiplier;
        
        text = `${decNum1.toFixed(decimalPlaces)} + ${decNum2.toFixed(decimalPlaces)} = ?`;
        correctAnswer = sum;
        break;
      }
      case Operation.DecimalSubtraction: {
        // Decimal subtraction with tenths and hundredths
        const decimalPlaces = getRandomInt(1, 2); // 1 for tenths, 2 for hundredths
        const multiplier = decimalPlaces === 1 ? 10 : 100;
        
        // Generate numbers and ensure first is larger
        let intNum1 = getRandomInt(currentLowerBound1 * multiplier, currentUpperBound1 * multiplier);
        let intNum2 = getRandomInt(currentLowerBound2 * multiplier, currentUpperBound2 * multiplier);
        
        if (intNum1 < intNum2) {
          [intNum1, intNum2] = [intNum2, intNum1];
        }
        
        const decNum1 = intNum1 / multiplier;
        const decNum2 = intNum2 / multiplier;
        const diff = Math.round((decNum1 - decNum2) * multiplier) / multiplier;
        
        text = `${decNum1.toFixed(decimalPlaces)} - ${decNum2.toFixed(decimalPlaces)} = ?`;
        correctAnswer = diff;
        break;
      }
      case Operation.DecimalRepresentation: {
        // Convert between decimal and fraction representation for tenths and hundredths
        const isTenths = getRandomInt(0, 1) === 0;
        const denominator = isTenths ? 10 : 100;
        const maxNumerator = isTenths ? 9 : 99;
        
        const numerator = getRandomInt(1, maxNumerator);
        const decimalValue = numerator / denominator;
        
        // Randomly choose direction: decimal to fraction or fraction to decimal
        if (getRandomInt(0, 1) === 0) {
          // Ask for the numerator given the decimal
          text = `${decimalValue.toFixed(isTenths ? 1 : 2)} = \\frac{?}{${denominator}}`;
          correctAnswer = numerator;
        } else {
          // Simpler question: show decimal, ask what goes over denominator
          text = `\\text{What numerator makes } \\frac{?}{${denominator}} = ${decimalValue.toFixed(isTenths ? 1 : 2)}`;
          correctAnswer = numerator;
        }
        break;
      }
      case Operation.FractionToOne: {
        // Add/subtract fractions with same denominators to make 1 whole
        // e.g., 3/5 + ?/5 = 1
        const denominator = getRandomInt(Math.max(2, currentLowerBound2), Math.min(12, currentUpperBound2));
        const knownNumerator = getRandomInt(1, denominator - 1);
        const missingNumerator = denominator - knownNumerator;
        
        // Randomly choose between addition and subtraction format
        if (getRandomInt(0, 1) === 0) {
          // Addition format: known + ? = 1
          text = `\\frac{${knownNumerator}}{${denominator}} + \\frac{?}{${denominator}} = 1`;
          correctAnswer = missingNumerator;
        } else {
          // Subtraction format: 1 - known = ?
          text = `1 - \\frac{${knownNumerator}}{${denominator}} = \\frac{?}{${denominator}}`;
          correctAnswer = missingNumerator;
        }
        break;
      }
    }
    
    questions.push({ id: i, text, correctAnswer });
  }

  return questions;
}
