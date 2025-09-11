import { QuizSettings, Operation } from '../types';

export const urlUtils = {
  // Encode quiz settings to URL parameters
  encodeQuizSettings: (settings: QuizSettings): string => {
    const params = new URLSearchParams();
    
    // Encode operations as comma-separated string
    params.set('ops', settings.operations.join(','));
    
    // Encode basic settings
    params.set('q', settings.numQuestions.toString());
    params.set('l1', settings.lowerBound1.toString());
    params.set('u1', settings.upperBound1.toString());
    params.set('l2', settings.lowerBound2.toString());
    params.set('u2', settings.upperBound2.toString());
    
    // Encode sound setting
    if (settings.soundEnabled !== undefined) {
      params.set('sound', settings.soundEnabled ? '1' : '0');
    }
    
    // Encode custom mode
    if (settings.customMode) {
      params.set('custom', '1');
      
      // Encode operation ranges if they exist
      if (settings.operationRanges) {
        const rangesData: any = {};
        Object.entries(settings.operationRanges).forEach(([op, ranges]) => {
          if (ranges) {
            rangesData[op] = {
              l1: ranges.lowerBound1,
              u1: ranges.upperBound1,
              l2: ranges.lowerBound2,
              u2: ranges.upperBound2
            };
          }
        });
        params.set('ranges', JSON.stringify(rangesData));
      }
    }
    
    return params.toString();
  },

  // Decode URL parameters to quiz settings
  decodeQuizSettings: (urlParams: string): QuizSettings | null => {
    try {
      const params = new URLSearchParams(urlParams);
      
      // Decode operations
      const opsParam = params.get('ops');
      if (!opsParam) return null;
      
      const operations = opsParam.split(',') as Operation[];
      
      // Validate operations
      const validOperations = Object.values(Operation);
      const validOps = operations.filter(op => validOperations.includes(op));
      if (validOps.length === 0) return null;
      
      // Decode basic settings with defaults
      const numQuestions = parseInt(params.get('q') || '10', 10);
      const lowerBound1 = parseInt(params.get('l1') || '1', 10);
      const upperBound1 = parseInt(params.get('u1') || '10', 10);
      const lowerBound2 = parseInt(params.get('l2') || '1', 10);
      const upperBound2 = parseInt(params.get('u2') || '10', 10);
      
      // Decode sound setting
      const soundParam = params.get('sound');
      const soundEnabled = soundParam ? soundParam === '1' : true;
      
      // Decode custom mode
      const customMode = params.get('custom') === '1';
      
      let operationRanges;
      if (customMode) {
        const rangesParam = params.get('ranges');
        if (rangesParam) {
          try {
            const rangesData = JSON.parse(rangesParam);
            operationRanges = {};
            Object.entries(rangesData).forEach(([op, ranges]: [string, any]) => {
              if (ranges && typeof ranges === 'object') {
                operationRanges[op as Operation] = {
                  lowerBound1: ranges.l1,
                  upperBound1: ranges.u1,
                  lowerBound2: ranges.l2,
                  upperBound2: ranges.u2
                };
              }
            });
          } catch (e) {
            console.warn('Failed to parse operation ranges from URL:', e);
          }
        }
      }
      
      return {
        operations: validOps,
        numQuestions: Math.max(1, Math.min(500, numQuestions)),
        lowerBound1: Math.max(0, lowerBound1),
        upperBound1: Math.max(lowerBound1 + 1, upperBound1),
        lowerBound2: Math.max(0, lowerBound2),
        upperBound2: Math.max(lowerBound2 + 1, upperBound2),
        soundEnabled,
        customMode,
        operationRanges
      };
    } catch (error) {
      console.error('Failed to decode quiz settings from URL:', error);
      return null;
    }
  },

  // Generate a shareable URL
  generateShareableUrl: (settings: QuizSettings): string => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = urlUtils.encodeQuizSettings(settings);
    return `${baseUrl}?${params}`;
  },

  // Get current URL parameters
  getCurrentUrlParams: (): string => {
    return window.location.search.substring(1); // Remove the '?' prefix
  },

  // Update URL without page reload
  updateUrl: (params: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const newUrl = params ? `${baseUrl}?${params}` : baseUrl;
    window.history.replaceState({}, '', newUrl);
  }
};
