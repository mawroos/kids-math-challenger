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

// Randomized name/context pools for huge variety
const names = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Oliver', 'Sophia', 'James', 'Isabella', 'William',
  'Mia', 'Benjamin', 'Charlotte', 'Elijah', 'Amelia', 'Lucas', 'Harper', 'Mason', 'Evelyn', 'Logan',
  'Ella', 'Alexander', 'Grace', 'Ethan', 'Chloe', 'Jacob', 'Zoe', 'Michael', 'Lily', 'Daniel',
  'Hannah', 'Henry', 'Aria', 'Jack', 'Riley', 'Owen', 'Nora', 'Samuel', 'Layla', 'Ryan',
  'Kate', 'Nick', 'Ian', 'Andrew', 'Sarah', 'Tom', 'Ruby', 'Max', 'Poppy', 'Alfie'];

const businessNames = ['Lawn Care', 'Pet Sitting', 'Car Wash', 'Baking', 'Tutoring', 'Dog Walking',
  'Window Cleaning', 'Gardening', 'Painting', 'Photography', 'Catering', 'Delivery',
  'Craft Shop', 'Music Lessons', 'Bike Repair', 'House Cleaning', 'Snow Clearing',
  'Lemonade Stand', 'Babysitting', 'Book Club'];

const yearGroups = ['Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8'];

const schoolNames = ['Maple Primary', 'Oak Hill School', 'Riverside Academy', 'Sunnydale Primary',
  'Hillcrest School', 'Lakeside Academy', 'Greenwood Primary', 'Valley View School',
  'Parklands Primary', 'Harbour View School'];

const sportTeams = ['football team', 'cricket club', 'swimming squad', 'athletics team', 'netball team',
  'basketball club', 'hockey team', 'rugby squad', 'gymnastics club', 'tennis team'];

const eventNames = ['school fete', 'bake sale', 'charity run', 'raffle', 'car boot sale', 'quiz night',
  'talent show', 'fun run', 'jumble sale', 'sponsored walk', 'cake stall', 'book fair'];

const vehicleTypes = ['car', 'van', 'motorbike', 'truck', 'caravan', 'boat', 'scooter'];

const turfItems = ['new turf', 'grass seed', 'topsoil', 'mulch', 'compost'];
const plantItems = ['plants', 'shrubs', 'flowers', 'seedlings', 'bushes', 'trees'];
const gardenHardItems = ['pine logs', 'timber edging', 'garden stones', 'gravel', 'fencing', 'a garden shed'];
const pavingItems = ['paving tiles', 'stepping stones', 'pavers', 'flagstones', 'concrete slabs'];

const pick = <T>(arr: T[]): T => arr[getRandomInt(0, arr.length - 1)];

const wordProblemTemplates: WordProblemTemplate[] = [
  // ========== GROUP COMPOSITION (total - part = remainder) ==========
  {
    // Boys/girls in a year group
    generate: (difficulty) => {
      const total = difficulty === 1 ? getRandomInt(80, 250)
        : difficulty === 2 ? getRandomInt(250, 600)
        : getRandomInt(600, 2000);
      const girls = getRandomInt(Math.floor(total * 0.35), Math.floor(total * 0.65));
      const boys = total - girls;
      const year = pick(yearGroups);

      return {
        questionText: `There are ${total.toLocaleString()} children in ${year}. ${girls.toLocaleString()} are girls. How many boys are in ${year}?`,
        correctAnswer: boys,
        hintText: 'If you know the total and one part, subtract to find the other part.',
        stepByStep: [
          `Total children: ${total.toLocaleString()}`,
          `Girls: ${girls.toLocaleString()}`,
          `Boys: ${total.toLocaleString()} - ${girls.toLocaleString()} = ${boys.toLocaleString()}`,
          `Answer: ${boys.toLocaleString()} boys`
        ]
      };
    }
  },
  {
    // Adults/children at an event
    generate: (difficulty) => {
      const total = difficulty === 1 ? getRandomInt(100, 400)
        : difficulty === 2 ? getRandomInt(400, 2000)
        : getRandomInt(2000, 8000);
      const adults = getRandomInt(Math.floor(total * 0.3), Math.floor(total * 0.6));
      const children = total - adults;
      const event = pick(eventNames);

      return {
        questionText: `${total.toLocaleString()} people attended the ${event}. ${adults.toLocaleString()} were adults. How many were children?`,
        correctAnswer: children,
        hintText: 'Subtract the number of adults from the total to find how many children attended.',
        stepByStep: [
          `Total people: ${total.toLocaleString()}`,
          `Adults: ${adults.toLocaleString()}`,
          `Children: ${total.toLocaleString()} - ${adults.toLocaleString()} = ${children.toLocaleString()}`,
          `Answer: ${children.toLocaleString()} children`
        ]
      };
    }
  },
  {
    // Teachers and students in a school
    generate: (difficulty) => {
      const total = difficulty === 1 ? getRandomInt(200, 500)
        : difficulty === 2 ? getRandomInt(500, 1500)
        : getRandomInt(1500, 5000);
      const teachers = getRandomInt(Math.floor(total * 0.04), Math.floor(total * 0.1));
      const students = total - teachers;
      const school = pick(schoolNames);

      return {
        questionText: `${school} has ${total.toLocaleString()} people in total. ${teachers.toLocaleString()} are teachers and staff. How many are students?`,
        correctAnswer: students,
        hintText: 'Subtract the number of teachers from the total.',
        stepByStep: [
          `Total people: ${total.toLocaleString()}`,
          `Teachers and staff: ${teachers.toLocaleString()}`,
          `Students: ${total.toLocaleString()} - ${teachers.toLocaleString()} = ${students.toLocaleString()}`,
          `Answer: ${students.toLocaleString()} students`
        ]
      };
    }
  },
  {
    // Team members: boys and girls
    generate: (difficulty) => {
      const total = difficulty === 1 ? getRandomInt(15, 40)
        : difficulty === 2 ? getRandomInt(40, 120)
        : getRandomInt(120, 300);
      const part1 = getRandomInt(Math.floor(total * 0.3), Math.floor(total * 0.7));
      const part2 = total - part1;
      const team = pick(sportTeams);
      const name = pick(names);

      return {
        questionText: `${name}'s ${team} has ${total.toLocaleString()} members. ${part1.toLocaleString()} play in the A team. How many play in the B team?`,
        correctAnswer: part2,
        hintText: 'Subtract the A team members from the total to find the B team members.',
        stepByStep: [
          `Total members: ${total.toLocaleString()}`,
          `A team: ${part1.toLocaleString()}`,
          `B team: ${total.toLocaleString()} - ${part1.toLocaleString()} = ${part2.toLocaleString()}`,
          `Answer: ${part2.toLocaleString()} members`
        ]
      };
    }
  },
  {
    // Passengers on a bus/train
    generate: (difficulty) => {
      const total = difficulty === 1 ? getRandomInt(30, 80)
        : difficulty === 2 ? getRandomInt(80, 300)
        : getRandomInt(300, 900);
      const gotOff = getRandomInt(Math.floor(total * 0.2), Math.floor(total * 0.5));
      const remaining = total - gotOff;
      const vehicle = getRandomInt(0, 1) === 0 ? 'bus' : 'train';

      return {
        questionText: `A ${vehicle} had ${total.toLocaleString()} passengers. At the next stop, ${gotOff.toLocaleString()} passengers got off. How many passengers are still on the ${vehicle}?`,
        correctAnswer: remaining,
        hintText: 'Subtract the passengers who got off from the total.',
        stepByStep: [
          `Passengers on ${vehicle}: ${total.toLocaleString()}`,
          `Got off: ${gotOff.toLocaleString()}`,
          `Remaining: ${total.toLocaleString()} - ${gotOff.toLocaleString()} = ${remaining.toLocaleString()}`,
          `Answer: ${remaining.toLocaleString()} passengers`
        ]
      };
    }
  },

  // ========== BUSINESS PROFIT/LOSS (income - expenses) ==========
  {
    // Business profit (named)
    generate: (difficulty) => {
      const name = pick(names);
      const business = pick(businessNames);
      const income = difficulty === 1 ? getRandomInt(2000, 9999)
        : difficulty === 2 ? getRandomInt(10000, 50000)
        : getRandomInt(50000, 150000);
      const expenses = getRandomInt(Math.floor(income * 0.15), Math.floor(income * 0.6));
      const profit = income - expenses;

      return {
        questionText: `${name}'s ${business} received $${income.toLocaleString()} in income and paid out $${expenses.toLocaleString()} in expenses. How much profit did ${name}'s ${business} make?`,
        correctAnswer: profit,
        hintText: 'Profit = Income - Expenses. Subtract the expenses from the income.',
        stepByStep: [
          `Income: $${income.toLocaleString()}`,
          `Expenses: $${expenses.toLocaleString()}`,
          `Profit: $${income.toLocaleString()} - $${expenses.toLocaleString()} = $${profit.toLocaleString()}`,
          `Answer: $${profit.toLocaleString()}`
        ]
      };
    }
  },
  {
    // Last year's business earnings
    generate: (difficulty) => {
      const name = pick(names);
      const earned = difficulty === 1 ? getRandomInt(3000, 9999)
        : difficulty === 2 ? getRandomInt(10000, 60000)
        : getRandomInt(60000, 200000);
      const paidOut = getRandomInt(Math.floor(earned * 0.1), Math.floor(earned * 0.5));
      const profit = earned - paidOut;

      return {
        questionText: `Last year, ${name}'s business earned $${earned.toLocaleString()} and paid out $${paidOut.toLocaleString()}. How much profit did the business make?`,
        correctAnswer: profit,
        hintText: 'Profit is what you earn minus what you pay out.',
        stepByStep: [
          `Earned: $${earned.toLocaleString()}`,
          `Paid out: $${paidOut.toLocaleString()}`,
          `Profit: $${earned.toLocaleString()} - $${paidOut.toLocaleString()} = $${profit.toLocaleString()}`,
          `Answer: $${profit.toLocaleString()}`
        ]
      };
    }
  },
  {
    // Weekly business revenue vs costs
    generate: (difficulty) => {
      const name = pick(names);
      const business = pick(businessNames);
      const revenue = difficulty === 1 ? getRandomInt(500, 3000)
        : difficulty === 2 ? getRandomInt(3000, 15000)
        : getRandomInt(15000, 50000);
      const rent = getRandomInt(Math.floor(revenue * 0.1), Math.floor(revenue * 0.2));
      const supplies = getRandomInt(Math.floor(revenue * 0.05), Math.floor(revenue * 0.15));
      const wages = getRandomInt(Math.floor(revenue * 0.1), Math.floor(revenue * 0.25));
      const totalCosts = rent + supplies + wages;
      const profit = revenue - totalCosts;

      return {
        questionText: `${name}'s ${business} earned $${revenue.toLocaleString()} this week. Costs were: rent $${rent.toLocaleString()}, supplies $${supplies.toLocaleString()}, and wages $${wages.toLocaleString()}. How much profit was made?`,
        correctAnswer: profit,
        hintText: 'First add up all the costs, then subtract them from the revenue.',
        stepByStep: [
          `Revenue: $${revenue.toLocaleString()}`,
          `Total costs: $${rent.toLocaleString()} + $${supplies.toLocaleString()} + $${wages.toLocaleString()} = $${totalCosts.toLocaleString()}`,
          `Profit: $${revenue.toLocaleString()} - $${totalCosts.toLocaleString()} = $${profit.toLocaleString()}`,
          `Answer: $${profit.toLocaleString()}`
        ]
      };
    }
  },

  // ========== MULTI-ITEM SPENDING TOTALS ==========
  {
    // Landscaping with multiple items
    generate: (difficulty) => {
      const name = pick(names);
      const item1Label = pick(turfItems);
      const item2Label = pick(plantItems);
      const item3Label = pick(gardenHardItems);
      const item4Label = pick(pavingItems);
      const item1 = difficulty === 1 ? getRandomInt(100, 999)
        : difficulty === 2 ? getRandomInt(1000, 5000)
        : getRandomInt(5000, 15000);
      const item2 = difficulty === 1 ? getRandomInt(50, 500)
        : difficulty === 2 ? getRandomInt(500, 3000)
        : getRandomInt(3000, 8000);
      const item3 = difficulty === 1 ? getRandomInt(80, 600)
        : difficulty === 2 ? getRandomInt(600, 3000)
        : getRandomInt(3000, 10000);
      const item4 = difficulty === 1 ? getRandomInt(100, 800)
        : difficulty === 2 ? getRandomInt(800, 4000)
        : getRandomInt(4000, 12000);
      const total = item1 + item2 + item3 + item4;

      return {
        questionText: `${name} was landscaping their property. They spent $${item1.toLocaleString()} on ${item1Label}, $${item2.toLocaleString()} on ${item2Label}, $${item3.toLocaleString()} on ${item3Label} and $${item4.toLocaleString()} on ${item4Label}. How much did they spend altogether?`,
        correctAnswer: total,
        hintText: 'Add up all four amounts to find the total spent.',
        stepByStep: [
          `${item1Label}: $${item1.toLocaleString()}`,
          `${item2Label}: $${item2.toLocaleString()}`,
          `${item3Label}: $${item3.toLocaleString()}`,
          `${item4Label}: $${item4.toLocaleString()}`,
          `Total: $${item1.toLocaleString()} + $${item2.toLocaleString()} + $${item3.toLocaleString()} + $${item4.toLocaleString()} = $${total.toLocaleString()}`,
          `Answer: $${total.toLocaleString()}`
        ]
      };
    }
  },
  {
    // School supplies shopping
    generate: (difficulty) => {
      const name = pick(names);
      const items = ['notebooks', 'pens', 'a calculator', 'a backpack', 'coloured pencils', 'a ruler set', 'a pencil case', 'textbooks', 'an eraser pack', 'folders'];
      const i1 = pick(items);
      let i2 = pick(items); while (i2 === i1) i2 = pick(items);
      let i3 = pick(items); while (i3 === i1 || i3 === i2) i3 = pick(items);
      const c1 = difficulty === 1 ? getRandomInt(5, 30)
        : difficulty === 2 ? getRandomInt(30, 100)
        : getRandomInt(100, 500);
      const c2 = difficulty === 1 ? getRandomInt(3, 25)
        : difficulty === 2 ? getRandomInt(25, 80)
        : getRandomInt(80, 300);
      const c3 = difficulty === 1 ? getRandomInt(2, 20)
        : difficulty === 2 ? getRandomInt(20, 60)
        : getRandomInt(60, 250);
      const total = c1 + c2 + c3;

      return {
        questionText: `${name} bought ${i1} for $${c1.toLocaleString()}, ${i2} for $${c2.toLocaleString()}, and ${i3} for $${c3.toLocaleString()}. How much did ${name} spend in total?`,
        correctAnswer: total,
        hintText: 'Add all the prices together to find the total cost.',
        stepByStep: [
          `${i1}: $${c1.toLocaleString()}`,
          `${i2}: $${c2.toLocaleString()}`,
          `${i3}: $${c3.toLocaleString()}`,
          `Total: $${c1.toLocaleString()} + $${c2.toLocaleString()} + $${c3.toLocaleString()} = $${total.toLocaleString()}`,
          `Answer: $${total.toLocaleString()}`
        ]
      };
    }
  },
  {
    // Party planning costs
    generate: (difficulty) => {
      const name = pick(names);
      const venue = difficulty === 1 ? getRandomInt(50, 200)
        : difficulty === 2 ? getRandomInt(200, 800)
        : getRandomInt(800, 3000);
      const food = difficulty === 1 ? getRandomInt(30, 150)
        : difficulty === 2 ? getRandomInt(150, 500)
        : getRandomInt(500, 2000);
      const decorations = difficulty === 1 ? getRandomInt(10, 60)
        : difficulty === 2 ? getRandomInt(60, 200)
        : getRandomInt(200, 800);
      const entertainment = difficulty === 1 ? getRandomInt(20, 100)
        : difficulty === 2 ? getRandomInt(100, 400)
        : getRandomInt(400, 1500);
      const total = venue + food + decorations + entertainment;

      return {
        questionText: `${name} planned a party. The venue cost $${venue.toLocaleString()}, food cost $${food.toLocaleString()}, decorations cost $${decorations.toLocaleString()}, and entertainment cost $${entertainment.toLocaleString()}. What was the total cost of the party?`,
        correctAnswer: total,
        hintText: 'Add up all the costs to find the total.',
        stepByStep: [
          `Venue: $${venue.toLocaleString()}`,
          `Food: $${food.toLocaleString()}`,
          `Decorations: $${decorations.toLocaleString()}`,
          `Entertainment: $${entertainment.toLocaleString()}`,
          `Total: $${venue.toLocaleString()} + $${food.toLocaleString()} + $${decorations.toLocaleString()} + $${entertainment.toLocaleString()} = $${total.toLocaleString()}`,
          `Answer: $${total.toLocaleString()}`
        ]
      };
    }
  },
  {
    // Home renovation costs
    generate: (difficulty) => {
      const name = pick(names);
      const rooms = ['the kitchen', 'the bathroom', 'the bedroom', 'the living room', 'the garage'];
      const room = pick(rooms);
      const materials = difficulty === 1 ? getRandomInt(200, 1500)
        : difficulty === 2 ? getRandomInt(1500, 8000)
        : getRandomInt(8000, 25000);
      const labour = difficulty === 1 ? getRandomInt(100, 800)
        : difficulty === 2 ? getRandomInt(800, 5000)
        : getRandomInt(5000, 15000);
      const fixtures = difficulty === 1 ? getRandomInt(50, 400)
        : difficulty === 2 ? getRandomInt(400, 3000)
        : getRandomInt(3000, 10000);
      const total = materials + labour + fixtures;

      return {
        questionText: `${name} renovated ${room}. Materials cost $${materials.toLocaleString()}, labour cost $${labour.toLocaleString()}, and new fixtures cost $${fixtures.toLocaleString()}. What was the total renovation cost?`,
        correctAnswer: total,
        hintText: 'Add all three costs together.',
        stepByStep: [
          `Materials: $${materials.toLocaleString()}`,
          `Labour: $${labour.toLocaleString()}`,
          `Fixtures: $${fixtures.toLocaleString()}`,
          `Total: $${materials.toLocaleString()} + $${labour.toLocaleString()} + $${fixtures.toLocaleString()} = $${total.toLocaleString()}`,
          `Answer: $${total.toLocaleString()}`
        ]
      };
    }
  },

  // ========== VEHICLE/PURCHASE WITH EXTRA COSTS ==========
  {
    // Second-hand car purchase with extra costs
    generate: (difficulty) => {
      const name = pick(names);
      const vehicle = pick(vehicleTypes);
      const price = difficulty === 1 ? getRandomInt(1000, 5000)
        : difficulty === 2 ? getRandomInt(5000, 20000)
        : getRandomInt(20000, 60000);
      const stampDuty = getRandomInt(50, 500);
      const inspection = getRandomInt(30, 200);
      const insurance = getRandomInt(200, 2500);
      const regoTransfer = getRandomInt(30, 200);
      const total = price + stampDuty + inspection + insurance + regoTransfer;

      return {
        questionText: `${name} purchased a second-hand ${vehicle} for $${price.toLocaleString()}. The extra costs were: Stamp Duty $${stampDuty.toLocaleString()}, Inspection $${inspection.toLocaleString()}, Insurance $${insurance.toLocaleString()}, and Rego Transfer $${regoTransfer.toLocaleString()}. What was the total cost?`,
        correctAnswer: total,
        hintText: 'Add the purchase price and all the extra costs together.',
        stepByStep: [
          `${vehicle} price: $${price.toLocaleString()}`,
          `Stamp Duty: $${stampDuty.toLocaleString()}`,
          `Inspection: $${inspection.toLocaleString()}`,
          `Insurance: $${insurance.toLocaleString()}`,
          `Rego Transfer: $${regoTransfer.toLocaleString()}`,
          `Total: $${price.toLocaleString()} + $${stampDuty.toLocaleString()} + $${inspection.toLocaleString()} + $${insurance.toLocaleString()} + $${regoTransfer.toLocaleString()} = $${total.toLocaleString()}`,
          `Answer: $${total.toLocaleString()}`
        ]
      };
    }
  },
  {
    // House purchase with fees
    generate: (difficulty) => {
      const name = pick(names);
      const price = difficulty === 1 ? getRandomInt(100000, 300000)
        : difficulty === 2 ? getRandomInt(300000, 600000)
        : getRandomInt(600000, 1200000);
      const solicitor = getRandomInt(1000, 5000);
      const survey = getRandomInt(300, 1500);
      const stampDuty = getRandomInt(2000, 15000);
      const totalFees = solicitor + survey + stampDuty;
      const total = price + totalFees;

      return {
        questionText: `${name} bought a house for $${price.toLocaleString()}. The extra fees were: solicitor $${solicitor.toLocaleString()}, survey $${survey.toLocaleString()}, and stamp duty $${stampDuty.toLocaleString()}. What was the total cost including fees?`,
        correctAnswer: total,
        hintText: 'Add the house price and all fees together.',
        stepByStep: [
          `House price: $${price.toLocaleString()}`,
          `Solicitor: $${solicitor.toLocaleString()}`,
          `Survey: $${survey.toLocaleString()}`,
          `Stamp duty: $${stampDuty.toLocaleString()}`,
          `Total fees: $${solicitor.toLocaleString()} + $${survey.toLocaleString()} + $${stampDuty.toLocaleString()} = $${totalFees.toLocaleString()}`,
          `Total cost: $${price.toLocaleString()} + $${totalFees.toLocaleString()} = $${total.toLocaleString()}`,
          `Answer: $${total.toLocaleString()}`
        ]
      };
    }
  },

  // ========== INVENTORY / STOCK ==========
  {
    // Shop inventory (original template)
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
    // Warehouse stock
    generate: (difficulty) => {
      const name = pick(names);
      const products = ['books', 'toys', 'phones', 'laptops', 'tablets', 'chairs', 'desks', 'bicycles'];
      const product = pick(products);
      const initial = difficulty === 1 ? getRandomInt(500, 2000)
        : difficulty === 2 ? getRandomInt(2000, 10000)
        : getRandomInt(10000, 50000);
      const shipped = getRandomInt(Math.floor(initial * 0.2), Math.floor(initial * 0.5));
      const damaged = getRandomInt(Math.floor(initial * 0.01), Math.floor(initial * 0.05));
      const answer = initial - shipped - damaged;

      return {
        questionText: `${name}'s warehouse had ${initial.toLocaleString()} ${product}. They shipped ${shipped.toLocaleString()} to stores and ${damaged.toLocaleString()} were damaged. How many ${product} are left?`,
        correctAnswer: answer,
        hintText: 'Subtract both the shipped and damaged items from the total.',
        stepByStep: [
          `Starting stock: ${initial.toLocaleString()}`,
          `Shipped: ${shipped.toLocaleString()}`,
          `Damaged: ${damaged.toLocaleString()}`,
          `Remaining: ${initial.toLocaleString()} - ${shipped.toLocaleString()} - ${damaged.toLocaleString()} = ${answer.toLocaleString()}`,
          `Answer: ${answer.toLocaleString()} ${product}`
        ]
      };
    }
  },

  // ========== SCHOOL / STUDENTS ==========
  {
    // School students pattern (original)
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
    // Library books
    generate: (difficulty) => {
      const school = pick(schoolNames);
      const total = difficulty === 1 ? getRandomInt(500, 2000)
        : difficulty === 2 ? getRandomInt(2000, 8000)
        : getRandomInt(8000, 25000);
      const borrowed = getRandomInt(Math.floor(total * 0.1), Math.floor(total * 0.3));
      const returned = getRandomInt(Math.floor(borrowed * 0.3), Math.floor(borrowed * 0.8));
      const answer = total - borrowed + returned;

      return {
        questionText: `${school} library has ${total.toLocaleString()} books. Students borrowed ${borrowed.toLocaleString()} books and returned ${returned.toLocaleString()} books. How many books are in the library now?`,
        correctAnswer: answer,
        hintText: 'Start with the total, subtract books borrowed, then add books returned.',
        stepByStep: [
          `Start: ${total.toLocaleString()} books`,
          `Borrowed: ${total.toLocaleString()} - ${borrowed.toLocaleString()} = ${(total - borrowed).toLocaleString()}`,
          `Returned: ${(total - borrowed).toLocaleString()} + ${returned.toLocaleString()} = ${answer.toLocaleString()}`,
          `Answer: ${answer.toLocaleString()} books`
        ]
      };
    }
  },

  // ========== DISTANCE / TRAVEL ==========
  {
    // Distance/travel (original)
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
    // Multi-leg journey
    generate: (difficulty) => {
      const name = pick(names);
      const cities = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Edinburgh', 'Bristol', 'Liverpool', 'Glasgow', 'Cardiff', 'Oxford'];
      const c1 = pick(cities);
      let c2 = pick(cities); while (c2 === c1) c2 = pick(cities);
      let c3 = pick(cities); while (c3 === c1 || c3 === c2) c3 = pick(cities);
      const d1 = difficulty === 1 ? getRandomInt(50, 200)
        : difficulty === 2 ? getRandomInt(200, 500)
        : getRandomInt(500, 1500);
      const d2 = difficulty === 1 ? getRandomInt(30, 150)
        : difficulty === 2 ? getRandomInt(150, 400)
        : getRandomInt(400, 1000);
      const total = d1 + d2;

      return {
        questionText: `${name} drove ${d1.toLocaleString()} km from ${c1} to ${c2}, then ${d2.toLocaleString()} km from ${c2} to ${c3}. What was the total distance?`,
        correctAnswer: total,
        hintText: 'Add both distances together for the total journey.',
        stepByStep: [
          `${c1} to ${c2}: ${d1.toLocaleString()} km`,
          `${c2} to ${c3}: ${d2.toLocaleString()} km`,
          `Total: ${d1.toLocaleString()} + ${d2.toLocaleString()} = ${total.toLocaleString()} km`,
          `Answer: ${total.toLocaleString()} km`
        ]
      };
    }
  },
  {
    // Remaining distance
    generate: (difficulty) => {
      const name = pick(names);
      const totalTrip = difficulty === 1 ? getRandomInt(100, 500)
        : difficulty === 2 ? getRandomInt(500, 2000)
        : getRandomInt(2000, 8000);
      const driven = getRandomInt(Math.floor(totalTrip * 0.2), Math.floor(totalTrip * 0.7));
      const remaining = totalTrip - driven;

      return {
        questionText: `${name}'s road trip is ${totalTrip.toLocaleString()} km long. So far, ${name} has driven ${driven.toLocaleString()} km. How many kilometres are left?`,
        correctAnswer: remaining,
        hintText: 'Subtract the distance already driven from the total trip distance.',
        stepByStep: [
          `Total trip: ${totalTrip.toLocaleString()} km`,
          `Driven so far: ${driven.toLocaleString()} km`,
          `Remaining: ${totalTrip.toLocaleString()} - ${driven.toLocaleString()} = ${remaining.toLocaleString()} km`,
          `Answer: ${remaining.toLocaleString()} km`
        ]
      };
    }
  },

  // ========== FUNDRAISING / GOALS ==========
  {
    // Fundraising (original)
    generate: (difficulty) => {
      const goal = difficulty === 1 ? roundToNearest(getRandomInt(2000, 5000), 100)
        : difficulty === 2 ? roundToNearest(getRandomInt(5000, 20000), 500)
        : roundToNearest(getRandomInt(20000, 80000), 1000);
      const raised = getRandomInt(Math.floor(goal * 0.3), Math.floor(goal * 0.7));
      const answer = goal - raised;

      return {
        questionText: `A charity needs to raise $${goal.toLocaleString()} for a new playground. So far they have raised $${raised.toLocaleString()}. How much more do they need to raise?`,
        correctAnswer: answer,
        hintText: 'Subtract the amount already raised from the total goal to find what is left.',
        stepByStep: [
          `Total goal: $${goal.toLocaleString()}`,
          `Already raised: $${raised.toLocaleString()}`,
          `Amount still needed: $${goal.toLocaleString()} - $${raised.toLocaleString()} = $${answer.toLocaleString()}`,
          `Answer: $${answer.toLocaleString()}`
        ]
      };
    }
  },
  {
    // Multi-source fundraising
    generate: (difficulty) => {
      const school = pick(schoolNames);
      const event1 = pick(eventNames);
      let event2 = pick(eventNames); while (event2 === event1) event2 = pick(eventNames);
      let event3 = pick(eventNames); while (event3 === event1 || event3 === event2) event3 = pick(eventNames);
      const a1 = difficulty === 1 ? getRandomInt(100, 800)
        : difficulty === 2 ? getRandomInt(800, 5000)
        : getRandomInt(5000, 20000);
      const a2 = difficulty === 1 ? getRandomInt(50, 500)
        : difficulty === 2 ? getRandomInt(500, 3000)
        : getRandomInt(3000, 15000);
      const a3 = difficulty === 1 ? getRandomInt(30, 300)
        : difficulty === 2 ? getRandomInt(300, 2000)
        : getRandomInt(2000, 10000);
      const total = a1 + a2 + a3;

      return {
        questionText: `${school} raised money from three events. The ${event1} raised $${a1.toLocaleString()}, the ${event2} raised $${a2.toLocaleString()}, and the ${event3} raised $${a3.toLocaleString()}. How much was raised in total?`,
        correctAnswer: total,
        hintText: 'Add up the amounts from all three events.',
        stepByStep: [
          `${event1}: $${a1.toLocaleString()}`,
          `${event2}: $${a2.toLocaleString()}`,
          `${event3}: $${a3.toLocaleString()}`,
          `Total: $${a1.toLocaleString()} + $${a2.toLocaleString()} + $${a3.toLocaleString()} = $${total.toLocaleString()}`,
          `Answer: $${total.toLocaleString()}`
        ]
      };
    }
  },

  // ========== WEIGHT / CAPACITY ==========
  {
    // Total weight of items
    generate: (difficulty) => {
      const name = pick(names);
      const items = ['suitcase', 'backpack', 'box of books', 'sports bag', 'shopping bags'];
      const i1 = pick(items);
      let i2 = pick(items); while (i2 === i1) i2 = pick(items);
      const w1 = difficulty === 1 ? getRandomInt(5, 25)
        : difficulty === 2 ? getRandomInt(25, 80)
        : getRandomInt(80, 200);
      const w2 = difficulty === 1 ? getRandomInt(3, 15)
        : difficulty === 2 ? getRandomInt(15, 50)
        : getRandomInt(50, 120);
      const total = w1 + w2;

      return {
        questionText: `${name}'s ${i1} weighs ${w1.toLocaleString()} kg and their ${i2} weighs ${w2.toLocaleString()} kg. What is the total weight?`,
        correctAnswer: total,
        hintText: 'Add both weights together.',
        stepByStep: [
          `${i1}: ${w1.toLocaleString()} kg`,
          `${i2}: ${w2.toLocaleString()} kg`,
          `Total: ${w1.toLocaleString()} + ${w2.toLocaleString()} = ${total.toLocaleString()} kg`,
          `Answer: ${total.toLocaleString()} kg`
        ]
      };
    }
  },
  {
    // Weight limit remaining
    generate: (difficulty) => {
      const name = pick(names);
      const limit = difficulty === 1 ? getRandomInt(20, 50)
        : difficulty === 2 ? getRandomInt(50, 200)
        : getRandomInt(200, 1000);
      const loaded = getRandomInt(Math.floor(limit * 0.3), Math.floor(limit * 0.7));
      const remaining = limit - loaded;

      return {
        questionText: `${name}'s luggage allowance is ${limit.toLocaleString()} kg. They have packed ${loaded.toLocaleString()} kg so far. How many more kilograms can they pack?`,
        correctAnswer: remaining,
        hintText: 'Subtract what has been packed from the total allowance.',
        stepByStep: [
          `Allowance: ${limit.toLocaleString()} kg`,
          `Packed: ${loaded.toLocaleString()} kg`,
          `Remaining: ${limit.toLocaleString()} - ${loaded.toLocaleString()} = ${remaining.toLocaleString()} kg`,
          `Answer: ${remaining.toLocaleString()} kg`
        ]
      };
    }
  },

  // ========== POPULATION / ATTENDANCE ==========
  {
    // Town population change
    generate: (difficulty) => {
      const town = pick(['Oakville', 'Springtown', 'Riverdale', 'Hillside', 'Lakewood', 'Maplewood', 'Fairview', 'Greendale']);
      const pop = difficulty === 1 ? getRandomInt(2000, 8000)
        : difficulty === 2 ? getRandomInt(8000, 30000)
        : getRandomInt(30000, 100000);
      const movedIn = getRandomInt(Math.floor(pop * 0.02), Math.floor(pop * 0.1));
      const movedOut = getRandomInt(Math.floor(pop * 0.01), Math.floor(pop * 0.08));
      const answer = pop + movedIn - movedOut;

      return {
        questionText: `The town of ${town} has a population of ${pop.toLocaleString()}. During the year, ${movedIn.toLocaleString()} people moved in and ${movedOut.toLocaleString()} moved away. What is the new population?`,
        correctAnswer: answer,
        hintText: 'Add people who moved in, then subtract people who moved away.',
        stepByStep: [
          `Starting population: ${pop.toLocaleString()}`,
          `Moved in: +${movedIn.toLocaleString()} → ${(pop + movedIn).toLocaleString()}`,
          `Moved out: -${movedOut.toLocaleString()} → ${answer.toLocaleString()}`,
          `Answer: ${answer.toLocaleString()} people`
        ]
      };
    }
  },
  {
    // Concert/event seating
    generate: (difficulty) => {
      const capacity = difficulty === 1 ? getRandomInt(500, 2000)
        : difficulty === 2 ? getRandomInt(2000, 10000)
        : getRandomInt(10000, 50000);
      const sold = getRandomInt(Math.floor(capacity * 0.5), Math.floor(capacity * 0.9));
      const unsold = capacity - sold;

      return {
        questionText: `A concert venue has ${capacity.toLocaleString()} seats. ${sold.toLocaleString()} tickets have been sold. How many seats are still available?`,
        correctAnswer: unsold,
        hintText: 'Subtract the tickets sold from the total number of seats.',
        stepByStep: [
          `Total seats: ${capacity.toLocaleString()}`,
          `Tickets sold: ${sold.toLocaleString()}`,
          `Available: ${capacity.toLocaleString()} - ${sold.toLocaleString()} = ${unsold.toLocaleString()}`,
          `Answer: ${unsold.toLocaleString()} seats`
        ]
      };
    }
  },

  // ========== SAVINGS / BANKING ==========
  {
    // Saving up for something
    generate: (difficulty) => {
      const name = pick(names);
      const items = ['a new bike', 'a gaming console', 'a laptop', 'a holiday', 'a tablet', 'a camera'];
      const item = pick(items);
      const target = difficulty === 1 ? getRandomInt(100, 500)
        : difficulty === 2 ? getRandomInt(500, 2000)
        : getRandomInt(2000, 8000);
      const saved = getRandomInt(Math.floor(target * 0.2), Math.floor(target * 0.6));
      const remaining = target - saved;

      return {
        questionText: `${name} is saving for ${item} that costs $${target.toLocaleString()}. ${name} has saved $${saved.toLocaleString()} so far. How much more does ${name} need to save?`,
        correctAnswer: remaining,
        hintText: 'Subtract the amount saved from the target amount.',
        stepByStep: [
          `Target: $${target.toLocaleString()}`,
          `Saved so far: $${saved.toLocaleString()}`,
          `Still needed: $${target.toLocaleString()} - $${saved.toLocaleString()} = $${remaining.toLocaleString()}`,
          `Answer: $${remaining.toLocaleString()}`
        ]
      };
    }
  },
  {
    // Weekly savings total
    generate: (difficulty) => {
      const name = pick(names);
      const w1 = difficulty === 1 ? getRandomInt(5, 30)
        : difficulty === 2 ? getRandomInt(30, 100)
        : getRandomInt(100, 500);
      const w2 = difficulty === 1 ? getRandomInt(5, 30)
        : difficulty === 2 ? getRandomInt(30, 100)
        : getRandomInt(100, 500);
      const w3 = difficulty === 1 ? getRandomInt(5, 30)
        : difficulty === 2 ? getRandomInt(30, 100)
        : getRandomInt(100, 500);
      const w4 = difficulty === 1 ? getRandomInt(5, 30)
        : difficulty === 2 ? getRandomInt(30, 100)
        : getRandomInt(100, 500);
      const total = w1 + w2 + w3 + w4;

      return {
        questionText: `${name} saved $${w1.toLocaleString()} in week 1, $${w2.toLocaleString()} in week 2, $${w3.toLocaleString()} in week 3, and $${w4.toLocaleString()} in week 4. How much did ${name} save in total?`,
        correctAnswer: total,
        hintText: 'Add up all four weekly savings amounts.',
        stepByStep: [
          `Week 1: $${w1.toLocaleString()}`,
          `Week 2: $${w2.toLocaleString()}`,
          `Week 3: $${w3.toLocaleString()}`,
          `Week 4: $${w4.toLocaleString()}`,
          `Total: $${w1.toLocaleString()} + $${w2.toLocaleString()} + $${w3.toLocaleString()} + $${w4.toLocaleString()} = $${total.toLocaleString()}`,
          `Answer: $${total.toLocaleString()}`
        ]
      };
    }
  },

  // ========== FOOD / COOKING ==========
  {
    // Baking quantities
    generate: (difficulty) => {
      const name = pick(names);
      const baked = difficulty === 1 ? getRandomInt(24, 100)
        : difficulty === 2 ? getRandomInt(100, 500)
        : getRandomInt(500, 2000);
      const sold = getRandomInt(Math.floor(baked * 0.3), Math.floor(baked * 0.7));
      const gaveAway = getRandomInt(Math.floor(baked * 0.05), Math.floor(baked * 0.15));
      const remaining = baked - sold - gaveAway;

      return {
        questionText: `${name} baked ${baked.toLocaleString()} cupcakes. They sold ${sold.toLocaleString()} at the ${pick(eventNames)} and gave away ${gaveAway.toLocaleString()} to friends. How many cupcakes are left?`,
        correctAnswer: remaining,
        hintText: 'Subtract both the sold and given-away cupcakes from the total.',
        stepByStep: [
          `Baked: ${baked.toLocaleString()}`,
          `Sold: ${sold.toLocaleString()}`,
          `Gave away: ${gaveAway.toLocaleString()}`,
          `Remaining: ${baked.toLocaleString()} - ${sold.toLocaleString()} - ${gaveAway.toLocaleString()} = ${remaining.toLocaleString()}`,
          `Answer: ${remaining.toLocaleString()} cupcakes`
        ]
      };
    }
  },
  {
    // Fruit harvest
    generate: (difficulty) => {
      const name = pick(names);
      const fruits = ['apples', 'oranges', 'strawberries', 'tomatoes', 'pears', 'lemons'];
      const fruit = pick(fruits);
      const picked = difficulty === 1 ? getRandomInt(50, 300)
        : difficulty === 2 ? getRandomInt(300, 1500)
        : getRandomInt(1500, 5000);
      const ate = getRandomInt(Math.floor(picked * 0.05), Math.floor(picked * 0.15));
      const sold = getRandomInt(Math.floor(picked * 0.3), Math.floor(picked * 0.5));
      const left = picked - ate - sold;

      return {
        questionText: `${name} picked ${picked.toLocaleString()} ${fruit} from the orchard. The family ate ${ate.toLocaleString()} and sold ${sold.toLocaleString()} at the market. How many ${fruit} are left?`,
        correctAnswer: left,
        hintText: 'Subtract the eaten and sold fruit from the total picked.',
        stepByStep: [
          `Picked: ${picked.toLocaleString()}`,
          `Eaten: ${ate.toLocaleString()}`,
          `Sold: ${sold.toLocaleString()}`,
          `Left: ${picked.toLocaleString()} - ${ate.toLocaleString()} - ${sold.toLocaleString()} = ${left.toLocaleString()}`,
          `Answer: ${left.toLocaleString()} ${fruit}`
        ]
      };
    }
  },

  // ========== SPORTS / SCORES ==========
  {
    // Season point total
    generate: (difficulty) => {
      const name = pick(names);
      const sport = pick(['football', 'basketball', 'cricket', 'rugby']);
      const g1 = difficulty === 1 ? getRandomInt(10, 50)
        : difficulty === 2 ? getRandomInt(50, 200)
        : getRandomInt(200, 800);
      const g2 = difficulty === 1 ? getRandomInt(10, 50)
        : difficulty === 2 ? getRandomInt(50, 200)
        : getRandomInt(200, 800);
      const g3 = difficulty === 1 ? getRandomInt(10, 50)
        : difficulty === 2 ? getRandomInt(50, 200)
        : getRandomInt(200, 800);
      const total = g1 + g2 + g3;

      return {
        questionText: `${name}'s ${sport} team scored ${g1.toLocaleString()} points in game 1, ${g2.toLocaleString()} points in game 2, and ${g3.toLocaleString()} points in game 3. What was the total points scored?`,
        correctAnswer: total,
        hintText: 'Add up the points from all three games.',
        stepByStep: [
          `Game 1: ${g1.toLocaleString()} points`,
          `Game 2: ${g2.toLocaleString()} points`,
          `Game 3: ${g3.toLocaleString()} points`,
          `Total: ${g1.toLocaleString()} + ${g2.toLocaleString()} + ${g3.toLocaleString()} = ${total.toLocaleString()}`,
          `Answer: ${total.toLocaleString()} points`
        ]
      };
    }
  },
  {
    // Score difference
    generate: (difficulty) => {
      const team1 = pick(['Eagles', 'Lions', 'Tigers', 'Bears', 'Wolves', 'Hawks', 'Panthers', 'Sharks']);
      let team2 = pick(['Eagles', 'Lions', 'Tigers', 'Bears', 'Wolves', 'Hawks', 'Panthers', 'Sharks']);
      while (team2 === team1) team2 = pick(['Eagles', 'Lions', 'Tigers', 'Bears', 'Wolves', 'Hawks', 'Panthers', 'Sharks']);
      const s1 = difficulty === 1 ? getRandomInt(20, 80)
        : difficulty === 2 ? getRandomInt(80, 300)
        : getRandomInt(300, 1000);
      const s2 = getRandomInt(Math.floor(s1 * 0.4), Math.floor(s1 * 0.9));
      const diff = s1 - s2;

      return {
        questionText: `The ${team1} scored ${s1.toLocaleString()} points and the ${team2} scored ${s2.toLocaleString()} points. How many more points did the ${team1} score?`,
        correctAnswer: diff,
        hintText: 'Subtract the lower score from the higher score.',
        stepByStep: [
          `${team1}: ${s1.toLocaleString()} points`,
          `${team2}: ${s2.toLocaleString()} points`,
          `Difference: ${s1.toLocaleString()} - ${s2.toLocaleString()} = ${diff.toLocaleString()}`,
          `Answer: ${diff.toLocaleString()} more points`
        ]
      };
    }
  },

  // ========== TIME / SCHEDULING ==========
  {
    // Total minutes of activities
    generate: (difficulty) => {
      const name = pick(names);
      const activities = ['reading', 'maths practice', 'art', 'science experiments', 'music', 'PE', 'writing'];
      const a1 = pick(activities);
      let a2 = pick(activities); while (a2 === a1) a2 = pick(activities);
      let a3 = pick(activities); while (a3 === a1 || a3 === a2) a3 = pick(activities);
      const m1 = difficulty === 1 ? getRandomInt(10, 45)
        : difficulty === 2 ? getRandomInt(45, 120)
        : getRandomInt(120, 300);
      const m2 = difficulty === 1 ? getRandomInt(10, 45)
        : difficulty === 2 ? getRandomInt(45, 120)
        : getRandomInt(120, 300);
      const m3 = difficulty === 1 ? getRandomInt(10, 45)
        : difficulty === 2 ? getRandomInt(45, 120)
        : getRandomInt(120, 300);
      const total = m1 + m2 + m3;

      return {
        questionText: `${name} spent ${m1.toLocaleString()} minutes on ${a1}, ${m2.toLocaleString()} minutes on ${a2}, and ${m3.toLocaleString()} minutes on ${a3}. How many minutes did ${name} spend in total?`,
        correctAnswer: total,
        hintText: 'Add up all the time spent on each activity.',
        stepByStep: [
          `${a1}: ${m1.toLocaleString()} minutes`,
          `${a2}: ${m2.toLocaleString()} minutes`,
          `${a3}: ${m3.toLocaleString()} minutes`,
          `Total: ${m1.toLocaleString()} + ${m2.toLocaleString()} + ${m3.toLocaleString()} = ${total.toLocaleString()} minutes`,
          `Answer: ${total.toLocaleString()} minutes`
        ]
      };
    }
  },

  // ========== COLLECTIONS / STICKERS ==========
  {
    // Sticker collection
    generate: (difficulty) => {
      const name = pick(names);
      const collectibles = ['stickers', 'cards', 'stamps', 'coins', 'marbles', 'badges', 'shells'];
      const item = pick(collectibles);
      const had = difficulty === 1 ? getRandomInt(50, 300)
        : difficulty === 2 ? getRandomInt(300, 1500)
        : getRandomInt(1500, 5000);
      const got = getRandomInt(Math.floor(had * 0.1), Math.floor(had * 0.3));
      const traded = getRandomInt(Math.floor(had * 0.05), Math.floor(had * 0.15));
      const answer = had + got - traded;

      return {
        questionText: `${name} had ${had.toLocaleString()} ${item}. They got ${got.toLocaleString()} more for their birthday and traded ${traded.toLocaleString()} with a friend. How many ${item} does ${name} have now?`,
        correctAnswer: answer,
        hintText: 'Add the new ones, then subtract the traded ones.',
        stepByStep: [
          `Started with: ${had.toLocaleString()}`,
          `Got more: +${got.toLocaleString()} → ${(had + got).toLocaleString()}`,
          `Traded away: -${traded.toLocaleString()} → ${answer.toLocaleString()}`,
          `Answer: ${answer.toLocaleString()} ${item}`
        ]
      };
    }
  },

  // ========== PRODUCTION / MANUFACTURING ==========
  {
    // Factory production
    generate: (difficulty) => {
      const products = ['toys', 'gadgets', 'bottles', 'boxes', 'shirts', 'pairs of shoes', 'packets'];
      const product = pick(products);
      const day1 = difficulty === 1 ? getRandomInt(100, 500)
        : difficulty === 2 ? getRandomInt(500, 3000)
        : getRandomInt(3000, 15000);
      const day2 = difficulty === 1 ? getRandomInt(100, 500)
        : difficulty === 2 ? getRandomInt(500, 3000)
        : getRandomInt(3000, 15000);
      const day3 = difficulty === 1 ? getRandomInt(100, 500)
        : difficulty === 2 ? getRandomInt(500, 3000)
        : getRandomInt(3000, 15000);
      const total = day1 + day2 + day3;

      return {
        questionText: `A factory made ${day1.toLocaleString()} ${product} on Monday, ${day2.toLocaleString()} on Tuesday, and ${day3.toLocaleString()} on Wednesday. How many ${product} were made in total?`,
        correctAnswer: total,
        hintText: 'Add up the production from all three days.',
        stepByStep: [
          `Monday: ${day1.toLocaleString()}`,
          `Tuesday: ${day2.toLocaleString()}`,
          `Wednesday: ${day3.toLocaleString()}`,
          `Total: ${day1.toLocaleString()} + ${day2.toLocaleString()} + ${day3.toLocaleString()} = ${total.toLocaleString()}`,
          `Answer: ${total.toLocaleString()} ${product}`
        ]
      };
    }
  },
  {
    // Remaining stock after orders
    generate: (difficulty) => {
      const name = pick(names);
      const items = ['widgets', 'units', 'packages', 'crates', 'pallets'];
      const item = pick(items);
      const stock = difficulty === 1 ? getRandomInt(500, 2000)
        : difficulty === 2 ? getRandomInt(2000, 10000)
        : getRandomInt(10000, 50000);
      const order1 = getRandomInt(Math.floor(stock * 0.1), Math.floor(stock * 0.25));
      const order2 = getRandomInt(Math.floor(stock * 0.1), Math.floor(stock * 0.25));
      const order3 = getRandomInt(Math.floor(stock * 0.05), Math.floor(stock * 0.15));
      const remaining = stock - order1 - order2 - order3;

      return {
        questionText: `${name}'s warehouse had ${stock.toLocaleString()} ${item}. Three orders were filled: ${order1.toLocaleString()}, ${order2.toLocaleString()}, and ${order3.toLocaleString()} ${item}. How many ${item} remain?`,
        correctAnswer: remaining,
        hintText: 'Subtract all three orders from the starting stock.',
        stepByStep: [
          `Starting stock: ${stock.toLocaleString()}`,
          `Orders: ${order1.toLocaleString()} + ${order2.toLocaleString()} + ${order3.toLocaleString()} = ${(order1 + order2 + order3).toLocaleString()}`,
          `Remaining: ${stock.toLocaleString()} - ${(order1 + order2 + order3).toLocaleString()} = ${remaining.toLocaleString()}`,
          `Answer: ${remaining.toLocaleString()} ${item}`
        ]
      };
    }
  },

  // ========== GARDEN / NATURE ==========
  {
    // Planting seeds
    generate: (difficulty) => {
      const name = pick(names);
      const plantTypes = ['sunflower', 'tomato', 'carrot', 'bean', 'pea', 'lettuce', 'pumpkin'];
      const plant = pick(plantTypes);
      const planted = difficulty === 1 ? getRandomInt(20, 100)
        : difficulty === 2 ? getRandomInt(100, 500)
        : getRandomInt(500, 2000);
      const grew = getRandomInt(Math.floor(planted * 0.5), Math.floor(planted * 0.85));
      const didntGrow = planted - grew;

      return {
        questionText: `${name} planted ${planted.toLocaleString()} ${plant} seeds. ${grew.toLocaleString()} of them grew into plants. How many seeds did not grow?`,
        correctAnswer: didntGrow,
        hintText: 'Subtract the seeds that grew from the total planted.',
        stepByStep: [
          `Total planted: ${planted.toLocaleString()}`,
          `Grew: ${grew.toLocaleString()}`,
          `Did not grow: ${planted.toLocaleString()} - ${grew.toLocaleString()} = ${didntGrow.toLocaleString()}`,
          `Answer: ${didntGrow.toLocaleString()} seeds`
        ]
      };
    }
  },

  // ========== BUDGET / ALLOWANCE ==========
  {
    // Budget after spending
    generate: (difficulty) => {
      const name = pick(names);
      const budget = difficulty === 1 ? getRandomInt(50, 200)
        : difficulty === 2 ? getRandomInt(200, 1000)
        : getRandomInt(1000, 5000);
      const spent1 = getRandomInt(Math.floor(budget * 0.1), Math.floor(budget * 0.3));
      const spent2 = getRandomInt(Math.floor(budget * 0.1), Math.floor(budget * 0.25));
      const spent3 = getRandomInt(Math.floor(budget * 0.05), Math.floor(budget * 0.15));
      const totalSpent = spent1 + spent2 + spent3;
      const remaining = budget - totalSpent;

      return {
        questionText: `${name} had a budget of $${budget.toLocaleString()}. They spent $${spent1.toLocaleString()} on food, $${spent2.toLocaleString()} on transport, and $${spent3.toLocaleString()} on entertainment. How much of the budget is left?`,
        correctAnswer: remaining,
        hintText: 'Add up all the spending, then subtract from the budget.',
        stepByStep: [
          `Budget: $${budget.toLocaleString()}`,
          `Total spent: $${spent1.toLocaleString()} + $${spent2.toLocaleString()} + $${spent3.toLocaleString()} = $${totalSpent.toLocaleString()}`,
          `Remaining: $${budget.toLocaleString()} - $${totalSpent.toLocaleString()} = $${remaining.toLocaleString()}`,
          `Answer: $${remaining.toLocaleString()}`
        ]
      };
    }
  },

  // ========== ELECTION / VOTING ==========
  {
    // Votes in an election
    generate: (difficulty) => {
      const candidates = ['Red team', 'Blue team', 'Green team'];
      const v1 = difficulty === 1 ? getRandomInt(100, 500)
        : difficulty === 2 ? getRandomInt(500, 3000)
        : getRandomInt(3000, 15000);
      const v2 = difficulty === 1 ? getRandomInt(80, 400)
        : difficulty === 2 ? getRandomInt(400, 2500)
        : getRandomInt(2500, 12000);
      const v3 = difficulty === 1 ? getRandomInt(50, 200)
        : difficulty === 2 ? getRandomInt(200, 1000)
        : getRandomInt(1000, 5000);
      const total = v1 + v2 + v3;

      return {
        questionText: `In the school council election, ${candidates[0]} received ${v1.toLocaleString()} votes, ${candidates[1]} received ${v2.toLocaleString()} votes, and ${candidates[2]} received ${v3.toLocaleString()} votes. How many votes were cast in total?`,
        correctAnswer: total,
        hintText: 'Add up all the votes from each team.',
        stepByStep: [
          `${candidates[0]}: ${v1.toLocaleString()} votes`,
          `${candidates[1]}: ${v2.toLocaleString()} votes`,
          `${candidates[2]}: ${v3.toLocaleString()} votes`,
          `Total: ${v1.toLocaleString()} + ${v2.toLocaleString()} + ${v3.toLocaleString()} = ${total.toLocaleString()}`,
          `Answer: ${total.toLocaleString()} votes`
        ]
      };
    }
  },

  // ========== ENERGY / WATER USAGE ==========
  {
    // Water usage
    generate: (difficulty) => {
      const name = pick(names);
      const mon = difficulty === 1 ? getRandomInt(50, 200)
        : difficulty === 2 ? getRandomInt(200, 800)
        : getRandomInt(800, 3000);
      const tue = difficulty === 1 ? getRandomInt(40, 180)
        : difficulty === 2 ? getRandomInt(180, 700)
        : getRandomInt(700, 2800);
      const wed = difficulty === 1 ? getRandomInt(60, 220)
        : difficulty === 2 ? getRandomInt(220, 900)
        : getRandomInt(900, 3200);
      const total = mon + tue + wed;

      return {
        questionText: `${name}'s family used ${mon.toLocaleString()} litres of water on Monday, ${tue.toLocaleString()} litres on Tuesday, and ${wed.toLocaleString()} litres on Wednesday. What was the total water used?`,
        correctAnswer: total,
        hintText: 'Add up the water used on all three days.',
        stepByStep: [
          `Monday: ${mon.toLocaleString()} litres`,
          `Tuesday: ${tue.toLocaleString()} litres`,
          `Wednesday: ${wed.toLocaleString()} litres`,
          `Total: ${mon.toLocaleString()} + ${tue.toLocaleString()} + ${wed.toLocaleString()} = ${total.toLocaleString()} litres`,
          `Answer: ${total.toLocaleString()} litres`
        ]
      };
    }
  },

  // ========== COMPARISON / DIFFERENCE ==========
  {
    // Height difference
    generate: (difficulty) => {
      const buildings = ['the library', 'the town hall', 'the church', 'the school', 'the hospital', 'the shopping centre', 'the fire station'];
      const b1 = pick(buildings);
      let b2 = pick(buildings); while (b2 === b1) b2 = pick(buildings);
      const h1 = difficulty === 1 ? getRandomInt(10, 50)
        : difficulty === 2 ? getRandomInt(50, 200)
        : getRandomInt(200, 500);
      const h2 = getRandomInt(Math.floor(h1 * 0.3), Math.floor(h1 * 0.8));
      const diff = h1 - h2;

      return {
        questionText: `${b1.charAt(0).toUpperCase() + b1.slice(1)} is ${h1.toLocaleString()} metres tall. ${b2.charAt(0).toUpperCase() + b2.slice(1)} is ${h2.toLocaleString()} metres tall. How much taller is ${b1} than ${b2}?`,
        correctAnswer: diff,
        hintText: 'Subtract the shorter height from the taller height.',
        stepByStep: [
          `${b1}: ${h1.toLocaleString()} metres`,
          `${b2}: ${h2.toLocaleString()} metres`,
          `Difference: ${h1.toLocaleString()} - ${h2.toLocaleString()} = ${diff.toLocaleString()} metres`,
          `Answer: ${diff.toLocaleString()} metres`
        ]
      };
    }
  },

  // ========== CHARITY / DONATIONS ==========
  {
    // Donation split
    generate: (difficulty) => {
      const name = pick(names);
      const totalDonation = difficulty === 1 ? getRandomInt(100, 500)
        : difficulty === 2 ? getRandomInt(500, 5000)
        : getRandomInt(5000, 20000);
      const charity1Amt = getRandomInt(Math.floor(totalDonation * 0.3), Math.floor(totalDonation * 0.6));
      const charity2Amt = totalDonation - charity1Amt;

      return {
        questionText: `${name} donated $${totalDonation.toLocaleString()} to two charities. The first charity received $${charity1Amt.toLocaleString()}. How much did the second charity receive?`,
        correctAnswer: charity2Amt,
        hintText: 'Subtract the first charity\'s amount from the total donation.',
        stepByStep: [
          `Total donation: $${totalDonation.toLocaleString()}`,
          `First charity: $${charity1Amt.toLocaleString()}`,
          `Second charity: $${totalDonation.toLocaleString()} - $${charity1Amt.toLocaleString()} = $${charity2Amt.toLocaleString()}`,
          `Answer: $${charity2Amt.toLocaleString()}`
        ]
      };
    }
  },

  // ========== FARMING ==========
  {
    // Farm animals
    generate: (difficulty) => {
      const name = pick(names);
      const cows = difficulty === 1 ? getRandomInt(10, 50)
        : difficulty === 2 ? getRandomInt(50, 200)
        : getRandomInt(200, 800);
      const sheep = difficulty === 1 ? getRandomInt(20, 80)
        : difficulty === 2 ? getRandomInt(80, 400)
        : getRandomInt(400, 1500);
      const chickens = difficulty === 1 ? getRandomInt(30, 100)
        : difficulty === 2 ? getRandomInt(100, 500)
        : getRandomInt(500, 2000);
      const total = cows + sheep + chickens;

      return {
        questionText: `${name}'s farm has ${cows.toLocaleString()} cows, ${sheep.toLocaleString()} sheep, and ${chickens.toLocaleString()} chickens. How many animals are on the farm altogether?`,
        correctAnswer: total,
        hintText: 'Add up all the animals.',
        stepByStep: [
          `Cows: ${cows.toLocaleString()}`,
          `Sheep: ${sheep.toLocaleString()}`,
          `Chickens: ${chickens.toLocaleString()}`,
          `Total: ${cows.toLocaleString()} + ${sheep.toLocaleString()} + ${chickens.toLocaleString()} = ${total.toLocaleString()}`,
          `Answer: ${total.toLocaleString()} animals`
        ]
      };
    }
  },

  // ========== READING / PAGES ==========
  {
    // Pages read
    generate: (difficulty) => {
      const name = pick(names);
      const bookPages = difficulty === 1 ? getRandomInt(80, 250)
        : difficulty === 2 ? getRandomInt(250, 600)
        : getRandomInt(600, 1500);
      const read = getRandomInt(Math.floor(bookPages * 0.2), Math.floor(bookPages * 0.7));
      const remaining = bookPages - read;

      return {
        questionText: `${name}'s book has ${bookPages.toLocaleString()} pages. ${name} has read ${read.toLocaleString()} pages so far. How many pages are left to read?`,
        correctAnswer: remaining,
        hintText: 'Subtract the pages already read from the total pages.',
        stepByStep: [
          `Total pages: ${bookPages.toLocaleString()}`,
          `Pages read: ${read.toLocaleString()}`,
          `Pages left: ${bookPages.toLocaleString()} - ${read.toLocaleString()} = ${remaining.toLocaleString()}`,
          `Answer: ${remaining.toLocaleString()} pages`
        ]
      };
    }
  },

  // ========== SHARING / DISTRIBUTION ==========
  {
    // Equal sharing with remainder
    generate: (difficulty) => {
      const name = pick(names);
      const sweets = ['sweets', 'chocolates', 'biscuits', 'stickers', 'pencils', 'crayons'];
      const sweet = pick(sweets);
      const friends = getRandomInt(3, 8);
      const each = difficulty === 1 ? getRandomInt(5, 20)
        : difficulty === 2 ? getRandomInt(20, 80)
        : getRandomInt(80, 200);
      const total = friends * each;

      return {
        questionText: `${name} shares ${total.toLocaleString()} ${sweet} equally among ${friends} friends. How many ${sweet} does each friend get?`,
        correctAnswer: each,
        hintText: 'Divide the total by the number of friends.',
        stepByStep: [
          `Total ${sweet}: ${total.toLocaleString()}`,
          `Number of friends: ${friends}`,
          `Each friend gets: ${total.toLocaleString()} ÷ ${friends} = ${each.toLocaleString()}`,
          `Answer: ${each.toLocaleString()} ${sweet}`
        ]
      };
    }
  },

  // ========== PERIMETER / AREA ==========
  {
    // Perimeter of a rectangle
    generate: (difficulty) => {
      const name = pick(names);
      const places = ['garden', 'playground', 'swimming pool', 'football pitch', 'car park'];
      const place = pick(places);
      const length = difficulty === 1 ? getRandomInt(10, 50)
        : difficulty === 2 ? getRandomInt(50, 200)
        : getRandomInt(200, 500);
      const width = difficulty === 1 ? getRandomInt(5, 30)
        : difficulty === 2 ? getRandomInt(30, 100)
        : getRandomInt(100, 300);
      const perimeter = 2 * (length + width);

      return {
        questionText: `${name}'s ${place} is ${length.toLocaleString()} metres long and ${width.toLocaleString()} metres wide. What is the perimeter (total distance around the edge)?`,
        correctAnswer: perimeter,
        hintText: 'Perimeter of a rectangle = 2 × (length + width)',
        stepByStep: [
          `Length: ${length.toLocaleString()} m`,
          `Width: ${width.toLocaleString()} m`,
          `Length + Width: ${length.toLocaleString()} + ${width.toLocaleString()} = ${(length + width).toLocaleString()} m`,
          `Perimeter: 2 × ${(length + width).toLocaleString()} = ${perimeter.toLocaleString()} m`,
          `Answer: ${perimeter.toLocaleString()} metres`
        ]
      };
    }
  },

  // ========== MULTI-STEP WITH MULTIPLICATION ==========
  {
    // Buying multiple items
    generate: (difficulty) => {
      const name = pick(names);
      const items = ['tickets', 'pizzas', 'books', 'T-shirts', 'hats', 'toys', 'plants'];
      const item = pick(items);
      const qty = difficulty === 1 ? getRandomInt(2, 6)
        : difficulty === 2 ? getRandomInt(6, 15)
        : getRandomInt(15, 30);
      const priceEach = difficulty === 1 ? getRandomInt(3, 20)
        : difficulty === 2 ? getRandomInt(20, 80)
        : getRandomInt(80, 300);
      const total = qty * priceEach;

      return {
        questionText: `${name} bought ${qty} ${item} at $${priceEach.toLocaleString()} each. How much did ${name} spend in total?`,
        correctAnswer: total,
        hintText: 'Multiply the price by the quantity.',
        stepByStep: [
          `Number of ${item}: ${qty}`,
          `Price each: $${priceEach.toLocaleString()}`,
          `Total: ${qty} × $${priceEach.toLocaleString()} = $${total.toLocaleString()}`,
          `Answer: $${total.toLocaleString()}`
        ]
      };
    }
  },

  // ========== HOLIDAY / TRAVEL COSTS ==========
  {
    // Holiday total costs
    generate: (difficulty) => {
      const name = pick(names);
      const flights = difficulty === 1 ? getRandomInt(100, 500)
        : difficulty === 2 ? getRandomInt(500, 2500)
        : getRandomInt(2500, 8000);
      const hotel = difficulty === 1 ? getRandomInt(80, 400)
        : difficulty === 2 ? getRandomInt(400, 2000)
        : getRandomInt(2000, 6000);
      const food = difficulty === 1 ? getRandomInt(50, 200)
        : difficulty === 2 ? getRandomInt(200, 800)
        : getRandomInt(800, 3000);
      const activities = difficulty === 1 ? getRandomInt(30, 150)
        : difficulty === 2 ? getRandomInt(150, 600)
        : getRandomInt(600, 2000);
      const total = flights + hotel + food + activities;

      return {
        questionText: `${name}'s holiday costs were: flights $${flights.toLocaleString()}, hotel $${hotel.toLocaleString()}, food $${food.toLocaleString()}, and activities $${activities.toLocaleString()}. What was the total holiday cost?`,
        correctAnswer: total,
        hintText: 'Add up all four costs.',
        stepByStep: [
          `Flights: $${flights.toLocaleString()}`,
          `Hotel: $${hotel.toLocaleString()}`,
          `Food: $${food.toLocaleString()}`,
          `Activities: $${activities.toLocaleString()}`,
          `Total: $${flights.toLocaleString()} + $${hotel.toLocaleString()} + $${food.toLocaleString()} + $${activities.toLocaleString()} = $${total.toLocaleString()}`,
          `Answer: $${total.toLocaleString()}`
        ]
      };
    }
  },

  // ========== MULTI-STEP: EARN THEN SPEND ==========
  {
    // Earn and spend
    generate: (difficulty) => {
      const name = pick(names);
      const jobs = ['mowing lawns', 'walking dogs', 'washing cars', 'babysitting', 'helping neighbours', 'selling lemonade'];
      const job = pick(jobs);
      const earned = difficulty === 1 ? getRandomInt(20, 100)
        : difficulty === 2 ? getRandomInt(100, 500)
        : getRandomInt(500, 2000);
      const spent = getRandomInt(Math.floor(earned * 0.2), Math.floor(earned * 0.6));
      const remaining = earned - spent;

      return {
        questionText: `${name} earned $${earned.toLocaleString()} from ${job}. ${name} then spent $${spent.toLocaleString()} on supplies. How much money does ${name} have left?`,
        correctAnswer: remaining,
        hintText: 'Subtract what was spent from what was earned.',
        stepByStep: [
          `Earned: $${earned.toLocaleString()}`,
          `Spent: $${spent.toLocaleString()}`,
          `Remaining: $${earned.toLocaleString()} - $${spent.toLocaleString()} = $${remaining.toLocaleString()}`,
          `Answer: $${remaining.toLocaleString()}`
        ]
      };
    }
  },

  // ========== MULTI-STEP: TWO PARTS + COMBINE ==========
  {
    // Morning and afternoon sales
    generate: (difficulty) => {
      const name = pick(names);
      const products = ['cakes', 'sandwiches', 'drinks', 'cookies', 'muffins', 'pies', 'wraps'];
      const product = pick(products);
      const morning = difficulty === 1 ? getRandomInt(20, 100)
        : difficulty === 2 ? getRandomInt(100, 500)
        : getRandomInt(500, 2000);
      const afternoon = difficulty === 1 ? getRandomInt(15, 80)
        : difficulty === 2 ? getRandomInt(80, 400)
        : getRandomInt(400, 1500);
      const leftover = getRandomInt(Math.floor((morning + afternoon) * 0.05), Math.floor((morning + afternoon) * 0.15));
      const totalSold = morning + afternoon - leftover;

      return {
        questionText: `${name}'s bakery made ${morning.toLocaleString()} ${product} in the morning and ${afternoon.toLocaleString()} in the afternoon. ${leftover.toLocaleString()} ${product} were left unsold. How many ${product} were sold?`,
        correctAnswer: totalSold,
        hintText: 'Add the morning and afternoon amounts, then subtract the unsold.',
        stepByStep: [
          `Morning: ${morning.toLocaleString()}`,
          `Afternoon: ${afternoon.toLocaleString()}`,
          `Total made: ${morning.toLocaleString()} + ${afternoon.toLocaleString()} = ${(morning + afternoon).toLocaleString()}`,
          `Unsold: ${leftover.toLocaleString()}`,
          `Sold: ${(morning + afternoon).toLocaleString()} - ${leftover.toLocaleString()} = ${totalSold.toLocaleString()}`,
          `Answer: ${totalSold.toLocaleString()} ${product}`
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
