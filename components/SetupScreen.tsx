import React, { useState } from 'react';
import { QuizSettings, Operation } from '../types';

interface SetupScreenProps {
  onStartQuiz: (settings: QuizSettings) => void;
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

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartQuiz }) => {
  const [lowerBound1, setLowerBound1] = useState<number>(1);
  const [upperBound1, setUpperBound1] = useState<number>(10);
  const [lowerBound2, setLowerBound2] = useState<number>(1);
  const [upperBound2, setUpperBound2] = useState<number>(10);
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [selectedOps, setSelectedOps] = useState<Operation[]>([Operation.Addition, Operation.Subtraction]);
  const [error, setError] = useState<string>('');

  const handleOperationToggle = (op: Operation) => {
    setSelectedOps((prev) =>
      prev.includes(op) ? prev.filter((o) => o !== op) : [...prev, op]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOps.length === 0) {
      setError('Please select at least one operation.');
      return;
    }
    if (lowerBound1 >= upperBound1 || lowerBound2 >= upperBound2) {
        setError('Lower bound must be less than its corresponding upper bound.');
        return;
    }
    setError('');
    onStartQuiz({
      lowerBound1,
      upperBound1,
      lowerBound2,
      upperBound2,
      numQuestions,
      operations: selectedOps,
    });
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6 text-slate-200">Create Your Quiz</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
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
        <div>
          <label htmlFor="numQuestions" className="block text-sm font-medium text-slate-400 mb-2">Number of Questions</label>
          <input
            id="numQuestions"
            type="number"
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value, 10) || 1)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            min="1"
            max="50"
          />
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3 text-center">Select Operations</h3>
          <div className="flex gap-2 md:gap-4">
            <OperationButton op={Operation.Addition} label="Add" icon="+" selected={selectedOps.includes(Operation.Addition)} onClick={handleOperationToggle} />
            <OperationButton op={Operation.Subtraction} label="Subtract" icon="-" selected={selectedOps.includes(Operation.Subtraction)} onClick={handleOperationToggle} />
            <OperationButton op={Operation.Multiplication} label="Multiply" icon="×" selected={selectedOps.includes(Operation.Multiplication)} onClick={handleOperationToggle} />
            <OperationButton op={Operation.Division} label="Divide" icon="÷" selected={selectedOps.includes(Operation.Division)} onClick={handleOperationToggle} />
          </div>
        </div>

        {error && <p className="text-red-400 text-center">{error}</p>}
        
        <div className="pt-4">
            <button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200">
                Start Quiz
            </button>
        </div>
      </form>
    </div>
  );
};

export default SetupScreen;