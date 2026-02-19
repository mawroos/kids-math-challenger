import { ProblemSolvingQuestion, ProblemSolvingSettings, ProblemType } from '../types';

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundToNearest(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest;
}

function generateDistractors(correctAnswer: number, isDecimal: boolean = false): [number, number, number] {
  const distractors = new Set<number>();

  const offsets = isDecimal
    ? [0.05, 0.10, 0.15, 0.20, 0.50, 1.00, 0.01, 0.25]
    : [1, 2, 5, 10, 50, 100, 11, 20, 9, 15];

  let attempts = 0;
  while (distractors.size < 3 && attempts < 50) {
    const offset = offsets[getRandomInt(0, offsets.length - 1)];
    const sign = getRandomInt(0, 1) === 0 ? 1 : -1;
    let distractor: number;

    if (isDecimal) {
      distractor = Math.round((correctAnswer + sign * offset) * 100) / 100;
    } else {
      distractor = correctAnswer + sign * offset;
    }

    if (distractor !== correctAnswer && distractor > 0 && !distractors.has(distractor)) {
      distractors.add(distractor);
    }
    attempts++;
  }

  // Fallback if we couldn't generate enough
  while (distractors.size < 3) {
    const fallback = isDecimal
      ? Math.round((correctAnswer + (distractors.size + 1) * 0.5) * 100) / 100
      : correctAnswer + (distractors.size + 1) * 10;
    if (!distractors.has(fallback) && fallback !== correctAnswer && fallback > 0) {
      distractors.add(fallback);
    } else {
      distractors.add(correctAnswer + (distractors.size + 1) * 100 + 1);
    }
  }

  return Array.from(distractors).slice(0, 3) as [number, number, number];
}

interface WordProblemTemplate {
  generate: (difficulty: 1 | 2 | 3) => {
    questionText: string;
    correctAnswer: number;
    hintText: string;
    stepByStep: string[];
  };
}

const wordProblemTemplates: WordProblemTemplate[] = [
  {
    // Shop inventory pattern
    generate: (difficulty) => {
      const base = difficulty === 1 ? getRandomInt(1000, 5000)
        : difficulty === 2 ? getRandomInt(5000, 20000)
        : getRandomInt(20000, 80000);
      const sold = getRandomInt(Math.floor(base * 0.1), Math.floor(base * 0.4));
      const received = getRandomInt(100, Math.floor(base * 0.3));
      const answer = base - sold + received;

      return {
        questionText: `A shop has ${base.toLocaleString()} items in stock. They sell ${sold.toLocaleString()} items, then receive a delivery of ${received.toLocaleString()} items. How many items do they have now?`,
        correctAnswer: answer,
        hintText: 'Start with the original amount, subtract what was sold, then add what was received.',
        stepByStep: [
          `Start with ${base.toLocaleString()} items`,
          `Subtract ${sold.toLocaleString()} items sold: ${base.toLocaleString()} - ${sold.toLocaleString()} = ${(base - sold).toLocaleString()}`,
          `Add ${received.toLocaleString()} items received: ${(base - sold).toLocaleString()} + ${received.toLocaleString()} = ${answer.toLocaleString()}`,
          `Answer: ${answer.toLocaleString()} items`
        ]
      };
    }
  },
  {
    // School students pattern
    generate: (difficulty) => {
      const total = difficulty === 1 ? getRandomInt(1000, 3000)
        : difficulty === 2 ? getRandomInt(3000, 15000)
        : getRandomInt(15000, 50000);
      const left = getRandomInt(Math.floor(total * 0.05), Math.floor(total * 0.2));
      const joined = getRandomInt(Math.floor(total * 0.02), Math.floor(total * 0.15));
      const answer = total - left + joined;

      return {
        questionText: `A school has ${total.toLocaleString()} students. At the end of the year, ${left.toLocaleString()} students leave and ${joined.toLocaleString()} new students join. How many students are there now?`,
        correctAnswer: answer,
        hintText: 'Think about what happens step by step: first students leave (subtract), then new ones join (add).',
        stepByStep: [
          `Start with ${total.toLocaleString()} students`,
          `${left.toLocaleString()} students leave: ${total.toLocaleString()} - ${left.toLocaleString()} = ${(total - left).toLocaleString()}`,
          `${joined.toLocaleString()} students join: ${(total - left).toLocaleString()} + ${joined.toLocaleString()} = ${answer.toLocaleString()}`,
          `Answer: ${answer.toLocaleString()} students`
        ]
      };
    }
  },
  {
    // Distance/travel pattern
    generate: (difficulty) => {
      const leg1 = difficulty === 1 ? getRandomInt(1000, 5000)
        : difficulty === 2 ? getRandomInt(5000, 20000)
        : getRandomInt(20000, 50000);
      const leg2 = getRandomInt(Math.floor(leg1 * 0.3), Math.floor(leg1 * 0.8));
      const answer = leg1 + leg2;

      return {
        questionText: `A family drives ${leg1.toLocaleString()} metres in the morning and ${leg2.toLocaleString()} metres in the afternoon. What is the total distance they travelled?`,
        correctAnswer: answer,
        hintText: 'To find the total distance, add both distances together.',
        stepByStep: [
          `Morning distance: ${leg1.toLocaleString()} metres`,
          `Afternoon distance: ${leg2.toLocaleString()} metres`,
          `Total: ${leg1.toLocaleString()} + ${leg2.toLocaleString()} = ${answer.toLocaleString()} metres`,
          `Answer: ${answer.toLocaleString()} metres`
        ]
      };
    }
  },
  {
    // Fundraising pattern
    generate: (difficulty) => {
      const goal = difficulty === 1 ? roundToNearest(getRandomInt(2000, 5000), 100)
        : difficulty === 2 ? roundToNearest(getRandomInt(5000, 20000), 500)
        : roundToNearest(getRandomInt(20000, 80000), 1000);
      const raised = getRandomInt(Math.floor(goal * 0.3), Math.floor(goal * 0.7));
      const answer = goal - raised;

      return {
        questionText: `A charity needs to raise £${goal.toLocaleString()} for a new playground. So far they have raised £${raised.toLocaleString()}. How much more do they need to raise?`,
        correctAnswer: answer,
        hintText: 'Subtract the amount already raised from the total goal to find what is left.',
        stepByStep: [
          `Total goal: £${goal.toLocaleString()}`,
          `Already raised: £${raised.toLocaleString()}`,
          `Amount still needed: £${goal.toLocaleString()} - £${raised.toLocaleString()} = £${answer.toLocaleString()}`,
          `Answer: £${answer.toLocaleString()}`
        ]
      };
    }
  }
];

function generateWordProblem(difficulty: 1 | 2 | 3): Omit<ProblemSolvingQuestion, 'id'> {
  const template = wordProblemTemplates[getRandomInt(0, wordProblemTemplates.length - 1)];
  const result = template.generate(difficulty);

  return {
    ...result,
    difficultyLevel: difficulty,
    distractorAnswers: generateDistractors(result.correctAnswer),
    problemType: 'word-problem'
  };
}

function generateColumnCalculation(difficulty: 1 | 2 | 3): Omit<ProblemSolvingQuestion, 'id'> {
  const isAddition = getRandomInt(0, 1) === 0;

  let num1: number, num2: number;
  if (difficulty === 1) {
    num1 = getRandomInt(1000, 9999);
    num2 = getRandomInt(1000, 9999);
  } else if (difficulty === 2) {
    num1 = getRandomInt(10000, 50000);
    num2 = getRandomInt(5000, 30000);
  } else {
    num1 = getRandomInt(50000, 99999);
    num2 = getRandomInt(10000, 49999);
  }

  if (!isAddition && num1 < num2) {
    [num1, num2] = [num2, num1];
  }

  const answer = isAddition ? num1 + num2 : num1 - num2;
  const op = isAddition ? '+' : '-';
  const opWord = isAddition ? 'addition' : 'subtraction';

  // Build step-by-step for column method
  const steps: string[] = [];
  steps.push(`Write ${num1.toLocaleString()} ${op} ${num2.toLocaleString()} in columns, lining up the digits`);

  if (isAddition) {
    steps.push('Add each column from right to left');
    steps.push('If a column adds up to 10 or more, carry the 1 to the next column');
    steps.push(`${num1.toLocaleString()} + ${num2.toLocaleString()} = ${answer.toLocaleString()}`);
  } else {
    steps.push('Subtract each column from right to left');
    steps.push('If the top digit is smaller, borrow 1 from the next column');
    steps.push(`${num1.toLocaleString()} - ${num2.toLocaleString()} = ${answer.toLocaleString()}`);
  }
  steps.push(`Answer: ${answer.toLocaleString()}`);

  const hintText = isAddition
    ? 'Remember to carry the 1 over when a column adds up to 10 or more.'
    : 'If the top digit is smaller than the bottom, borrow 1 from the column to the left.';

  return {
    questionText: `${num1.toLocaleString()} ${op} ${num2.toLocaleString()} = ?`,
    difficultyLevel: difficulty,
    correctAnswer: answer,
    distractorAnswers: generateDistractors(answer),
    hintText,
    stepByStep: steps,
    problemType: 'column-calculation'
  };
}

function generateMoneyProblem(difficulty: 1 | 2 | 3): Omit<ProblemSolvingQuestion, 'id'> {
  const templates = [
    // Shopping change
    (diff: 1 | 2 | 3) => {
      const paid = diff === 1 ? getRandomInt(5, 20)
        : diff === 2 ? getRandomInt(20, 50)
        : getRandomInt(50, 100);
      const costPounds = getRandomInt(1, paid - 1);
      const costPence = getRandomInt(1, 99);
      const cost = costPounds + costPence / 100;
      const answer = Math.round((paid - cost) * 100) / 100;

      return {
        questionText: `You pay with a £${paid}.00 note. Your shopping costs £${cost.toFixed(2)}. How much change do you get?`,
        correctAnswer: answer,
        hintText: 'Subtract the cost from the amount you paid. Work with pounds and pence separately if it helps.',
        stepByStep: [
          `Amount paid: £${paid}.00`,
          `Cost: £${cost.toFixed(2)}`,
          `Change: £${paid}.00 - £${cost.toFixed(2)} = £${answer.toFixed(2)}`,
          `Answer: £${answer.toFixed(2)}`
        ]
      };
    },
    // Adding items
    (diff: 1 | 2 | 3) => {
      const item1Pounds = diff === 1 ? getRandomInt(1, 10)
        : diff === 2 ? getRandomInt(10, 30)
        : getRandomInt(20, 50);
      const item1Pence = getRandomInt(1, 99);
      const item2Pounds = diff === 1 ? getRandomInt(1, 10)
        : diff === 2 ? getRandomInt(5, 20)
        : getRandomInt(10, 40);
      const item2Pence = getRandomInt(1, 99);

      const item1 = item1Pounds + item1Pence / 100;
      const item2 = item2Pounds + item2Pence / 100;
      const answer = Math.round((item1 + item2) * 100) / 100;

      return {
        questionText: `A book costs £${item1.toFixed(2)} and a toy costs £${item2.toFixed(2)}. How much do they cost together?`,
        correctAnswer: answer,
        hintText: 'Add the pounds together, then add the pence. Remember: 100p = £1.',
        stepByStep: [
          `Book: £${item1.toFixed(2)}`,
          `Toy: £${item2.toFixed(2)}`,
          `Total: £${item1.toFixed(2)} + £${item2.toFixed(2)} = £${answer.toFixed(2)}`,
          `Answer: £${answer.toFixed(2)}`
        ]
      };
    },
    // Difference in price
    (diff: 1 | 2 | 3) => {
      let expensive: number, cheap: number;
      if (diff === 1) {
        expensive = getRandomInt(5, 15) + getRandomInt(1, 99) / 100;
        cheap = getRandomInt(1, 4) + getRandomInt(1, 99) / 100;
      } else if (diff === 2) {
        expensive = getRandomInt(15, 40) + getRandomInt(1, 99) / 100;
        cheap = getRandomInt(5, 14) + getRandomInt(1, 99) / 100;
      } else {
        expensive = getRandomInt(40, 80) + getRandomInt(1, 99) / 100;
        cheap = getRandomInt(10, 39) + getRandomInt(1, 99) / 100;
      }
      expensive = Math.round(expensive * 100) / 100;
      cheap = Math.round(cheap * 100) / 100;
      const answer = Math.round((expensive - cheap) * 100) / 100;

      return {
        questionText: `A jacket costs £${expensive.toFixed(2)} and a hat costs £${cheap.toFixed(2)}. How much more does the jacket cost than the hat?`,
        correctAnswer: answer,
        hintText: 'Find the difference by subtracting the cheaper item from the more expensive one.',
        stepByStep: [
          `Jacket: £${expensive.toFixed(2)}`,
          `Hat: £${cheap.toFixed(2)}`,
          `Difference: £${expensive.toFixed(2)} - £${cheap.toFixed(2)} = £${answer.toFixed(2)}`,
          `Answer: £${answer.toFixed(2)}`
        ]
      };
    }
  ];

  const template = templates[getRandomInt(0, templates.length - 1)];
  const result = template(difficulty);

  return {
    ...result,
    difficultyLevel: difficulty,
    distractorAnswers: generateDistractors(result.correctAnswer, true),
    problemType: 'money-problem'
  };
}

function generateMissingNumber(difficulty: 1 | 2 | 3): Omit<ProblemSolvingQuestion, 'id'> {
  const isAddition = getRandomInt(0, 1) === 0;

  let target: number, known: number;

  if (difficulty === 1) {
    target = roundToNearest(getRandomInt(2000, 10000), 500);
    known = getRandomInt(1000, target - 500);
  } else if (difficulty === 2) {
    target = roundToNearest(getRandomInt(10000, 50000), 1000);
    known = getRandomInt(2000, target - 1000);
  } else {
    target = roundToNearest(getRandomInt(50000, 100000), 5000);
    known = getRandomInt(5000, target - 2000);
  }

  const answer = target - known;

  let questionText: string;
  let hintText: string;
  let steps: string[];

  if (isAddition) {
    questionText = `${known.toLocaleString()} + [?] = ${target.toLocaleString()}`;
    hintText = 'To find the missing number, subtract the known number from the total.';
    steps = [
      `We need: ${known.toLocaleString()} + [?] = ${target.toLocaleString()}`,
      `Rearrange: [?] = ${target.toLocaleString()} - ${known.toLocaleString()}`,
      `Calculate: ${target.toLocaleString()} - ${known.toLocaleString()} = ${answer.toLocaleString()}`,
      `Answer: ${answer.toLocaleString()}`
    ];
  } else {
    questionText = `${target.toLocaleString()} - [?] = ${known.toLocaleString()}`;
    hintText = 'To find the missing number, subtract the result from the starting number.';
    steps = [
      `We need: ${target.toLocaleString()} - [?] = ${known.toLocaleString()}`,
      `Rearrange: [?] = ${target.toLocaleString()} - ${known.toLocaleString()}`,
      `Calculate: ${target.toLocaleString()} - ${known.toLocaleString()} = ${answer.toLocaleString()}`,
      `Answer: ${answer.toLocaleString()}`
    ];
  }

  return {
    questionText,
    difficultyLevel: difficulty,
    correctAnswer: answer,
    distractorAnswers: generateDistractors(answer),
    hintText,
    stepByStep: steps,
    problemType: 'missing-number'
  };
}

export function generateProblemSolvingQuestions(settings: ProblemSolvingSettings): ProblemSolvingQuestion[] {
  const { numQuestions, problemTypes } = settings;
  const questions: ProblemSolvingQuestion[] = [];

  for (let i = 0; i < numQuestions; i++) {
    const problemType = problemTypes[getRandomInt(0, problemTypes.length - 1)];
    const difficulty = (getRandomInt(1, 3)) as 1 | 2 | 3;

    let question: Omit<ProblemSolvingQuestion, 'id'>;

    switch (problemType) {
      case 'word-problem':
        question = generateWordProblem(difficulty);
        break;
      case 'column-calculation':
        question = generateColumnCalculation(difficulty);
        break;
      case 'money-problem':
        question = generateMoneyProblem(difficulty);
        break;
      case 'missing-number':
        question = generateMissingNumber(difficulty);
        break;
      default:
        question = generateWordProblem(difficulty);
    }

    questions.push({ id: i, ...question });
  }

  return questions;
}
