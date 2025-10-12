import React, { useState } from 'react';
import { QuizSettings, Operation, OperationRanges } from '../types';
import { sessionStorageUtils } from '../utils/sessionStorage';
import { urlUtils } from '../utils/urlUtils';
import QRCodeGenerator from './QRCodeGenerator';
import SessionHistory from './SessionHistory';

interface SetupScreenProps {
  onStartQuiz: (settings: QuizSettings) => void;
  onLoadSession?: (sessionId: string) => void;
}

const OperationButton: React.FC<{
  op: Operation;
  label: string;
  icon: string;
  selected: boolean;
  onClick: (op: Operation) => void;
}> = ({ op, label, icon, selected, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(op)}
      className={`flex-1 flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all duration-200 ${
        selected
          ? 'bg-sky-500 border-sky-400 text-white shadow-lg scale-105'
          : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500'
      }`}
    >
      <span className="text-3xl">{icon}</span>
      <span className="mt-2 font-semibold">{label}</span>
    </button>
  );
};

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartQuiz, onLoadSession }) => {
  const [lowerBound1, setLowerBound1] = useState<number>(1);
  const [upperBound1, setUpperBound1] = useState<number>(10);
  const [lowerBound2, setLowerBound2] = useState<number>(1);
  const [upperBound2, setUpperBound2] = useState<number>(10);
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [selectedOps, setSelectedOps] = useState<Operation[]>([Operation.Addition, Operation.Subtraction]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [customMode, setCustomMode] = useState<boolean>(false);
  const [shareableUrl, setShareableUrl] = useState<string>('');
  const [showUrlSection, setShowUrlSection] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  
  // Initialize operation ranges with default values
  const [operationRanges, setOperationRanges] = useState<Partial<OperationRanges>>({
    [Operation.Addition]: { lowerBound1: 1, upperBound1: 10, lowerBound2: 1, upperBound2: 10 },
    [Operation.Subtraction]: { lowerBound1: 1, upperBound1: 10, lowerBound2: 1, upperBound2: 10 },
    [Operation.Multiplication]: { lowerBound1: 1, upperBound1: 10, lowerBound2: 1, upperBound2: 10 },
    [Operation.Division]: { lowerBound1: 1, upperBound1: 10, lowerBound2: 1, upperBound2: 10 },
    [Operation.FractionEquivalents]: { lowerBound1: 1, upperBound1: 6, lowerBound2: 2, upperBound2: 12 },
    [Operation.FractionAddition]: { lowerBound1: 1, upperBound1: 8, lowerBound2: 2, upperBound2: 12 },
    [Operation.FractionMultiplication]: { lowerBound1: 1, upperBound1: 6, lowerBound2: 2, upperBound2: 8 },
    [Operation.FractionDivision]: { lowerBound1: 1, upperBound1: 6, lowerBound2: 2, upperBound2: 8 },
    [Operation.GroupingToTarget]: { lowerBound1: 100, upperBound1: 1000, lowerBound2: 1, upperBound2: 99 },
    [Operation.GroupingByTensHundreds]: { lowerBound1: 10, upperBound1: 90, lowerBound2: 100, upperBound2: 900 },
  });

  const handleClearSession = () => {
    sessionStorageUtils.clearSession();
    window.location.reload(); // Reload to ensure clean state
  };

  const handleOperationToggle = (op: Operation) => {
    setSelectedOps((prev) =>
      prev.includes(op) ? prev.filter((o) => o !== op) : [...prev, op]
    );
  };

  const updateOperationRange = (operation: Operation, field: string, value: number) => {
    setOperationRanges(prev => ({
      ...prev,
      [operation]: {
        ...prev[operation]!,
        [field]: value
      }
    }));
  };

  const getOperationLabel = (op: Operation): string => {
    switch (op) {
      case Operation.Addition: return 'Addition';
      case Operation.Subtraction: return 'Subtraction';
      case Operation.Multiplication: return 'Multiplication';
      case Operation.Division: return 'Division';
      case Operation.FractionEquivalents: return 'Fraction Equivalents';
      case Operation.FractionAddition: return 'Fraction Addition';
      case Operation.FractionMultiplication: return 'Fraction Multiplication';
      case Operation.FractionDivision: return 'Fraction Division';
      case Operation.GroupingToTarget: return 'Grouping to Target';
      case Operation.GroupingByTensHundreds: return 'Grouping by 10s/100s';
      default: return '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOps.length === 0) {
      setError('Please select at least one operation.');
      return;
    }
    
    if (customMode) {
      // Validate custom ranges for each selected operation
      for (const op of selectedOps) {
        const ranges = operationRanges[op];
        if (!ranges || ranges.lowerBound1 >= ranges.upperBound1 || ranges.lowerBound2 >= ranges.upperBound2) {
          setError(`Invalid ranges for ${getOperationLabel(op)}. Lower bounds must be less than upper bounds.`);
          return;
        }
      }
    } else {
      // Validate global ranges
      if (lowerBound1 >= upperBound1 || lowerBound2 >= upperBound2) {
        setError('Lower bound must be less than its corresponding upper bound.');
        return;
      }
    }
    
    setError('');
    onStartQuiz({
      lowerBound1,
      upperBound1,
      lowerBound2,
      upperBound2,
      numQuestions,
      operations: selectedOps,
      soundEnabled,
      customMode,
      operationRanges: customMode ? operationRanges : undefined,
    });
  };

  const generateShareableLink = () => {
    if (selectedOps.length === 0) {
      setError('Please select at least one operation to generate a link.');
      return;
    }
    
    if (customMode) {
      // Validate custom ranges for each selected operation
      for (const op of selectedOps) {
        const ranges = operationRanges[op];
        if (!ranges || ranges.lowerBound1 >= ranges.upperBound1 || ranges.lowerBound2 >= ranges.upperBound2) {
          setError(`Invalid ranges for ${getOperationLabel(op)}. Lower bounds must be less than upper bounds.`);
          return;
        }
      }
    } else {
      // Validate global ranges
      if (lowerBound1 >= upperBound1 || lowerBound2 >= upperBound2) {
        setError('Lower bound must be less than its corresponding upper bound.');
        return;
      }
    }
    
    setError('');
    
    const settings: QuizSettings = {
      lowerBound1,
      upperBound1,
      lowerBound2,
      upperBound2,
      numQuestions,
      operations: selectedOps,
      soundEnabled,
      customMode,
      operationRanges: customMode ? operationRanges : undefined,
    };
    
    const url = urlUtils.generateShareableUrl(settings);
    setShareableUrl(url);
    setShowUrlSection(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      // Show success feedback
      const button = document.getElementById('copy-button');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleLoadSession = (sessionId: string) => {
    setShowHistory(false);
    if (onLoadSession) {
      onLoadSession(sessionId);
    }
  const loadPreset = (presetUrl: string) => {
    // Extract the 'q' parameter from the URL
    const url = new URL(presetUrl);
    const params = new URLSearchParams(url.search);
    const encodedSettings = params.get('q');
    
    if (!encodedSettings) {
      setError('Invalid preset URL');
      return;
    }
    
    // Decode the settings
    const settings = urlUtils.decodeQuizSettings(encodedSettings);
    
    if (!settings) {
      setError('Failed to decode preset settings');
      return;
    }
    
    // Apply the settings
    setSelectedOps(settings.operations);
    setNumQuestions(settings.numQuestions);
    setLowerBound1(settings.lowerBound1);
    setUpperBound1(settings.upperBound1);
    setLowerBound2(settings.lowerBound2);
    setUpperBound2(settings.upperBound2);
    setSoundEnabled(settings.soundEnabled ?? true);
    setCustomMode(settings.customMode ?? false);
    
    if (settings.customMode && settings.operationRanges) {
      setOperationRanges(settings.operationRanges);
    }
    
    setError('');
    // Show a success message
    const message = '✓ Preset loaded successfully!';
    setError('');
    // Could add a success toast here, but for simplicity we'll just clear any errors
  };

  return (
    <div className="animate-fade-in">
      {showHistory && (
        <SessionHistory
          onLoadSession={handleLoadSession}
          onClose={() => setShowHistory(false)}
        />
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-200">Create Your Quiz</h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="text-sm text-sky-400 hover:text-sky-300 transition-colors duration-200"
          >
            📚 View History
          </button>
          <button
            type="button"
            onClick={handleClearSession}
            className="text-sm text-slate-400 hover:text-red-400 transition-colors duration-200"
          >
            Clear Saved Session
          </button>
        </div>
      </div>
      
      {/* Preset Settings Section */}
      <div className="mb-6 p-4 bg-gradient-to-r from-sky-900/30 to-purple-900/30 border-2 border-sky-500/30 rounded-lg">
        <h3 className="text-lg font-semibold text-sky-300 mb-3 text-center">Quick Start Presets</h3>
        <p className="text-sm text-slate-400 mb-4 text-center">
          Load pre-configured quiz settings with one click
        </p>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => loadPreset('https://mawroos.github.io/kids-math-challenger/?q=mV_bM_b_k_b_k_b_b_a_p_bM_p_bM_b_E_bs_u_bC_c_d_h_d_m_e_b_g_c_Y_i_bM_qi_b_bL_j_k_bC_bM_oG')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <span className="text-xl">⭐</span>
            <span>Samo Nova</span>
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Global Ranges - only show when custom mode is off */}
        {!customMode && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="lowerBound1" className="block text-sm font-medium text-slate-400 mb-2">First Number (Lower)</label>
              <input
                id="lowerBound1"
                type="number"
                value={lowerBound1}
                onChange={(e) => setLowerBound1(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="upperBound1" className="block text-sm font-medium text-slate-400 mb-2">First Number (Upper)</label>
              <input
                id="upperBound1"
                type="number"
                value={upperBound1}
                onChange={(e) => setUpperBound1(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                min={lowerBound1 + 1}
              />
            </div>
             <div>
              <label htmlFor="lowerBound2" className="block text-sm font-medium text-slate-400 mb-2">Second Number (Lower)</label>
              <input
                id="lowerBound2"
                type="number"
                value={lowerBound2}
                onChange={(e) => setLowerBound2(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="upperBound2" className="block text-sm font-medium text-slate-400 mb-2">Second Number (Upper)</label>
              <input
                id="upperBound2"
                type="number"
                value={upperBound2}
                onChange={(e) => setUpperBound2(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                min={lowerBound2 + 1}
              />
            </div>
          </div>
        )}
        <div>
          <label htmlFor="numQuestions" className="block text-sm font-medium text-slate-400 mb-2">Number of Questions</label>
          <input
            id="numQuestions"
            type="number"
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value, 10) || 1)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            min="1"
            max="500"
          />
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3 text-center">Select Operations</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            <OperationButton op={Operation.Addition} label="Add" icon="+" selected={selectedOps.includes(Operation.Addition)} onClick={handleOperationToggle} />
            <OperationButton op={Operation.Subtraction} label="Subtract" icon="-" selected={selectedOps.includes(Operation.Subtraction)} onClick={handleOperationToggle} />
            <OperationButton op={Operation.Multiplication} label="Multiply" icon="×" selected={selectedOps.includes(Operation.Multiplication)} onClick={handleOperationToggle} />
            <OperationButton op={Operation.Division} label="Divide" icon="÷" selected={selectedOps.includes(Operation.Division)} onClick={handleOperationToggle} />
            <OperationButton op={Operation.FractionEquivalents} label="Equivalents" icon="½" selected={selectedOps.includes(Operation.FractionEquivalents)} onClick={handleOperationToggle} />
            <OperationButton op={Operation.FractionAddition} label="Frac +" icon="⅓" selected={selectedOps.includes(Operation.FractionAddition)} onClick={handleOperationToggle} />
            <OperationButton op={Operation.FractionMultiplication} label="Frac ×" icon="¼" selected={selectedOps.includes(Operation.FractionMultiplication)} onClick={handleOperationToggle} />
            <OperationButton op={Operation.FractionDivision} label="Frac ÷" icon="⅕" selected={selectedOps.includes(Operation.FractionDivision)} onClick={handleOperationToggle} />
            <OperationButton op={Operation.GroupingToTarget} label="Grouping" icon="🎯" selected={selectedOps.includes(Operation.GroupingToTarget)} onClick={handleOperationToggle} />
            <OperationButton op={Operation.GroupingByTensHundreds} label="10s/100s" icon="💯" selected={selectedOps.includes(Operation.GroupingByTensHundreds)} onClick={handleOperationToggle} />
          </div>
          {selectedOps.includes(Operation.FractionEquivalents) && (
            <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-300 text-center">
                <span className="font-semibold text-sky-400">Fraction equivalents:</span> Find equivalent fractions by determining missing numerators or denominators.
                <br />
                <span className="text-slate-400 text-xs">Example: ½ = ?/4 (answer: 2)</span>
              </p>
            </div>
          )}
          {selectedOps.includes(Operation.FractionAddition) && (
            <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-300 text-center">
                <span className="font-semibold text-blue-400">Fraction addition:</span> Add fractions with same denominators.
                <br />
                <span className="text-slate-400 text-xs">Example: ⅓ + ⅓ = ?/3 (answer: 2)</span>
              </p>
            </div>
          )}
          {selectedOps.includes(Operation.FractionMultiplication) && (
            <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-300 text-center">
                <span className="font-semibold text-orange-400">Fraction multiplication:</span> Multiply fractions and simplify results.
                <br />
                <span className="text-slate-400 text-xs">Example: ½ × ⅓ = ?/6 (answer: 1)</span>
              </p>
            </div>
          )}
          {selectedOps.includes(Operation.FractionDivision) && (
            <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-300 text-center">
                <span className="font-semibold text-red-400">Fraction division:</span> Divide fractions using the multiply-by-reciprocal rule.
                <br />
                <span className="text-slate-400 text-xs">Example: ½ ÷ ¼ = ?/1 (answer: 2)</span>
              </p>
            </div>
          )}
          {selectedOps.includes(Operation.GroupingToTarget) && (
            <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-300 text-center">
                <span className="font-semibold text-green-400">Grouping questions:</span> Find missing numbers to reach target values.
                <br />
                <span className="text-slate-400 text-xs">Example: 52 + ? = 100 (answer: 48)</span>
              </p>
            </div>
          )}
          {selectedOps.includes(Operation.GroupingByTensHundreds) && (
            <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-300 text-center">
                <span className="font-semibold text-purple-400">10s/100s grouping:</span> Find missing multiples of 10 or 100 to reach 100 or 1000.
                <br />
                <span className="text-slate-400 text-xs">Examples: 20 + ? = 100 (answer: 80), 300 + ? = 1000 (answer: 700)</span>
              </p>
            </div>
          )}
        </div>

        {/* Custom Mode Toggle */}
        <div className="flex items-center justify-center space-x-3 py-2">
          <label htmlFor="customModeToggle" className="text-sm font-medium text-slate-400">
            Custom Ranges per Operation
          </label>
          <button
            type="button"
            id="customModeToggle"
            onClick={() => setCustomMode(!customMode)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              customMode ? 'bg-sky-500' : 'bg-slate-600'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                customMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-sm text-slate-500">
            {customMode ? 'On' : 'Off'}
          </span>
        </div>
        
        {customMode && (
          <div className="mt-2 p-3 bg-slate-700/30 rounded-lg">
            <p className="text-sm text-slate-300 text-center">
              <span className="font-semibold text-sky-400">Custom Mode:</span> Set different number ranges for each selected operation.
              <br />
              <span className="text-slate-400 text-xs">Each operation will use its own min/max values for generating questions.</span>
            </p>
          </div>
        )}

        {/* Custom Ranges Section */}
        {customMode && selectedOps.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200 text-center">Custom Ranges per Operation</h3>
            {selectedOps.map((op) => {
              const ranges = operationRanges[op]!;
              return (
                <div key={op} className="bg-slate-700/30 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-slate-300 mb-3 text-center">{getOperationLabel(op)}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        {op === Operation.GroupingToTarget ? 'Target Value (Lower)' : 
                         op === Operation.GroupingByTensHundreds ? 'For 100 (10s Lower)' : 'First Number (Lower)'}
                      </label>
                      <input
                        type="number"
                        value={ranges.lowerBound1}
                        onChange={(e) => updateOperationRange(op, 'lowerBound1', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        {op === Operation.GroupingToTarget ? 'Target Value (Upper)' : 
                         op === Operation.GroupingByTensHundreds ? 'For 100 (10s Upper)' : 'First Number (Upper)'}
                      </label>
                      <input
                        type="number"
                        value={ranges.upperBound1}
                        onChange={(e) => updateOperationRange(op, 'upperBound1', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        min={ranges.lowerBound1 + 1}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        {op === Operation.FractionEquivalents ? 'Multiplier (Lower)' : 
                         op === Operation.GroupingToTarget ? 'Known Number (Lower)' :
                         op === Operation.GroupingByTensHundreds ? 'For 1000 (100s Lower)' : 'Second Number (Lower)'}
                      </label>
                      <input
                        type="number"
                        value={ranges.lowerBound2}
                        onChange={(e) => updateOperationRange(op, 'lowerBound2', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        min={op === Operation.FractionEquivalents || op === Operation.FractionAddition || op === Operation.FractionMultiplication || op === Operation.FractionDivision ? 2 : 0}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        {op === Operation.FractionEquivalents ? 'Denominator (Upper)' : 
                         op === Operation.GroupingToTarget ? 'Known Number (Upper)' :
                         op === Operation.GroupingByTensHundreds ? 'For 1000 (100s Upper)' : 'Second Number (Upper)'}
                      </label>
                      <input
                        type="number"
                        value={ranges.upperBound2}
                        onChange={(e) => updateOperationRange(op, 'upperBound2', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        min={ranges.lowerBound2 + 1}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-center space-x-3 py-2">
          <label htmlFor="soundToggle" className="text-sm font-medium text-slate-400">
            Sound Effects
          </label>
          <button
            type="button"
            id="soundToggle"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              soundEnabled ? 'bg-sky-500' : 'bg-slate-600'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-sm text-slate-500">
            {soundEnabled ? 'On' : 'Off'}
          </span>
        </div>

        {error && <p className="text-red-400 text-center">{error}</p>}
        
        {/* Shareable Link Section */}
        <div className="border-t border-slate-700 pt-6">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={generateShareableLink}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
            >
              🔗 Generate Shareable Link
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
            >
              ▶️ Start Quiz
            </button>
          </div>
        </div>

        {/* URL Display Section */}
        {showUrlSection && shareableUrl && (
          <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Shareable Quiz Link:</h3>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={shareableUrl}
                readOnly
                className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-300 font-mono"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                id="copy-button"
                type="button"
                onClick={copyToClipboard}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Copy
              </button>
            </div>
            
            <div className="border-t border-slate-600 pt-4">
              <div className="grid lg:grid-cols-1 gap-6 items-start">
               
                  <p className="text-xs text-slate-400 mb-2">
                    Share this link with others to start a quiz with these exact settings!
                  </p>
                  <p className="text-xs text-slate-500">
                    💡 <strong>Tip:</strong> The QR code is perfect for quickly sharing with mobile devices or projecting in classrooms.
                  </p>
                
                
                <div className="flex justify-center items-center">
                  <div className="w-full max-w-lg flex justify-center">
                    <QRCodeGenerator 
                      url={shareableUrl} 
                      size={500}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="pt-4">
        </div>
      </form>
    </div>
  );
};

export default SetupScreen;
