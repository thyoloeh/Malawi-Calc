import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Copy, 
  Check, 
  Calculator, 
  Sparkles, 
  RotateCcw,
  Sigma
} from 'lucide-react';
import { motion } from 'motion/react';
import { calculateStatistics, formatResult } from '../utils/mathUtils';
import { useHistory } from '../context/HistoryContext';

const PRESET_DATASETS = [
  { name: 'Scores', data: '88, 92, 75, 64, 88, 95, 78, 85, 90, 100' },
  { name: 'Temp (°C)', data: '21.5, 23.0, 19.8, 25.2, 22.4, 18.9, 24.1' },
  { name: 'Latency (ms)', data: '120, 145, 110, 130, 210, 115, 125, 140' },
  { name: 'Weights (g)', data: '502, 498, 500, 505, 499, 501, 503, 497' },
];

export const StatisticsModule: React.FC = () => {
  const { addHistory, setActiveModule, setInjectedExpression } = useHistory();

  const [rawInput, setRawInput] = useState<string>('12, 15, 18, 22, 25, 28, 30, 30, 35, 42, 50');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const parsedNumbers = useMemo(() => {
    if (!rawInput.trim()) return [];
    const tokens = rawInput.split(/[\s,;\n\t]+/);
    const nums: number[] = [];
    for (const tok of tokens) {
      if (tok.trim() !== '') {
        const n = parseFloat(tok.trim());
        if (!isNaN(n)) nums.push(n);
      }
    }
    return nums;
  }, [rawInput]);

  const stats = useMemo(() => {
    if (parsedNumbers.length === 0) return null;
    try {
      return calculateStatistics(parsedNumbers);
    } catch {
      return null;
    }
  }, [parsedNumbers]);

  const handleCopy = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendToCalc = (val: number | string) => {
    setInjectedExpression(String(val));
    setActiveModule('standard');
  };

  const handleSaveToHistory = () => {
    if (!stats) return;
    addHistory({
      type: 'statistics',
      expression: `Stats of ${stats.count} items`,
      result: `Mean: ${formatResult(stats.mean)}, Med: ${formatResult(stats.median)}, StdDev: ${formatResult(stats.sampleStdDev)}`,
      details: `Min: ${stats.min}, Max: ${stats.max}, Sum: ${stats.sum}`,
    });
  };

  return (
    <div id="statistics-module" className="w-full max-w-2xl mx-auto flex flex-col gap-2">
      {/* Top Header Card: Sample Sets & Input */}
      <div className="bg-[#1C1C1E] p-2.5 sm:p-3 rounded-2xl border border-[#2C2C2E] shadow-xl flex flex-col gap-2">
        {/* Sample Datasets Bar */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-gray-500 font-mono uppercase mr-0.5">Presets:</span>
            {PRESET_DATASETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setRawInput(p.data)}
                className="px-2 py-0.5 rounded-full bg-[#242424] hover:bg-[#333333] text-[10px] text-gray-300 border border-[#333333] transition-colors whitespace-nowrap"
              >
                {p.name}
              </button>
            ))}
          </div>

          <span className="px-1.5 py-0.5 rounded-full bg-black text-[9px] font-mono text-[#FF9F0A] border border-[#2C2C2E] shrink-0">
            N = {parsedNumbers.length}
          </span>
        </div>

        {/* Input box */}
        <input
          id="stats-data-input"
          type="text"
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder="Enter numbers separated by spaces or commas..."
          className="w-full p-2 bg-black border border-[#333333] rounded-lg font-mono text-xs text-white focus:border-[#FF9F0A] focus:outline-none"
        />

        {/* Metrics Grid: 6 Primary Key Measurement Tiles */}
        {stats ? (
          <div className="grid grid-cols-3 gap-1.5">
            {/* Mean */}
            <div 
              onClick={() => handleSendToCalc(stats.mean)}
              className="p-1.5 bg-black/60 hover:bg-[#242424] rounded-xl border border-[#2C2C2E] flex flex-col items-center cursor-pointer transition-all group"
            >
              <span className="text-[9px] text-gray-400 font-medium group-hover:text-[#FF9F0A]">Mean (μ)</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-[#30D158] truncate">
                {formatResult(stats.mean, 4)}
              </span>
            </div>

            {/* Median */}
            <div 
              onClick={() => handleSendToCalc(stats.median)}
              className="p-1.5 bg-black/60 hover:bg-[#242424] rounded-xl border border-[#2C2C2E] flex flex-col items-center cursor-pointer transition-all group"
            >
              <span className="text-[9px] text-gray-400 font-medium group-hover:text-[#FF9F0A]">Median</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-white truncate">
                {formatResult(stats.median, 4)}
              </span>
            </div>

            {/* Mode */}
            <div 
              onClick={() => stats.modes && stats.modes.length > 0 && handleSendToCalc(stats.modes[0])}
              className="p-1.5 bg-black/60 hover:bg-[#242424] rounded-xl border border-[#2C2C2E] flex flex-col items-center cursor-pointer transition-all group"
            >
              <span className="text-[9px] text-gray-400 font-medium group-hover:text-[#FF9F0A]">Mode</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-white truncate">
                {stats.modes && stats.modes.length > 0 ? stats.modes.join(', ') : 'None'}
              </span>
            </div>

            {/* Std Dev (s) */}
            <div 
              onClick={() => handleSendToCalc(stats.sampleStdDev)}
              className="p-1.5 bg-black/60 hover:bg-[#242424] rounded-xl border border-[#2C2C2E] flex flex-col items-center cursor-pointer transition-all group"
            >
              <span className="text-[9px] text-gray-400 font-medium group-hover:text-[#FF9F0A]">Std Dev (s)</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-[#FF9F0A] truncate">
                {formatResult(stats.sampleStdDev, 4)}
              </span>
            </div>

            {/* Min / Max */}
            <div className="p-1.5 bg-black/60 rounded-xl border border-[#2C2C2E] flex flex-col items-center">
              <span className="text-[9px] text-gray-400 font-medium">Min / Max</span>
              <span className="font-mono text-[11px] font-bold text-white truncate">
                {stats.min} ... {stats.max}
              </span>
            </div>

            {/* Sum (Σx) */}
            <div 
              onClick={() => handleSendToCalc(stats.sum)}
              className="p-1.5 bg-black/60 hover:bg-[#242424] rounded-xl border border-[#2C2C2E] flex flex-col items-center cursor-pointer transition-all group"
            >
              <span className="text-[9px] text-gray-400 font-medium group-hover:text-[#FF9F0A]">Sum (Σx)</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-white truncate">
                {formatResult(stats.sum, 4)}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-black/40 rounded-xl text-center text-xs text-gray-500 font-mono">
            Enter numerical data to calculate statistics.
          </div>
        )}

        {/* Extended Quartile Strip */}
        {stats && (
          <div className="grid grid-cols-4 gap-1 p-1.5 bg-black/30 rounded-lg border border-[#242424] text-[10px] font-mono text-center">
            <div>
              <span className="text-gray-500 block text-[8px]">Q1 (25%)</span>
              <span className="font-bold text-gray-200">{formatResult(stats.q1, 2)}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[8px]">Q3 (75%)</span>
              <span className="font-bold text-gray-200">{formatResult(stats.q3, 2)}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[8px]">IQR</span>
              <span className="font-bold text-[#30D158]">{formatResult(stats.iqr, 2)}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[8px]">Variance (s²)</span>
              <span className="font-bold text-gray-200">{formatResult(stats.sampleVariance, 2)}</span>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-1 border-t border-[#2C2C2E]/60 text-xs">
          <button
            type="button"
            onClick={() => setRawInput('')}
            className="text-gray-400 hover:text-white text-[10px]"
          >
            Clear Data
          </button>
          {stats && (
            <button
              type="button"
              onClick={handleSaveToHistory}
              className="px-2.5 py-0.5 bg-[#FF9F0A]/20 hover:bg-[#FF9F0A]/30 text-[#FF9F0A] border border-[#FF9F0A]/40 rounded-full text-[10px] font-medium transition-colors"
            >
              Save to History
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
