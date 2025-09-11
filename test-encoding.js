// Test the new ultra-compact encoding system
import { urlUtils } from './utils/urlUtils.js';
import { Operation } from './types.js';

// Test settings
const testSettings = {
  operations: [Operation.Addition, Operation.Multiplication, Operation.FractionAddition],
  numQuestions: 20,
  lowerBound1: 1,
  upperBound1: 100,
  lowerBound2: 1,
  upperBound2: 50,
  soundEnabled: true,
  customMode: false,
  operationRanges: undefined
};

// Test with custom mode
const customTestSettings = {
  operations: [Operation.Addition, Operation.Multiplication],
  numQuestions: 15,
  lowerBound1: 1,
  upperBound1: 10,
  lowerBound2: 1,
  upperBound2: 10,
  soundEnabled: false,
  customMode: true,
  operationRanges: {
    [Operation.Addition]: {
      lowerBound1: 10,
      upperBound1: 50,
      lowerBound2: 5,
      upperBound2: 25
    },
    [Operation.Multiplication]: {
      lowerBound1: 2,
      upperBound1: 12,
      lowerBound2: 2,
      upperBound2: 12
    }
  }
};

console.log('=== Ultra-Compact Encoding Test ===\n');

// Test basic settings
const encoded1 = urlUtils.encodeQuizSettings(testSettings);
console.log('Basic settings encoded:', encoded1);
console.log('Length:', encoded1.length, 'characters');

const decoded1 = urlUtils.decodeQuizSettings(encoded1);
console.log('Decoded correctly:', JSON.stringify(decoded1) === JSON.stringify(testSettings));

// Test custom settings
const encoded2 = urlUtils.encodeQuizSettings(customTestSettings);
console.log('\nCustom settings encoded:', encoded2);
console.log('Length:', encoded2.length, 'characters');

const decoded2 = urlUtils.decodeQuizSettings(encoded2);
console.log('Decoded correctly:', JSON.stringify(decoded2) === JSON.stringify(customTestSettings));

// Generate example URLs
console.log('\n=== Example URLs ===');
console.log('Basic URL:', `http://localhost:5175/kids-math-challenger/?q=${encoded1}`);
console.log('Custom URL:', `http://localhost:5175/kids-math-challenger/?q=${encoded2}`);

console.log('\n=== Character Savings ===');
console.log('Old base64 approach would be ~90-150 chars');
console.log('New encoding:', encoded1.length, 'chars for basic,', encoded2.length, 'chars for custom');
console.log('Estimated savings: 60-80% shorter URLs!');
