import React from 'react';

interface MathRendererProps {
  expression: string;
  className?: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ expression, className = '' }) => {
  // Simple fraction renderer for expressions like \frac{1}{2} = \frac{?}{4}
  const renderFraction = (expr: string) => {
    // First, replace LaTeX symbols with their Unicode equivalents
    let processedExpr = expr
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\cdot/g, '·');
    
    const fractionMatch = processedExpr.match(/\\frac\{([^}]+)\}\{([^}]+)\}/g);
    
    if (!fractionMatch) {
      return <span className="text-xl">{processedExpr}</span>;
    }

    const parts = processedExpr.split(/\\frac\{[^}]+\}\{[^}]+\}/);
    const fractions = fractionMatch.map((match, index) => {
      const numeratorMatch = match.match(/\\frac\{([^}]+)\}/);
      const denominatorMatch = match.match(/\}\{([^}]+)\}/);
      
      const numerator = numeratorMatch ? numeratorMatch[1] : '';
      const denominator = denominatorMatch ? denominatorMatch[1] : '';
      
      return (
        <span key={`fraction-${index}`} className="inline-flex flex-col items-center mx-2 bg-slate-700/50 rounded px-3 py-2">
          <span className="text-xl leading-tight border-b-2 border-slate-300 px-2 pb-1">
            {numerator === '?' ? <span className="text-sky-400 font-bold text-2xl">?</span> : numerator}
          </span>
          <span className="text-xl leading-tight px-2 pt-1">
            {denominator === '?' ? <span className="text-sky-400 font-bold text-2xl">?</span> : denominator}
          </span>
        </span>
      );
    });

    // Interleave parts and fractions
    const result = [];
    for (let i = 0; i < Math.max(parts.length, fractions.length); i++) {
      if (i < parts.length && parts[i]) {
        result.push(<span key={`part-${i}`} className="text-xl mx-1">{parts[i]}</span>);
      }
      if (i < fractions.length) {
        result.push(fractions[i]);
      }
    }

    return <div className={`flex items-center justify-start ${className}`}>{result}</div>;
  };

  return renderFraction(expression);
};

export default MathRenderer;
