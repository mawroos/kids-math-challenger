import { QuizSettings, Operation, ProblemType } from '../types';

// Custom character set for ultra-compact encoding (62 chars: a-z, A-Z, 0-9)
const CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const BASE = CHARSET.length;

// Operation bit mapping (supports up to 32 operations)
const OPERATION_BITS = {
  [Operation.Addition]: 0,
  [Operation.Subtraction]: 1,
  [Operation.Multiplication]: 2,
  [Operation.Division]: 3,
  [Operation.FractionEquivalents]: 4,
  [Operation.FractionAddition]: 5,
  [Operation.FractionMultiplication]: 6,
  [Operation.FractionDivision]: 7,
  [Operation.GroupingToTarget]: 8,
  [Operation.GroupingByTensHundreds]: 9,
  [Operation.FactorsOf12]: 10,
  [Operation.DecimalAddition]: 11,
  [Operation.DecimalSubtraction]: 12,
  [Operation.DecimalRepresentation]: 13,
  [Operation.FractionToOne]: 14,
  [Operation.ExpandedNotation]: 15,
  [Operation.RoundingNumbers]: 16
};

const BITS_TO_OPERATION = Object.fromEntries(
  Object.entries(OPERATION_BITS).map(([key, value]) => [value, key])
);

// Problem type bit mapping
const PROBLEM_TYPE_BITS: Record<string, number> = {
  'word-problem': 0,
  'column-calculation': 1,
  'money-problem': 2,
  'missing-number': 3
};

const BITS_TO_PROBLEM_TYPE = Object.fromEntries(
  Object.entries(PROBLEM_TYPE_BITS).map(([key, value]) => [value, key])
);

export const urlUtils = {
  // Encode number to base62 string
  encodeNumber: (num: number): string => {
    if (num === 0) return CHARSET[0];
    let result = '';
    while (num > 0) {
      result = CHARSET[num % BASE] + result;
      num = Math.floor(num / BASE);
    }
    return result;
  },

  // Decode base62 string to number
  decodeNumber: (str: string): number => {
    let result = 0;
    for (let i = 0; i < str.length; i++) {
      result = result * BASE + CHARSET.indexOf(str[i]);
    }
    return result;
  },

  // Encode quiz settings to ultra-compact string
  encodeQuizSettings: (settings: QuizSettings): string => {
    try {
      // Pack operations into a single number (4 bits each)
      let operationsBits = 0;
      settings.operations.forEach(op => {
        const bit = OPERATION_BITS[op];
        if (bit !== undefined) {
          operationsBits |= (1 << bit);
        }
      });

      // Create packed data array
      const packedData = [
        operationsBits,                    // Operations bitmap
        settings.numQuestions,             // Number of questions
        settings.lowerBound1,              // Lower bound 1
        settings.upperBound1,              // Upper bound 1
        settings.lowerBound2,              // Lower bound 2
        settings.upperBound2,              // Upper bound 2
        settings.soundEnabled ? 1 : 0      // Sound flag
      ];

      // Add custom mode flag and data
      if (settings.customMode && settings.operationRanges) {
        packedData.push(1); // Custom mode flag
        
        // Pack custom ranges - only for selected operations
        settings.operations.forEach(op => {
          const ranges = settings.operationRanges?.[op];
          if (ranges) {
            packedData.push(
              OPERATION_BITS[op],
              ranges.lowerBound1,
              ranges.upperBound1,
              ranges.lowerBound2,
              ranges.upperBound2
            );
          }
        });
      } else {
        packedData.push(0); // No custom mode
      }

      // Pack problem solving data
      if (settings.problemTypes && settings.problemTypes.length > 0) {
        let problemTypeBits = 0;
        settings.problemTypes.forEach(pt => {
          const bit = PROBLEM_TYPE_BITS[pt];
          if (bit !== undefined) {
            problemTypeBits |= (1 << bit);
          }
        });
        packedData.push(1); // Problem solving flag
        packedData.push(problemTypeBits); // Problem type bitmap
        packedData.push(settings.psNumQuestions || 10); // Number of PS questions
      } else {
        packedData.push(0); // No problem solving
      }

      // Convert each number to base62 and join with separator
      const encoded = packedData.map(num => urlUtils.encodeNumber(num)).join('_');
      
      return encoded;
    } catch (error) {
      console.error('Failed to encode quiz settings:', error);
      return '';
    }
  },

  // Decode ultra-compact string to quiz settings
  decodeQuizSettings: (encodedData: string): QuizSettings | null => {
    try {
      const parts = encodedData.split('_');
      if (parts.length < 7) return null;

      let index = 0;
      
      // Decode operations from bitmap
      const operationsBits = urlUtils.decodeNumber(parts[index++]);
      const operations: Operation[] = [];
      for (let bit = 0; bit < 17; bit++) {
        if (operationsBits & (1 << bit)) {
          const op = BITS_TO_OPERATION[bit];
          if (op) operations.push(op as Operation);
        }
      }
      
      // Decode basic settings
      const numQuestions = Math.max(1, Math.min(500, urlUtils.decodeNumber(parts[index++])));
      const lowerBound1 = Math.max(0, urlUtils.decodeNumber(parts[index++]));
      const upperBound1 = Math.max(lowerBound1 + 1, urlUtils.decodeNumber(parts[index++]));
      const lowerBound2 = Math.max(0, urlUtils.decodeNumber(parts[index++]));
      const upperBound2 = Math.max(lowerBound2 + 1, urlUtils.decodeNumber(parts[index++]));
      const soundEnabled = urlUtils.decodeNumber(parts[index++]) === 1;
      
      // Check for custom mode
      const customModeFlag = urlUtils.decodeNumber(parts[index++]);
      const customMode = customModeFlag === 1;
      
      let operationRanges;
      if (customMode && index < parts.length) {
        operationRanges = {};
        
        // Decode custom ranges
        while (index + 4 < parts.length) {
          const opBit = urlUtils.decodeNumber(parts[index++]);
          const op = BITS_TO_OPERATION[opBit] as Operation;
          
          if (op) {
            operationRanges[op] = {
              lowerBound1: urlUtils.decodeNumber(parts[index++]),
              upperBound1: urlUtils.decodeNumber(parts[index++]),
              lowerBound2: urlUtils.decodeNumber(parts[index++]),
              upperBound2: urlUtils.decodeNumber(parts[index++])
            };
          } else {
            index += 4; // Skip invalid operation data
          }
        }
      }

      // Decode problem solving data
      let problemTypes: ProblemType[] | undefined;
      let psNumQuestions: number | undefined;
      if (index < parts.length) {
        const psFlag = urlUtils.decodeNumber(parts[index++]);
        if (psFlag === 1 && index + 1 < parts.length) {
          const problemTypeBits = urlUtils.decodeNumber(parts[index++]);
          psNumQuestions = Math.max(1, Math.min(500, urlUtils.decodeNumber(parts[index++])));
          problemTypes = [];
          for (let bit = 0; bit < 8; bit++) {
            if (problemTypeBits & (1 << bit)) {
              const pt = BITS_TO_PROBLEM_TYPE[bit];
              if (pt) problemTypes.push(pt as ProblemType);
            }
          }
          if (problemTypes.length === 0) {
            problemTypes = undefined;
            psNumQuestions = undefined;
          }
        }
      }

      // Must have at least operations or problem types
      if (operations.length === 0 && (!problemTypes || problemTypes.length === 0)) return null;

      return {
        operations,
        numQuestions,
        lowerBound1,
        upperBound1,
        lowerBound2,
        upperBound2,
        soundEnabled,
        customMode,
        operationRanges,
        problemTypes,
        psNumQuestions
      };
    } catch (error) {
      console.error('Failed to decode quiz settings:', error);
      return null;
    }
  },

  // Generate a shareable URL with ultra-compact encoding
  generateShareableUrl: (settings: QuizSettings): string => {
    const baseUrl = window.location.origin + window.location.pathname;
    const encodedData = urlUtils.encodeQuizSettings(settings);
    return encodedData ? `${baseUrl}?q=${encodedData}` : baseUrl;
  },

  // Get current URL parameters
  getCurrentUrlParams: (): string => {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  },

  // Update URL without page reload
  updateUrl: (params: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const newUrl = params ? `${baseUrl}?q=${params}` : baseUrl;
    window.history.replaceState({}, '', newUrl);
  }
};
