import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Delete, 
  Copy, 
  Check, 
  ClipboardPaste,
  SlidersHorizontal,
  Binary,
  Maximize2,
  Sparkles,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  evaluateExpression, 
  formatResult, 
  formatWithNotation, 
  DisplayNotation 
} from '../utils/mathUtils';
import { useHistory } from '../context/HistoryContext';

export const StandardCalculator: React.FC = () => {
  const { addHistory, injectedExpression, setInjectedExpression, copyText, pasteText } = useHistory();

  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [numericResult, setNumericResult] = useState<number>(0);
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');
  const [isScientific, setIsScientific] = useState<boolean>(true);
  const [notation, setNotation] = useState<DisplayNotation>('NORM');
  const [isShift, setIsShift] = useState<boolean>(false);
  const [isHyp, setIsHyp] = useState<boolean>(false);
  const [plateMode, setPlateMode] = useState<'numbers' | 'symbols' | 'trig'>('numbers');
  const [memory, setMemory] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [pasted, setPasted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  const displayRef = useRef<HTMLDivElement>(null);

  // Inject expression if provided from history or external trigger
  useEffect(() => {
    if (injectedExpression !== null) {
      setExpression(injectedExpression);
      try {
        const val = evaluateExpression(injectedExpression, angleMode);
        setNumericResult(val);
        setResult(formatWithNotation(val, notation));
        setErrorMsg(null);
      } catch {
        // Just set the expression
      }
      setInjectedExpression(null);
    }
  }, [injectedExpression, angleMode, notation, setInjectedExpression]);

  // Live preview evaluation as the user types
  useEffect(() => {
    if (!expression || expression.trim() === '') {
      if (!hasCalculated) {
        setResult('0');
        setNumericResult(0);
      }
      setErrorMsg(null);
      return;
    }

    try {
      const val = evaluateExpression(expression, angleMode);
      if (!isNaN(val) && isFinite(val)) {
        setNumericResult(val);
        setResult(formatWithNotation(val, notation));
        setErrorMsg(null);
      }
    } catch {
      // Expression might be incomplete while typing, keep current result or error
    }
  }, [expression, angleMode, notation, hasCalculated]);

  // Update display result when notation mode changes
  const handleNotationChange = (newNotation: DisplayNotation) => {
    setNotation(newNotation);
    if (!isNaN(numericResult)) {
      setResult(formatWithNotation(numericResult, newNotation));
    }
  };

  const handleInput = useCallback((char: string) => {
    setErrorMsg(null);
    if (hasCalculated) {
      const isOperator = ['+', '−', '×', '÷', '^', '%', ' mod '].includes(char);
      if (isOperator) {
        setExpression(formatResult(numericResult) + char);
      } else {
        setExpression(char);
      }
      setHasCalculated(false);
      return;
    }

    setExpression((prev) => prev + char);
  }, [hasCalculated, numericResult]);

  const handleFunction = useCallback((fnName: string) => {
    setErrorMsg(null);
    if (hasCalculated) {
      setExpression(`${fnName}(${formatResult(numericResult)})`);
      setHasCalculated(false);
      return;
    }

    setExpression((prev) => `${prev}${fnName}(`);
  }, [hasCalculated, numericResult]);

  const handleClear = () => {
    setExpression('');
    setResult('0');
    setNumericResult(0);
    setErrorMsg(null);
    setHasCalculated(false);
  };

  const handleDelete = () => {
    setErrorMsg(null);
    if (hasCalculated) {
      handleClear();
      return;
    }
    setExpression((prev) => {
      if (prev.length === 0) return '';
      // Check for multi-char function deletions
      const match = prev.match(/(asin|acos|atan|asinh|acosh|atanh|sinh|cosh|tanh|sin|cos|tan|sqrt|cbrt|root|logBase|log2|log|ln|abs|exp|nPr|nCr)\($/);
      if (match) {
        return prev.slice(0, -match[0].length);
      }
      if (prev.endsWith(' mod ')) {
        return prev.slice(0, -5);
      }
      if (prev.endsWith('EE')) {
        return prev.slice(0, -2);
      }
      return prev.slice(0, -1);
    });
  };

  const handleEquals = () => {
    if (!expression.trim()) return;

    try {
      const calculatedVal = evaluateExpression(expression, angleMode);
      setNumericResult(calculatedVal);
      const formatted = formatWithNotation(calculatedVal, notation);
      setResult(formatted);
      setErrorMsg(null);
      setHasCalculated(true);

      // Add to history
      addHistory({
        type: isScientific ? 'scientific' : 'standard',
        expression: expression,
        result: formatted,
        metadata: {
          angleMode,
          numericValue: calculatedVal,
          notation,
        },
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Syntax Error');
      setResult('Error');
    }
  };

  const handleCopy = useCallback(async () => {
    const textToCopy = result !== '0' && result !== 'Error' ? result : expression;
    if (!textToCopy) return;
    await copyText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result, expression, copyText]);

  const handlePaste = useCallback(async (customText?: string) => {
    const raw = customText !== undefined ? customText : await pasteText();
    if (!raw) return;

    // Sanitize mathematical input
    let clean = raw.trim()
      .replace(/[\n\r]+/g, ' ')
      .replace(/\*/g, '×')
      .replace(/\//g, '÷')
      .replace(/-/g, '−')
      .replace(/pi|PI|Pi/g, 'π')
      .replace(/,/g, ''); // strip thousand separators

    if (!clean) return;

    if (hasCalculated) {
      // If starts with an arithmetic operator, continue calculation
      if (/^[+−×÷^%]/.test(clean)) {
        setExpression(formatResult(numericResult) + clean);
      } else {
        setExpression(clean);
      }
      setHasCalculated(false);
    } else {
      setExpression((prev) => prev + clean);
    }

    setErrorMsg(null);
    setPasted(true);
    setTimeout(() => setPasted(false), 2000);
  }, [hasCalculated, numericResult, pasteText]);

  // Memory functions
  const handleMemory = (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
    const currentVal = numericResult || (expression ? evaluateExpression(expression, angleMode) : 0);
    
    switch (action) {
      case 'MC':
        setMemory(null);
        break;
      case 'MR':
        if (memory !== null) {
          handleInput(formatResult(memory));
        }
        break;
      case 'MS':
        if (!isNaN(currentVal)) setMemory(currentVal);
        break;
      case 'M+':
        if (!isNaN(currentVal)) {
          setMemory((prev) => (prev !== null ? prev + currentVal : currentVal));
        }
        break;
      case 'M-':
        if (!isNaN(currentVal)) {
          setMemory((prev) => (prev !== null ? prev - currentVal : -currentVal));
        }
        break;
    }
  };

  const handleNegate = () => {
    if (expression.startsWith('-(') && expression.endsWith(')')) {
      setExpression(expression.slice(2, -1));
    } else if (expression.startsWith('-')) {
      setExpression(expression.slice(1));
    } else if (expression) {
      setExpression(`-(${expression})`);
    } else if (result !== '0' && result !== 'Error') {
      setExpression(`-(${formatResult(numericResult)})`);
      setHasCalculated(false);
    }
  };

  // Keyboard support (Keys + Ctrl+V / Ctrl+C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(activeEl?.tagName)) {
        return;
      }

      // Check Ctrl+V / Cmd+V (Paste)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePaste();
        return;
      }

      // Check Ctrl+C / Cmd+C (Copy) if nothing highlighted
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        const selection = window.getSelection()?.toString();
        if (!selection) {
          e.preventDefault();
          handleCopy();
          return;
        }
      }

      if (e.key >= '0' && e.key <= '9') {
        handleInput(e.key);
      } else if (e.key === '.') {
        handleInput('.');
      } else if (e.key === '+') {
        handleInput('+');
      } else if (e.key === '-') {
        handleInput('−');
      } else if (e.key === '*') {
        handleInput('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleInput('÷');
      } else if (e.key === '^') {
        handleInput('^');
      } else if (e.key === '%') {
        handleInput('%');
      } else if (e.key === '(' || e.key === ')') {
        handleInput(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      } else if (e.key.toLowerCase() === 'p') {
        handleInput('π');
      } else if (e.key.toLowerCase() === 'e') {
        handleInput('e');
      }
    };

    const handleWindowPaste = (e: ClipboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(activeEl?.tagName)) {
        return;
      }
      const text = e.clipboardData?.getData('text');
      if (text) {
        e.preventDefault();
        handlePaste(text);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handleWindowPaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handleWindowPaste);
    };
  }, [handleInput, handleEquals, handleDelete, handlePaste, handleCopy]);

  return (
    <div id="standard-calculator" className="w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto flex flex-col gap-2.5 sm:gap-4 flex-1 justify-between">
      {/* Top Toolbar: View Mode, Angle Mode, Notation Format */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-[#1C1C1E] rounded-2xl sm:rounded-full border border-[#2C2C2E] text-xs sm:text-sm shadow-md">
        {/* Normal vs Scientific View Toggle */}
        <div className="flex items-center bg-black/60 p-0.5 rounded-full border border-[#2C2C2E]">
          <button
            id="view-normal-btn"
            type="button"
            onClick={() => setIsScientific(false)}
            className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-medium text-xs sm:text-sm transition-all ${
              !isScientific
                ? 'bg-[#FF9F0A] text-white shadow-sm shadow-[#FF9F0A]/30 font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Normal View
          </button>
          <button
            id="view-scientific-btn"
            type="button"
            onClick={() => setIsScientific(true)}
            className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-medium text-xs sm:text-sm transition-all ${
              isScientific
                ? 'bg-[#FF9F0A] text-white shadow-sm shadow-[#FF9F0A]/30 font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Scientific View
          </button>
        </div>

        {/* Notation Format Toggle: NORM / SCI / ENG */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs sm:text-sm text-gray-400 font-mono uppercase hidden sm:inline">Notation:</span>
          <div className="flex items-center bg-black/60 p-0.5 rounded-full border border-[#2C2C2E]">
            {(['NORM', 'SCI', 'ENG'] as const).map((not) => (
              <button
                key={not}
                id={`notation-btn-${not}`}
                type="button"
                onClick={() => handleNotationChange(not)}
                className={`px-2.5 py-1 rounded-full text-xs sm:text-sm font-mono font-medium transition-all ${
                  notation === not
                    ? 'bg-[#30D158] text-black font-bold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {not}
              </button>
            ))}
          </div>
        </div>

        {/* Angle mode DEG / RAD */}
        <div className="flex items-center bg-black/60 p-0.5 rounded-full border border-[#2C2C2E]">
          <button
            id="angle-deg-btn"
            type="button"
            onClick={() => setAngleMode('DEG')}
            className={`px-3 py-1 rounded-full font-medium text-xs sm:text-sm transition-all ${
              angleMode === 'DEG'
                ? 'bg-[#2C2C2E] text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            DEG
          </button>
          <button
            id="angle-rad-btn"
            type="button"
            onClick={() => setAngleMode('RAD')}
            className={`px-3 py-1 rounded-full font-medium text-xs sm:text-sm transition-all ${
              angleMode === 'RAD'
                ? 'bg-[#2C2C2E] text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            RAD
          </button>
        </div>
      </div>

      {/* Main Display Screen */}
      <div 
        ref={displayRef}
        className="relative flex flex-col justify-between p-4 sm:p-6 bg-black rounded-2xl sm:rounded-3xl border border-[#1C1C1E] shadow-2xl overflow-hidden min-h-[120px] sm:min-h-[150px]"
      >
        {/* Top details bar inside screen: Angle, Notation, Memory, and Copy */}
        <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-[#8E8E93]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#1C1C1E] text-xs sm:text-sm border border-[#2C2C2E] text-[#8E8E93]">
              {angleMode}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1C1C1E] text-xs sm:text-sm border border-[#2C2C2E] text-[#30D158] font-semibold">
              {notation}
            </span>
            {memory !== null && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF9F0A]/20 text-[#FF9F0A] text-xs sm:text-sm border border-[#FF9F0A]/30 font-semibold">
                M={formatResult(memory, 2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="paste-result-btn"
              type="button"
              onClick={() => handlePaste()}
              title="Paste expression or number onto display"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] text-gray-300 hover:text-white transition-all text-xs sm:text-sm font-sans border border-[#2C2C2E] active:scale-95 shadow-xs"
            >
              {pasted ? <Check className="w-3.5 h-3.5 text-[#30D158]" /> : <ClipboardPaste className="w-3.5 h-3.5 text-[#FF9F0A]" />}
              <span>{pasted ? 'Pasted!' : 'Paste'}</span>
            </button>

            <button
              id="copy-result-btn"
              type="button"
              onClick={handleCopy}
              title="Copy Result"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] text-gray-300 hover:text-white transition-colors text-xs sm:text-sm font-sans border border-[#2C2C2E] active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#30D158]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Expression line */}
        <div className="text-right text-[#8E8E93] text-base sm:text-lg font-mono overflow-x-auto scrollbar-none my-1 tracking-wide select-all">
          {expression || (hasCalculated ? 'Ans = ' + result : '0')}
        </div>

        {/* Primary Result Display */}
        <div className="flex items-baseline justify-end gap-1 overflow-hidden">
          <div className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white font-mono truncate text-right">
            {result}
          </div>
        </div>

        {/* Error message indicator if present */}
        {errorMsg && (
          <div className="mt-1 text-xs sm:text-sm text-[#FF453A] font-medium flex items-center justify-end gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF453A] animate-pulse" />
            {errorMsg}
          </div>
        )}
      </div>

      {/* Memory Bar */}
      <div className="grid grid-cols-5 gap-2 px-0.5">
        {(['MC', 'MR', 'M+', 'M-', 'MS'] as const).map((mKey) => (
          <button
            key={mKey}
            id={`mem-btn-${mKey}`}
            type="button"
            onClick={() => handleMemory(mKey)}
            disabled={['MC', 'MR'].includes(mKey) && memory === null}
            className="py-1.5 sm:py-2 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] text-gray-300 hover:text-white disabled:opacity-30 disabled:hover:bg-[#1C1C1E] disabled:hover:text-gray-400 text-xs sm:text-sm font-mono font-bold border border-[#2C2C2E] transition-all active:scale-95 shadow-sm"
          >
            {mKey}
          </button>
        ))}
      </div>

      {/* UNIFIED KEYPAD PLATE */}
      <div className="bg-[#1C1C1E] p-3 sm:p-4 md:p-5 rounded-2xl sm:rounded-3xl border border-[#2C2C2E] flex flex-col gap-2.5 sm:gap-3.5 shadow-xl">
        {/* On-Plate Mode Switcher (Scientific Mode Only on Mobile; on Desktop md: we can also render dual side-by-side) */}
        {isScientific && (
          <div className="flex flex-col gap-2 border-b border-[#2C2C2E]/80 pb-2.5">
            {/* Primary Switcher: Numbers (123) vs Symbols (f(x)) vs Trig */}
            <div className="grid grid-cols-3 gap-2 bg-black/60 p-1.5 rounded-xl sm:rounded-2xl border border-[#2C2C2E]">
              <button
                id="plate-tab-numbers"
                type="button"
                onClick={() => setPlateMode('numbers')}
                className={`py-2 px-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                  plateMode === 'numbers'
                    ? 'bg-[#333333] text-white shadow-md border border-[#444444]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="font-mono text-xs sm:text-sm">123</span>
                <span>Numbers</span>
              </button>

              <button
                id="plate-tab-symbols"
                type="button"
                onClick={() => setPlateMode('symbols')}
                className={`py-2 px-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                  plateMode === 'symbols'
                    ? 'bg-[#FF9F0A] text-white shadow-md shadow-[#FF9F0A]/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="font-mono font-serif italic text-xs sm:text-sm">f(x)</span>
                <span>Symbols</span>
              </button>

              <button
                id="plate-tab-trig"
                type="button"
                onClick={() => setPlateMode('trig')}
                className={`py-2 px-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                  plateMode === 'trig'
                    ? 'bg-[#0A84FF] text-white shadow-md shadow-[#0A84FF]/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="font-mono text-xs sm:text-sm">sin</span>
                <span>Trig</span>
              </button>
            </div>

            {/* Quick Modifier Chips Toolbar (2nd, hyp) */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                id="sci-shift-btn"
                type="button"
                onClick={() => setIsShift(!isShift)}
                className={`py-1.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border ${
                  isShift
                    ? 'bg-[#FF9F0A] text-white border-[#FF9F0A] shadow-sm'
                    : 'bg-[#242424] text-[#FF9F0A] border-[#333333] hover:bg-[#333333]'
                }`}
              >
                2nd (Inverse)
              </button>

              <button
                id="sci-hyp-btn"
                type="button"
                onClick={() => setIsHyp(!isHyp)}
                className={`py-1.5 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-all border ${
                  isHyp
                    ? 'bg-[#0A84FF] text-white border-[#0A84FF]'
                    : 'bg-[#242424] text-gray-300 border-[#333333] hover:bg-[#333333]'
                }`}
              >
                hyp (Hyperbolic)
              </button>
            </div>
          </div>
        )}

        {/* PLATE CONTENT: Switchable Keypad on the Same Plate */}
        {(!isScientific || plateMode === 'numbers') && (
          /* NUMBERS PLATE: Classic 4-Column Layout with Enlarged Mobile Font Sizes */
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3 md:gap-3.5">
            {/* Row 1: CLR, (, ), ÷ */}
            <button
              id="calc-clr-btn"
              type="button"
              onClick={handleClear}
              className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#A5A5A5] hover:bg-[#D4D4D2] active:bg-[#BDBDBD] text-black font-bold text-lg sm:text-xl transition-all active:scale-95 shadow-sm"
            >
              CLR
            </button>
            <button
              id="calc-open-paren"
              type="button"
              onClick={() => handleInput('(')}
              className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#A5A5A5] hover:bg-[#D4D4D2] active:bg-[#BDBDBD] text-black font-bold font-mono text-lg sm:text-xl transition-all active:scale-95 shadow-sm"
            >
              (
            </button>
            <button
              id="calc-close-paren"
              type="button"
              onClick={() => handleInput(')')}
              className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#A5A5A5] hover:bg-[#D4D4D2] active:bg-[#BDBDBD] text-black font-bold font-mono text-lg sm:text-xl transition-all active:scale-95 shadow-sm"
            >
              )
            </button>
            <button
              id="calc-op-div"
              type="button"
              onClick={() => handleInput('÷')}
              className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#FF9F0A] hover:bg-[#FFB03B] active:bg-[#E08A00] text-white font-mono text-2xl sm:text-3xl font-medium transition-all active:scale-95 shadow-md shadow-[#FF9F0A]/20"
            >
              ÷
            </button>

            {/* Row 2: 7, 8, 9, × */}
            <button
              id="calc-num-7"
              type="button"
              onClick={() => handleInput('7')}
              className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#333333] hover:bg-[#444444] active:bg-[#555555] text-white font-mono text-xl sm:text-2xl font-medium transition-all active:scale-95 shadow-sm"
            >
              7
            </button>
            <button
              id="calc-num-8"
              type="button"
              onClick={() => handleInput('8')}
              className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#333333] hover:bg-[#444444] active:bg-[#555555] text-white font-mono text-xl sm:text-2xl font-medium transition-all active:scale-95 shadow-sm"
            >
              8
            </button>
            <button
              id="calc-num-9"
              type="button"
              onClick={() => handleInput('9')}
              className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#333333] hover:bg-[#444444] active:bg-[#555555] text-white font-mono text-xl sm:text-2xl font-medium transition-all active:scale-95 shadow-sm"
            >
              9
            </button>
            <button
              id="calc-op-mul"
              type="button"
              onClick={() => handleInput('×')}
              className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#FF9F0A] hover:bg-[#FFB03B] active:bg-[#E08A00] text-white font-mono text-2xl sm:text-3xl font-medium transition-all active:scale-95 shadow-md shadow-[#FF9F0A]/20"
            >
              ×
            </button>

            {/* Row 3: 4, 5, 6, − */}
            <button
              id="calc-num-4"
              type="button"
              onClick={() => handleInput('4')}
              className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#333333] hover:bg-[#444444] active:bg-[#555555] text-white font-mono text-xl sm:text-2xl font-medium transition-all active:scale-95 shadow-sm"
            >
              4
            </button>
            <button
              id="calc-num-5"
              type="button"
              onClick={() => handleInput('5')}
              className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#333333] hover:bg-[#444444] active:bg-[#555555] text-white font-mono text-xl sm:text-2xl font-medium transition-all active:scale-95 shadow-sm"
            >
              5
            </button>
            <button
              id="calc-num-6"
              type="button"
              onClick={() => handleInput('6')}
              className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#333333] hover:bg-[#444444] active:bg-[#555555] text-white font-mono text-xl sm:text-2xl font-medium transition-all active:scale-95 shadow-sm"
            >
              6
            </button>
            <button
              id="calc-op-sub"
              type="button"
              onClick={() => handleInput('−')}
              className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#FF9F0A] hover:bg-[#FFB03B] active:bg-[#E08A00] text-white font-mono text-2xl sm:text-3xl font-medium transition-all active:scale-95 shadow-md shadow-[#FF9F0A]/20"
            >
              −
            </button>

            {/* Row 4: 1, 2, 3, + */}
            <button
              id="calc-num-1"
              type="button"
              onClick={() => handleInput('1')}
              className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#333333] hover:bg-[#444444] active:bg-[#555555] text-white font-mono text-xl sm:text-2xl font-medium transition-all active:scale-95 shadow-sm"
            >
              1
            </button>
            <button
              id="calc-num-2"
              type="button"
              onClick={() => handleInput('2')}
              className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#333333] hover:bg-[#444444] active:bg-[#555555] text-white font-mono text-xl sm:text-2xl font-medium transition-all active:scale-95 shadow-sm"
            >
              2
            </button>
            <button
              id="calc-num-3"
              type="button"
              onClick={() => handleInput('3')}
              className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#333333] hover:bg-[#444444] active:bg-[#555555] text-white font-mono text-xl sm:text-2xl font-medium transition-all active:scale-95 shadow-sm"
            >
              3
            </button>
            <button
              id="calc-op-add"
              type="button"
              onClick={() => handleInput('+')}
              className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#FF9F0A] hover:bg-[#FFB03B] active:bg-[#E08A00] text-white font-mono text-2xl sm:text-3xl font-medium transition-all active:scale-95 shadow-md shadow-[#FF9F0A]/20"
            >
              +
            </button>

            {/* Row 5: f(x) toggle / ±, 0, ., = */}
            {isScientific ? (
              <button
                id="calc-switch-to-sym"
                type="button"
                onClick={() => setPlateMode('symbols')}
                className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#242424] hover:bg-[#2C2C2E] active:bg-[#333333] text-[#FF9F0A] border border-[#FF9F0A]/40 font-mono font-serif italic text-lg sm:text-xl font-bold transition-all active:scale-95 shadow-sm"
                title="Switch to Operations & Symbols"
              >
                f(x)
              </button>
            ) : (
              <button
                id="norm-negate-btn"
                type="button"
                onClick={handleNegate}
                className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#333333] hover:bg-[#444444] active:bg-[#555555] text-white font-mono text-lg sm:text-xl transition-all active:scale-95 shadow-sm"
              >
                ±
              </button>
            )}

            <button
              id="calc-num-0"
              type="button"
              onClick={() => handleInput('0')}
              className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#333333] hover:bg-[#444444] active:bg-[#555555] text-white font-mono text-xl sm:text-2xl font-medium transition-all active:scale-95 shadow-sm"
            >
              0
            </button>
            <button
              id="calc-decimal-btn"
              type="button"
              onClick={() => handleInput('.')}
              className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#333333] hover:bg-[#444444] active:bg-[#555555] text-white font-mono text-xl sm:text-2xl font-bold transition-all active:scale-95 shadow-sm"
            >
              .
            </button>
            <button
              id="calc-equals-btn"
              type="button"
              onClick={handleEquals}
              className="py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-[#FF9F0A] hover:bg-[#FFB03B] active:bg-[#E08A00] text-white font-mono text-2xl sm:text-3xl font-bold shadow-lg shadow-[#FF9F0A]/20 transition-all active:scale-95"
            >
              =
            </button>

            {/* Row 6 Quick Extras: ±, %, 00 / π, Del */}
            <button
              id="calc-negate-extra-btn"
              type="button"
              onClick={handleNegate}
              className="py-2.5 sm:py-3 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] text-gray-200 font-mono text-base sm:text-lg font-semibold transition-all active:scale-95 shadow-sm"
            >
              ±
            </button>
            <button
              id="calc-percent-btn"
              type="button"
              onClick={() => handleInput('%')}
              className="py-2.5 sm:py-3 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] text-gray-200 font-mono text-base sm:text-lg font-semibold transition-all active:scale-95 shadow-sm"
            >
              %
            </button>
            <button
              id="calc-extra-btn"
              type="button"
              onClick={() => (isScientific ? handleInput('π') : handleInput('00'))}
              className="py-2.5 sm:py-3 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] text-gray-200 font-mono text-base sm:text-lg font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isScientific ? 'π' : '00'}
            </button>
            <button
              id="calc-del-btn"
              type="button"
              onClick={handleDelete}
              className="py-2.5 sm:py-3 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] text-gray-200 flex items-center justify-center gap-1.5 text-base sm:text-lg transition-all active:scale-95 shadow-sm"
              title="Delete character"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* SYMBOLS & OPERATIONS PLATE: Switchable on the Same Plate */}
        {isScientific && plateMode === 'symbols' && (
          <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-3.5">
            {/* Row 1: sin, cos, tan, ÷ */}
            <button
              id="sci-sin-btn"
              type="button"
              onClick={() => handleFunction(isHyp ? (isShift ? 'asinh' : 'sinh') : (isShift ? 'asin' : 'sin'))}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] active:bg-[#444444] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isHyp ? (isShift ? 'asinh' : 'sinh') : (isShift ? 'sin⁻¹' : 'sin')}
            </button>
            <button
              id="sci-cos-btn"
              type="button"
              onClick={() => handleFunction(isHyp ? (isShift ? 'acosh' : 'cosh') : (isShift ? 'acos' : 'cos'))}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] active:bg-[#444444] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isHyp ? (isShift ? 'acosh' : 'cosh') : (isShift ? 'cos⁻¹' : 'cos')}
            </button>
            <button
              id="sci-tan-btn"
              type="button"
              onClick={() => handleFunction(isHyp ? (isShift ? 'atanh' : 'tanh') : (isShift ? 'atan' : 'tan'))}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] active:bg-[#444444] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isHyp ? (isShift ? 'atanh' : 'tanh') : (isShift ? 'tan⁻¹' : 'tan')}
            </button>
            <button
              id="sci-sym-div"
              type="button"
              onClick={() => handleInput('÷')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#FF9F0A] hover:bg-[#FFB03B] active:bg-[#E08A00] text-white font-mono text-2xl sm:text-3xl font-medium transition-all active:scale-95 shadow-md"
            >
              ÷
            </button>

            {/* Row 2: ln / e^x, log10 / 10^x, x^2 / √x, × */}
            <button
              id="sci-ln-btn"
              type="button"
              onClick={() => (isShift ? handleFunction('exp') : handleFunction('ln'))}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] active:bg-[#444444] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isShift ? 'eˣ' : 'ln'}
            </button>
            <button
              id="sci-log-btn"
              type="button"
              onClick={() => (isShift ? handleInput('10^') : handleFunction('log'))}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] active:bg-[#444444] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isShift ? '10ˣ' : 'log₁₀'}
            </button>
            <button
              id="sci-sqrt-btn"
              type="button"
              onClick={() => (isShift ? handleInput('^2') : handleFunction('sqrt'))}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] active:bg-[#444444] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isShift ? 'x²' : '√x'}
            </button>
            <button
              id="sci-sym-mul"
              type="button"
              onClick={() => handleInput('×')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#FF9F0A] hover:bg-[#FFB03B] active:bg-[#E08A00] text-white font-mono text-2xl sm:text-3xl font-medium transition-all active:scale-95 shadow-md"
            >
              ×
            </button>

            {/* Row 3: x^y / y√x, x! / nPr/nCr, 1/x / |x|, − */}
            <button
              id="sci-root-btn"
              type="button"
              onClick={() => (isShift ? handleInput('^') : handleFunction('root'))}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] active:bg-[#444444] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isShift ? 'xʸ' : 'ʸ√x'}
            </button>
            <button
              id="sci-fact-btn"
              type="button"
              onClick={() => (isShift ? handleFunction('nPr') : handleInput('!'))}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] active:bg-[#444444] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isShift ? 'nPr' : 'x!'}
            </button>
            <button
              id="sci-recip-btn"
              type="button"
              onClick={() => {
                if (isShift) {
                  handleFunction('abs');
                } else {
                  if (hasCalculated) {
                    setExpression(`1/(${formatResult(numericResult)})`);
                    setHasCalculated(false);
                  } else {
                    setExpression((prev) => `1/(${prev || '1'})`);
                  }
                }
              }}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] active:bg-[#444444] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isShift ? '|x|' : '1/x'}
            </button>
            <button
              id="sci-sym-sub"
              type="button"
              onClick={() => handleInput('−')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#FF9F0A] hover:bg-[#FFB03B] active:bg-[#E08A00] text-white font-mono text-2xl sm:text-3xl font-medium transition-all active:scale-95 shadow-md"
            >
              −
            </button>

            {/* Row 4: π / τ, e / φ, log2 / logBase, + */}
            <button
              id="sci-pi-btn"
              type="button"
              onClick={() => (isShift ? handleInput('τ') : handleInput('π'))}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] active:bg-[#444444] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isShift ? 'τ' : 'π'}
            </button>
            <button
              id="sci-e-btn"
              type="button"
              onClick={() => (isShift ? handleInput('φ') : handleInput('e'))}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] active:bg-[#444444] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isShift ? 'φ' : 'e'}
            </button>
            <button
              id="sci-log2-btn"
              type="button"
              onClick={() => (isShift ? handleFunction('logBase') : handleFunction('log2'))}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] active:bg-[#444444] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isShift ? 'logᵧx' : 'log₂'}
            </button>
            <button
              id="sci-sym-add"
              type="button"
              onClick={() => handleInput('+')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#FF9F0A] hover:bg-[#FFB03B] active:bg-[#E08A00] text-white font-mono text-2xl sm:text-3xl font-medium transition-all active:scale-95 shadow-md"
            >
              +
            </button>

            {/* Row 5: Switch back to 123 Numbers, (, ), = */}
            <button
              id="calc-switch-to-num"
              type="button"
              onClick={() => setPlateMode('numbers')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#333333] hover:bg-[#444444] active:bg-[#555555] text-[#30D158] border border-[#30D158]/50 font-mono text-sm sm:text-base font-bold transition-all active:scale-95 shadow-sm"
              title="Switch back to Numbers"
            >
              123
            </button>
            <button
              id="sci-sym-open-paren"
              type="button"
              onClick={() => handleInput('(')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#333333] hover:bg-[#444444] text-white font-mono text-lg sm:text-xl font-bold transition-all active:scale-95 shadow-sm"
            >
              (
            </button>
            <button
              id="sci-sym-close-paren"
              type="button"
              onClick={() => handleInput(')')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#333333] hover:bg-[#444444] text-white font-mono text-lg sm:text-xl font-bold transition-all active:scale-95 shadow-sm"
            >
              )
            </button>
            <button
              id="sci-sym-equals"
              type="button"
              onClick={handleEquals}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#FF9F0A] hover:bg-[#FFB03B] active:bg-[#E08A00] text-white font-mono text-2xl sm:text-3xl font-bold shadow-lg shadow-[#FF9F0A]/20 transition-all active:scale-95"
            >
              =
            </button>

            {/* Row 6 Quick Extras: cbrt / x^3, nCr, CLR, Del */}
            <button
              id="sci-cbrt-btn"
              type="button"
              onClick={() => (isShift ? handleInput('^3') : handleFunction('cbrt'))}
              className="py-2.5 sm:py-3 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] text-gray-200 font-mono text-sm sm:text-base font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isShift ? 'x³' : '∛x'}
            </button>
            <button
              id="sci-ncr-btn"
              type="button"
              onClick={() => handleFunction('nCr')}
              className="py-2.5 sm:py-3 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] text-gray-200 font-mono text-sm sm:text-base font-semibold transition-all active:scale-95 shadow-sm"
            >
              nCr
            </button>
            <button
              id="sci-sym-clr"
              type="button"
              onClick={handleClear}
              className="py-2.5 sm:py-3 rounded-xl sm:rounded-full bg-[#A5A5A5] hover:bg-[#D4D4D2] text-black font-bold text-sm sm:text-base transition-all active:scale-95 shadow-sm"
            >
              CLR
            </button>
            <button
              id="sci-sym-del"
              type="button"
              onClick={handleDelete}
              className="py-2.5 sm:py-3 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] text-gray-200 flex items-center justify-center gap-1.5 text-sm sm:text-base transition-all active:scale-95 shadow-sm"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* TRIGONOMETRY PLATE: Dedicated Trig View on the Same Plate */}
        {isScientific && plateMode === 'trig' && (
          <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-3.5">
            {/* Row 1: sin, cos, tan, ÷ */}
            <button
              id="trig-sin-btn"
              type="button"
              onClick={() => handleFunction(isShift ? 'asin' : 'sin')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isShift ? 'sin⁻¹' : 'sin'}
            </button>
            <button
              id="trig-cos-btn"
              type="button"
              onClick={() => handleFunction(isShift ? 'acos' : 'cos')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isShift ? 'cos⁻¹' : 'cos'}
            </button>
            <button
              id="trig-tan-btn"
              type="button"
              onClick={() => handleFunction(isShift ? 'atan' : 'tan')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isShift ? 'tan⁻¹' : 'tan'}
            </button>
            <button
              id="trig-op-div"
              type="button"
              onClick={() => handleInput('÷')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#FF9F0A] hover:bg-[#FFB03B] active:bg-[#E08A00] text-white font-mono text-2xl sm:text-3xl font-medium transition-all active:scale-95 shadow-md"
            >
              ÷
            </button>

            {/* Row 2: sinh, cosh, tanh, × */}
            <button
              id="trig-sinh-btn"
              type="button"
              onClick={() => handleFunction(isShift ? 'asinh' : 'sinh')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isShift ? 'asinh' : 'sinh'}
            </button>
            <button
              id="trig-cosh-btn"
              type="button"
              onClick={() => handleFunction(isShift ? 'acosh' : 'cosh')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isShift ? 'acosh' : 'cosh'}
            </button>
            <button
              id="trig-tanh-btn"
              type="button"
              onClick={() => handleFunction(isShift ? 'atanh' : 'tanh')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              {isShift ? 'atanh' : 'tanh'}
            </button>
            <button
              id="trig-op-mul"
              type="button"
              onClick={() => handleInput('×')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#FF9F0A] hover:bg-[#FFB03B] active:bg-[#E08A00] text-white font-mono text-2xl sm:text-3xl font-medium transition-all active:scale-95 shadow-md"
            >
              ×
            </button>

            {/* Row 3: π, τ, |x|, − */}
            <button
              id="trig-pi-btn"
              type="button"
              onClick={() => handleInput('π')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              π
            </button>
            <button
              id="trig-tau-btn"
              type="button"
              onClick={() => handleInput('τ')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              τ (2π)
            </button>
            <button
              id="trig-abs-btn"
              type="button"
              onClick={() => handleFunction('abs')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] text-white border border-[#333333] text-sm sm:text-base font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              |x|
            </button>
            <button
              id="trig-op-sub"
              type="button"
              onClick={() => handleInput('−')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#FF9F0A] hover:bg-[#FFB03B] active:bg-[#E08A00] text-white font-mono text-2xl sm:text-3xl font-medium transition-all active:scale-95 shadow-md"
            >
              −
            </button>

            {/* Row 4: Switch to 123, (, ), + */}
            <button
              id="trig-switch-to-num"
              type="button"
              onClick={() => setPlateMode('numbers')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#333333] hover:bg-[#444444] text-[#30D158] border border-[#30D158]/50 font-mono text-sm sm:text-base font-bold transition-all active:scale-95 shadow-sm"
              title="Switch back to Numbers"
            >
              123
            </button>
            <button
              id="trig-open-paren"
              type="button"
              onClick={() => handleInput('(')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#333333] hover:bg-[#444444] text-white font-mono text-lg sm:text-xl font-bold transition-all active:scale-95 shadow-sm"
            >
              (
            </button>
            <button
              id="trig-close-paren"
              type="button"
              onClick={() => handleInput(')')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#333333] hover:bg-[#444444] text-white font-mono text-lg sm:text-xl font-bold transition-all active:scale-95 shadow-sm"
            >
              )
            </button>
            <button
              id="trig-op-add"
              type="button"
              onClick={() => handleInput('+')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#FF9F0A] hover:bg-[#FFB03B] active:bg-[#E08A00] text-white font-mono text-2xl sm:text-3xl font-medium transition-all active:scale-95 shadow-md"
            >
              +
            </button>

            {/* Row 5: Switch to f(x), CLR, Del, = */}
            <button
              id="trig-switch-to-sym"
              type="button"
              onClick={() => setPlateMode('symbols')}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] text-[#FF9F0A] border border-[#FF9F0A]/40 font-serif italic text-lg sm:text-xl font-bold transition-all active:scale-95 shadow-sm"
              title="All Symbols"
            >
              f(x)
            </button>
            <button
              id="trig-clr-btn"
              type="button"
              onClick={handleClear}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#A5A5A5] hover:bg-[#D4D4D2] text-black font-bold text-lg sm:text-xl transition-all active:scale-95 shadow-sm"
            >
              CLR
            </button>
            <button
              id="trig-del-btn"
              type="button"
              onClick={handleDelete}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#242424] hover:bg-[#333333] text-white flex items-center justify-center transition-all active:scale-95 shadow-sm"
            >
              <Delete className="w-5 h-5" />
            </button>
            <button
              id="trig-equals-btn"
              type="button"
              onClick={handleEquals}
              className="py-3 sm:py-4 rounded-xl sm:rounded-full bg-[#FF9F0A] hover:bg-[#FFB03B] active:bg-[#E08A00] text-white font-mono text-2xl sm:text-3xl font-bold shadow-lg shadow-[#FF9F0A]/20 transition-all active:scale-95"
            >
              =
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
