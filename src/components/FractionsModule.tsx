import React, { useState } from 'react';
import { 
  Divide, 
  Sparkles, 
  Plus, 
  Trash2, 
  Calculator, 
  ArrowRight, 
  RotateCcw,
  Parentheses
} from 'lucide-react';
import { 
  gcd, 
  simplifyFraction, 
  toMixedFraction, 
  decimalToFraction,
  formatResult,
  FractionOp,
  RawFractionTerm,
  solveFractionExpressionBODMAS,
  FractionBODMASResult
} from '../utils/mathUtils';
import { useHistory } from '../context/HistoryContext';
import { NumInput } from './NumInput';

interface TermState {
  id: string;
  isMixed: boolean;
  whole: string;
  num: string;
  den: string;
  openBrackets: number;
  closeBrackets: number;
}

const DEFAULT_TERMS: TermState[] = [
  { id: '1', isMixed: false, whole: '', num: '3', den: '4', openBrackets: 0, closeBrackets: 0 },
  { id: '2', isMixed: false, whole: '', num: '2', den: '5', openBrackets: 0, closeBrackets: 0 },
];

export const FractionsModule: React.FC = () => {
  const { addHistory, setActiveModule, setInjectedExpression } = useHistory();

  const [activeTab, setActiveTab] = useState<'arithmetic' | 'simplify' | 'decimal'>('arithmetic');

  // Multi-term BODMAS Fraction State (2 to 5 terms) with Brackets
  const [terms, setTerms] = useState<TermState[]>(DEFAULT_TERMS);
  const [operators, setOperators] = useState<FractionOp[]>(['+']);

  // Simplify State
  const [simpNum, setSimpNum] = useState<string>('48');
  const [simpDen, setSimpDen] = useState<string>('64');

  // Decimal to Fraction State
  const [decInput, setDecInput] = useState<string>('0.625');

  const handleSendToCalc = (val: string) => {
    setInjectedExpression(val);
    setActiveModule('standard');
  };

  // Add term up to 5
  const handleAddTerm = () => {
    if (terms.length >= 5) return;
    const newId = `${Date.now()}-${terms.length + 1}`;
    setTerms([...terms, { id: newId, isMixed: false, whole: '', num: '1', den: '2', openBrackets: 0, closeBrackets: 0 }]);
    setOperators([...operators, '+']);
  };

  // Remove term down to 2
  const handleRemoveTerm = (index: number) => {
    if (terms.length <= 2) return;
    const nextTerms = terms.filter((_, i) => i !== index);
    const nextOps = operators.filter((_, i) => (index === 0 ? i !== 0 : i !== index - 1));
    setTerms(nextTerms);
    setOperators(nextOps);
  };

  // Set term count directly (2, 3, 4, 5)
  const handleSetTermCount = (count: number) => {
    if (count < 2 || count > 5) return;
    if (count === terms.length) return;

    if (count > terms.length) {
      const addedCount = count - terms.length;
      const newTerms: TermState[] = [];
      const newOps: FractionOp[] = [];
      for (let i = 0; i < addedCount; i++) {
        newTerms.push({
          id: `${Date.now()}-${terms.length + i + 1}`,
          isMixed: false,
          whole: '',
          num: `${i + 1}`,
          den: `${i + 2}`,
          openBrackets: 0,
          closeBrackets: 0,
        });
        newOps.push(i % 2 === 0 ? '×' : '+');
      }
      setTerms([...terms, ...newTerms]);
      setOperators([...operators, ...newOps]);
    } else {
      setTerms(terms.slice(0, count));
      setOperators(operators.slice(0, count - 1));
    }
  };

  const handleUpdateTerm = (index: number, updates: Partial<TermState>) => {
    setTerms(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const toggleOpenBracket = (index: number) => {
    setTerms(prev => {
      const next = [...prev];
      const cur = next[index].openBrackets || 0;
      next[index] = { ...next[index], openBrackets: cur > 0 ? cur - 1 : cur + 1 };
      return next;
    });
  };

  const toggleCloseBracket = (index: number) => {
    setTerms(prev => {
      const next = [...prev];
      const cur = next[index].closeBrackets || 0;
      next[index] = { ...next[index], closeBrackets: cur > 0 ? cur - 1 : cur + 1 };
      return next;
    });
  };

  const handleClearAllBrackets = () => {
    setTerms(prev => prev.map(t => ({ ...t, openBrackets: 0, closeBrackets: 0 })));
  };

  const handleWrapFirstTwo = () => {
    if (terms.length >= 2) {
      setTerms(prev => prev.map((t, idx) => {
        if (idx === 0) return { ...t, openBrackets: 1, closeBrackets: 0 };
        if (idx === 1) return { ...t, openBrackets: 0, closeBrackets: 1 };
        return { ...t, openBrackets: 0, closeBrackets: 0 };
      }));
    }
  };

  const handleUpdateOperator = (index: number, op: FractionOp) => {
    setOperators(prev => {
      const next = [...prev];
      next[index] = op;
      return next;
    });
  };

  const handleResetTerms = () => {
    setTerms([
      { id: '1', isMixed: false, whole: '', num: '3', den: '4', openBrackets: 0, closeBrackets: 0 },
      { id: '2', isMixed: false, whole: '', num: '2', den: '5', openBrackets: 0, closeBrackets: 0 },
    ]);
    setOperators(['+']);
  };

  // Evaluate BODMAS fractions with Brackets
  const evaluateBODMAS = (): { res?: FractionBODMASResult; error?: string } => {
    try {
      const rawTerms: RawFractionTerm[] = terms.map(t => ({
        id: t.id,
        isMixed: t.isMixed,
        whole: t.whole,
        num: t.num,
        den: t.den,
        openBrackets: t.openBrackets,
        closeBrackets: t.closeBrackets,
      }));

      const res = solveFractionExpressionBODMAS(rawTerms, operators);
      return { res };
    } catch (err: any) {
      return { error: err.message || 'Error evaluating fractions' };
    }
  };

  const bodmasResult = evaluateBODMAS();

  // Simplification evaluation
  const calculateSimplification = () => {
    const n = parseInt(simpNum, 10) || 0;
    const d = parseInt(simpDen, 10) || 1;
    if (d === 0) return { error: 'Denominator cannot be 0' };

    const common = gcd(n, d);
    const simplified = simplifyFraction(n, d);
    const mixed = toMixedFraction(n, d);
    const decimal = n / d;
    const percent = (decimal * 100).toFixed(2);

    return { n, d, gcdVal: common, simplified, mixed, decimal, percent };
  };

  const simp = calculateSimplification();

  // Decimal to Fraction
  const calculateDecToFrac = () => {
    const val = parseFloat(decInput);
    if (isNaN(val)) return { error: 'Invalid decimal number' };
    const frac = decimalToFraction(val);
    const mixed = toMixedFraction(frac.numerator, frac.denominator);
    return { decimal: val, frac, mixed };
  };

  const dec = calculateDecToFrac();

  const handleSaveHistory = () => {
    if (activeTab === 'arithmetic' && bodmasResult.res) {
      const { formattedExpression, resultFraction, decimal, mixed } = bodmasResult.res;
      addHistory({
        type: 'fraction',
        expression: `${formattedExpression} [BODMAS]`,
        result: `${resultFraction.numerator}/${resultFraction.denominator}`,
        details: `Dec: ${formatResult(decimal)}, Mixed: ${mixed.whole !== 0 ? mixed.whole + ' ' : ''}${mixed.numerator}/${mixed.denominator}`,
      });
    } else if (activeTab === 'simplify' && simp.simplified) {
      addHistory({
        type: 'fraction',
        expression: `Simplify ${simp.n}/${simp.d}`,
        result: `${simp.simplified.numerator}/${simp.simplified.denominator}`,
        details: `GCD: ${simp.gcdVal}, Decimal: ${formatResult(simp.decimal)}`,
      });
    } else if (activeTab === 'decimal' && dec.frac) {
      addHistory({
        type: 'fraction',
        expression: `Decimal ${dec.decimal}`,
        result: `${dec.frac.numerator}/${dec.frac.denominator}`,
        details: dec.mixed?.whole ? `Mixed: ${dec.mixed.whole} ${dec.mixed.numerator}/${dec.mixed.denominator}` : undefined,
      });
    }
  };

  const hasAnyBrackets = terms.some(t => (t.openBrackets || 0) > 0 || (t.closeBrackets || 0) > 0);

  return (
    <div id="fractions-module" className="w-full max-w-2xl mx-auto flex flex-col gap-2">
      {/* Mode Selector Header Bar */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#1C1C1E] rounded-full border border-[#2C2C2E] text-xs">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            id="tab-fraction-arithmetic"
            type="button"
            onClick={() => setActiveTab('arithmetic')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
              activeTab === 'arithmetic'
                ? 'bg-[#FF9F0A] text-white shadow-sm font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            BODMAS Brackets & Operations (2–5)
          </button>
          <button
            id="tab-fraction-simplify"
            type="button"
            onClick={() => setActiveTab('simplify')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
              activeTab === 'simplify'
                ? 'bg-[#FF9F0A] text-white shadow-sm font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Simplify / GCD
          </button>
          <button
            id="tab-fraction-decimal"
            type="button"
            onClick={() => setActiveTab('decimal')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
              activeTab === 'decimal'
                ? 'bg-[#FF9F0A] text-white shadow-sm font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Decimal ↔ Frac
          </button>
        </div>

        <button
          type="button"
          onClick={handleSaveHistory}
          className="px-2 py-0.5 rounded-full bg-[#242424] hover:bg-[#333333] text-[10px] text-[#FF9F0A] border border-[#333333] transition-colors font-bold shrink-0"
        >
          Save
        </button>
      </div>

      {/* Main Display & Input Container */}
      <div className="bg-[#1C1C1E] p-2.5 sm:p-3.5 rounded-2xl border border-[#2C2C2E] shadow-xl flex flex-col gap-2.5">
        {activeTab === 'arithmetic' && (
          <div className="flex flex-col gap-2.5">
            {/* Top Config Row: Term Count & BODMAS / Bracket Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 px-0.5 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 font-medium text-[10px]">Terms:</span>
                <div className="inline-flex bg-black rounded-md p-0.5 border border-[#2C2C2E]">
                  {[2, 3, 4, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handleSetTermCount(count)}
                      className={`px-1.5 py-0.2 rounded font-mono text-[11px] font-bold transition-all ${
                        terms.length === count
                          ? 'bg-[#FF9F0A] text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>

                {/* Bracket Preset Actions */}
                <button
                  type="button"
                  onClick={handleWrapFirstTwo}
                  title="Group first two terms with brackets"
                  className="px-1.5 py-0.5 rounded bg-[#242424] hover:bg-[#333333] text-gray-300 hover:text-white text-[10px] font-mono border border-[#2C2C2E] transition-colors"
                >
                  (T₁ op T₂)
                </button>
                {hasAnyBrackets && (
                  <button
                    type="button"
                    onClick={handleClearAllBrackets}
                    title="Clear all brackets"
                    className="px-1.5 py-0.5 rounded bg-[#242424] hover:bg-[#333333] text-gray-400 hover:text-red-400 text-[10px] border border-[#2C2C2E] transition-colors"
                  >
                    Clear ( )
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-[#FF9F0A] bg-[#FF9F0A]/10 px-1.5 py-0.2 rounded-full border border-[#FF9F0A]/30 font-mono font-medium">
                  BODMAS: [B] → ÷ → × → + → −
                </span>
                <button
                  type="button"
                  onClick={handleResetTerms}
                  title="Reset terms"
                  className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-[#242424] transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Live Interactive Math Equation Row with Brackets */}
            <div className="flex items-center gap-1.5 p-2 bg-black rounded-xl border border-[#242424] overflow-x-auto scrollbar-thin scrollbar-thumb-[#333333]">
              {terms.map((term, idx) => (
                <React.Fragment key={term.id || idx}>
                  {/* Bracket & Fraction Term Wrapper */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    {/* Left Bracket Toggle / Display */}
                    <div className="flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => toggleOpenBracket(idx)}
                        title="Toggle opening bracket '(' before this term"
                        className={`px-1 py-0.5 rounded text-xs font-mono font-bold transition-all ${
                          (term.openBrackets || 0) > 0
                            ? 'bg-[#30D158] text-black font-extrabold shadow-sm scale-105'
                            : 'text-gray-500 hover:text-white bg-[#1C1C1E] border border-[#2C2C2E]'
                        }`}
                      >
                        {term.openBrackets && term.openBrackets > 1 ? `(${term.openBrackets}` : '('}
                      </button>
                    </div>

                    {/* Fraction Term Box */}
                    <div className={`flex flex-col items-center gap-0.5 p-1 bg-[#1C1C1E] rounded-lg border transition-all ${
                      (term.openBrackets || 0) > 0 || (term.closeBrackets || 0) > 0
                        ? 'border-[#30D158]/50 bg-[#1C1C1E]'
                        : 'border-[#2C2C2E]'
                    }`}>
                      <div className="flex items-center justify-between w-full px-0.5 text-[8px] text-gray-400 font-mono">
                        <span>T{idx + 1}</span>
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateTerm(idx, { isMixed: !term.isMixed })}
                            className={`px-1 py-0.2 rounded text-[7px] font-semibold border transition-all ${
                              term.isMixed 
                                ? 'bg-[#FF9F0A]/20 text-[#FF9F0A] border-[#FF9F0A]/50' 
                                : 'text-gray-500 border-transparent hover:text-gray-300'
                            }`}
                          >
                            {term.isMixed ? 'Mix' : '+Mix'}
                          </button>
                          {terms.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTerm(idx)}
                              className="text-gray-500 hover:text-red-400 p-0.2"
                              title="Remove term"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {term.isMixed && (
                          <div className="flex flex-col items-center">
                            <NumInput
                              value={term.whole}
                              onChange={(val) => handleUpdateTerm(idx, { whole: val })}
                              placeholder="W"
                              className="w-10"
                            />
                          </div>
                        )}
                        <div className="flex flex-col items-center gap-0.5">
                          <NumInput
                            value={term.num}
                            onChange={(val) => handleUpdateTerm(idx, { num: val })}
                            className="w-11"
                          />
                          <div className="w-full h-0.5 bg-gray-500 rounded-full" />
                          <NumInput
                            value={term.den}
                            onChange={(val) => handleUpdateTerm(idx, { den: val })}
                            className="w-11"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Bracket Toggle / Display */}
                    <div className="flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => toggleCloseBracket(idx)}
                        title="Toggle closing bracket ')' after this term"
                        className={`px-1 py-0.5 rounded text-xs font-mono font-bold transition-all ${
                          (term.closeBrackets || 0) > 0
                            ? 'bg-[#30D158] text-black font-extrabold shadow-sm scale-105'
                            : 'text-gray-500 hover:text-white bg-[#1C1C1E] border border-[#2C2C2E]'
                        }`}
                      >
                        {term.closeBrackets && term.closeBrackets > 1 ? `)${term.closeBrackets}` : ')'}
                      </button>
                    </div>
                  </div>

                  {/* Operator Select between terms */}
                  {idx < operators.length && (
                    <div className="flex flex-col items-center shrink-0">
                      <select
                        value={operators[idx]}
                        onChange={(e) => handleUpdateOperator(idx, e.target.value as FractionOp)}
                        className="bg-[#FF9F0A] hover:bg-[#FF9F0A]/90 text-white font-mono font-bold text-xs px-1 py-0.5 rounded border-none shadow cursor-pointer text-center outline-none"
                      >
                        <option value="+">+</option>
                        <option value="−">−</option>
                        <option value="×">×</option>
                        <option value="÷">÷</option>
                      </select>
                    </div>
                  )}
                </React.Fragment>
              ))}

              {/* Add term button if < 5 */}
              {terms.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddTerm}
                  className="flex flex-col items-center justify-center gap-0.5 p-1 bg-[#242424] hover:bg-[#333333] text-gray-400 hover:text-white rounded-lg border border-[#2C2C2E] border-dashed shrink-0 h-16 w-12 transition-colors"
                  title="Add another fraction term"
                >
                  <Plus className="w-3.5 h-3.5 text-[#FF9F0A]" />
                  <span className="text-[8px] font-medium">+Term</span>
                </button>
              )}

              {/* Equals Sign */}
              <span className="text-gray-500 font-mono text-base font-bold px-0.5 shrink-0">=</span>

              {/* Result Preview Box in the Math Row */}
              <div className="shrink-0 flex items-center">
                {bodmasResult.res ? (
                  <div className="flex flex-col items-center gap-0.5 px-2 py-0.5 bg-[#30D158]/10 rounded-lg border border-[#30D158]/30">
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#30D158]">
                      {bodmasResult.res.resultFraction.numerator}
                    </span>
                    <div className="w-full h-0.5 bg-[#30D158]" />
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#30D158]">
                      {bodmasResult.res.resultFraction.denominator}
                    </span>
                  </div>
                ) : (
                  <span className="text-[#FF453A] text-[10px] font-mono max-w-28 text-center leading-tight">
                    {bodmasResult.error}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Result Summary Cards (Single-Line Compact Row) */}
            {bodmasResult.res && (
              <div className="grid grid-cols-4 gap-1.5 bg-black/40 p-1.5 rounded-xl border border-[#242424]">
                <div className="flex flex-col items-center justify-center p-1.5 bg-[#242424]/60 rounded-lg border border-[#2C2C2E]">
                  <span className="text-[9px] text-gray-400 font-medium">Fraction</span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-[#30D158]">
                    {bodmasResult.res.resultFraction.numerator}/{bodmasResult.res.resultFraction.denominator}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center p-1.5 bg-[#242424]/60 rounded-lg border border-[#2C2C2E]">
                  <span className="text-[9px] text-gray-400 font-medium">Mixed</span>
                  <span className="font-mono text-[11px] sm:text-xs font-bold text-white truncate max-w-full">
                    {bodmasResult.res.mixed.whole !== 0 ? (
                      `${bodmasResult.res.mixed.whole} ${bodmasResult.res.mixed.numerator}/${bodmasResult.res.mixed.denominator}`
                    ) : (
                      `${bodmasResult.res.mixed.numerator}/${bodmasResult.res.mixed.denominator}`
                    )}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center p-1.5 bg-[#242424]/60 rounded-lg border border-[#2C2C2E]">
                  <span className="text-[9px] text-gray-400 font-medium">Decimal</span>
                  <span className="font-mono text-[11px] sm:text-xs font-bold text-white">
                    {formatResult(bodmasResult.res.decimal, 4)}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center p-1.5 bg-[#242424]/60 rounded-lg border border-[#2C2C2E]">
                  <span className="text-[9px] text-gray-400 font-medium">Percentage</span>
                  <span className="font-mono text-[11px] sm:text-xs font-bold text-[#FF9F0A]">
                    {formatResult(bodmasResult.res.decimal * 100, 2)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'simplify' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-center gap-2.5 p-2 bg-black rounded-xl border border-[#242424]">
              {/* Input Fraction */}
              <div className="flex flex-col items-center gap-0.5">
                <NumInput value={simpNum} onChange={setSimpNum} className="w-14" />
                <div className="w-full h-0.5 bg-gray-500 rounded-full" />
                <NumInput value={simpDen} onChange={setSimpDen} className="w-14" />
              </div>

              <ArrowRight className="w-4 h-4 text-[#FF9F0A]" />

              {/* Simplified Result */}
              {simp.simplified ? (
                <div className="flex flex-col items-center gap-0.5 px-2.5 py-0.5 bg-[#30D158]/10 rounded-lg border border-[#30D158]/30">
                  <span className="font-mono text-sm font-bold text-[#30D158]">
                    {simp.simplified.numerator}
                  </span>
                  <div className="w-full h-0.5 bg-[#30D158]" />
                  <span className="font-mono text-sm font-bold text-[#30D158]">
                    {simp.simplified.denominator}
                  </span>
                </div>
              ) : (
                <span className="text-[#FF453A] text-[10px] font-mono">{simp.error}</span>
              )}
            </div>

            {simp.simplified && (
              <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1.5 rounded-xl border border-[#242424]">
                <div className="flex flex-col items-center p-1.5 bg-[#242424]/60 rounded-lg border border-[#2C2C2E]">
                  <span className="text-[9px] text-gray-400 font-medium">GCD Factor</span>
                  <span className="font-mono text-xs font-bold text-[#FF9F0A]">{simp.gcdVal}</span>
                </div>
                <div className="flex flex-col items-center p-1.5 bg-[#242424]/60 rounded-lg border border-[#2C2C2E]">
                  <span className="text-[9px] text-gray-400 font-medium">Decimal</span>
                  <span className="font-mono text-xs font-bold text-white">{formatResult(simp.decimal, 4)}</span>
                </div>
                <div className="flex flex-col items-center p-1.5 bg-[#242424]/60 rounded-lg border border-[#2C2C2E]">
                  <span className="text-[9px] text-gray-400 font-medium">Percentage</span>
                  <span className="font-mono text-xs font-bold text-white">{simp.percent}%</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'decimal' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-center gap-2.5 p-2 bg-black rounded-xl border border-[#242424]">
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-gray-400 font-mono mb-0.5">Decimal Input</span>
                <NumInput value={decInput} onChange={setDecInput} className="w-24" />
              </div>

              <ArrowRight className="w-4 h-4 text-[#FF9F0A]" />

              {dec.frac ? (
                <div className="flex flex-col items-center gap-0.5 px-2.5 py-0.5 bg-[#30D158]/10 rounded-lg border border-[#30D158]/30">
                  <span className="font-mono text-sm font-bold text-[#30D158]">{dec.frac.numerator}</span>
                  <div className="w-full h-0.5 bg-[#30D158]" />
                  <span className="font-mono text-sm font-bold text-[#30D158]">{dec.frac.denominator}</span>
                </div>
              ) : (
                <span className="text-[#FF453A] text-[10px] font-mono">{dec.error}</span>
              )}
            </div>

            {dec.frac && (
              <div className="grid grid-cols-2 gap-1.5 bg-black/40 p-1.5 rounded-xl border border-[#242424]">
                <div className="flex flex-col items-center p-1.5 bg-[#242424]/60 rounded-lg border border-[#2C2C2E]">
                  <span className="text-[9px] text-gray-400 font-medium">Fraction</span>
                  <span className="font-mono text-xs font-bold text-[#30D158]">
                    {dec.frac.numerator}/{dec.frac.denominator}
                  </span>
                </div>
                <div className="flex flex-col items-center p-1.5 bg-[#242424]/60 rounded-lg border border-[#2C2C2E]">
                  <span className="text-[9px] text-gray-400 font-medium">Mixed Number</span>
                  <span className="font-mono text-xs font-bold text-white">
                    {dec.mixed?.whole ? `${dec.mixed.whole} ${dec.mixed.numerator}/${dec.mixed.denominator}` : `${dec.frac.numerator}/${dec.frac.denominator}`}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Send to Standard Calculator */}
        <div className="flex items-center justify-end gap-2 pt-0.5 border-t border-[#2C2C2E]/60 text-xs">
          <button
            type="button"
            onClick={() => {
              const val = activeTab === 'arithmetic' && bodmasResult.res 
                ? `${bodmasResult.res.resultFraction.numerator}/${bodmasResult.res.resultFraction.denominator}`
                : activeTab === 'simplify' && simp.simplified
                ? `${simp.simplified.numerator}/${simp.simplified.denominator}`
                : dec.frac ? `${dec.frac.numerator}/${dec.frac.denominator}` : '0';
              handleSendToCalc(val);
            }}
            className="flex items-center gap-1 px-2.5 py-0.5 bg-[#242424] hover:bg-[#333333] text-gray-300 hover:text-white rounded-full transition-colors border border-[#333333] text-[10px]"
          >
            <Calculator className="w-3 h-3 text-[#FF9F0A]" />
            <span>Use in Calc</span>
          </button>
        </div>
      </div>
    </div>
  );
};
