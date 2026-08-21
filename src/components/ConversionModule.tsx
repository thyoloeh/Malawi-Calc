import React, { useState, useMemo } from 'react';
import { 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Calculator, 
  Ruler, 
  Scale, 
  Thermometer, 
  Square, 
  Beaker, 
  Gauge, 
  Clock, 
  HardDrive, 
  Zap, 
  Compass, 
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { UNIT_CATEGORIES, convertUnit, UnitCategory } from '../utils/conversionUtils';
import { formatResult } from '../utils/mathUtils';
import { useHistory } from '../context/HistoryContext';
import { NumInput } from './NumInput';

const ICON_MAP: Record<string, React.ReactNode> = {
  Ruler: <Ruler className="w-3.5 h-3.5" />,
  Scale: <Scale className="w-3.5 h-3.5" />,
  Thermometer: <Thermometer className="w-3.5 h-3.5" />,
  Square: <Square className="w-3.5 h-3.5" />,
  Beaker: <Beaker className="w-3.5 h-3.5" />,
  Gauge: <Gauge className="w-3.5 h-3.5" />,
  Clock: <Clock className="w-3.5 h-3.5" />,
  HardDrive: <HardDrive className="w-3.5 h-3.5" />,
  Zap: <Zap className="w-3.5 h-3.5" />,
  Compass: <Compass className="w-3.5 h-3.5" />,
  Activity: <Activity className="w-3.5 h-3.5" />,
};

export const ConversionModule: React.FC = () => {
  const { addHistory, setActiveModule, setInjectedExpression } = useHistory();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('length');
  const activeCategory = useMemo(() => {
    return UNIT_CATEGORIES.find((c) => c.id === selectedCategoryId) || UNIT_CATEGORIES[0];
  }, [selectedCategoryId]);

  const [fromUnitId, setFromUnitId] = useState<string>(activeCategory.units[0]?.id || '');
  const [toUnitId, setToUnitId] = useState<string>(activeCategory.units[1]?.id || '');
  const [inputValue, setInputValue] = useState<string>('1');
  const [copied, setCopied] = useState<boolean>(false);

  const handleCategorySelect = (cat: UnitCategory) => {
    setSelectedCategoryId(cat.id);
    setFromUnitId(cat.units[0]?.id || '');
    setToUnitId(cat.units[1]?.id || cat.units[0]?.id || '');
  };

  const handleSwap = () => {
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  const conversionData = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return { error: 'Please enter a valid number' };
    try {
      const conv = convertUnit(val, fromUnitId, toUnitId, selectedCategoryId);
      return {
        val,
        result: conv.result,
        formattedResult: formatResult(conv.result, 6),
        formula: conv.formula,
      };
    } catch (e: any) {
      return { error: e.message };
    }
  }, [inputValue, fromUnitId, toUnitId, selectedCategoryId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToHistory = () => {
    if (conversionData.error || conversionData.formattedResult === undefined) return;
    const fromUnit = activeCategory.units.find((u) => u.id === fromUnitId);
    const toUnit = activeCategory.units.find((u) => u.id === toUnitId);
    if (!fromUnit || !toUnit) return;

    addHistory({
      type: 'conversion',
      expression: `${inputValue} ${fromUnit.symbol} → ${toUnit.symbol}`,
      result: `${conversionData.formattedResult} ${toUnit.symbol}`,
      details: `${activeCategory.name} (${conversionData.formula})`,
    });
  };

  const handleSendToCalc = (val: string) => {
    setInjectedExpression(val);
    setActiveModule('standard');
  };

  // Unit comparisons in category
  const quickComparisons = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return [];
    return activeCategory.units
      .filter((u) => u.id !== fromUnitId)
      .slice(0, 6)
      .map((unit) => {
        try {
          const conv = convertUnit(val, fromUnitId, unit.id, selectedCategoryId);
          return {
            unit,
            result: formatResult(conv.result, 4),
          };
        } catch {
          return { unit, result: '—' };
        }
      });
  }, [inputValue, fromUnitId, selectedCategoryId, activeCategory]);

  return (
    <div id="conversion-module" className="w-full max-w-2xl mx-auto flex flex-col gap-2">
      {/* Category Pills Slider */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-[#1C1C1E] rounded-full border border-[#2C2C2E] scrollbar-none">
        {UNIT_CATEGORIES.map((cat) => {
          const isActive = cat.id === selectedCategoryId;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategorySelect(cat)}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-[#FF9F0A] text-white shadow-sm font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-[#242424]'
              }`}
            >
              {ICON_MAP[cat.iconName] || null}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Converter Card */}
      <div className="bg-[#1C1C1E] p-2.5 sm:p-3 rounded-2xl border border-[#2C2C2E] shadow-xl flex flex-col gap-2.5">
        {/* Dual Input/Output Conversion Box */}
        <div className="grid grid-cols-1 sm:grid-cols-11 gap-1.5 items-center bg-black p-2 rounded-xl border border-[#242424]">
          {/* FROM Unit Box */}
          <div className="sm:col-span-5 flex flex-col gap-1">
            <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">From</span>
            <NumInput
              value={inputValue}
              onChange={setInputValue}
              placeholder="0"
              className="w-full"
              inputClassName="h-8 text-sm"
            />
            <select
              value={fromUnitId}
              onChange={(e) => setFromUnitId(e.target.value)}
              className="w-full p-1 bg-[#1C1C1E] border border-[#333333] rounded-md text-[11px] font-medium text-gray-300 focus:outline-none"
            >
              {activeCategory.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* SWAP BUTTON */}
          <div className="sm:col-span-1 flex items-center justify-center my-0.5 sm:my-0">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Units"
              className="p-1.5 rounded-full bg-[#242424] hover:bg-[#333333] text-[#FF9F0A] border border-[#333333] transition-transform active:rotate-180"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TO Unit Box */}
          <div className="sm:col-span-5 flex flex-col gap-1">
            <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">To (Result)</span>
            <div className="w-full h-8 px-2.5 flex items-center bg-[#242424]/60 border border-[#333333] rounded-md font-mono text-sm font-bold text-[#30D158] truncate">
              {conversionData.formattedResult || '—'}
            </div>
            <select
              value={toUnitId}
              onChange={(e) => setToUnitId(e.target.value)}
              className="w-full p-1 bg-[#1C1C1E] border border-[#333333] rounded-md text-[11px] font-medium text-gray-300 focus:outline-none"
            >
              {activeCategory.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Formula details */}
        {conversionData.formula && (
          <div className="flex items-center justify-between px-2.5 py-1 bg-black/40 rounded-lg border border-[#242424] text-[11px]">
            <span className="text-gray-400 text-[10px]">Formula: <strong className="text-gray-200 font-mono">{conversionData.formula}</strong></span>
            <button
              type="button"
              onClick={handleSaveToHistory}
              className="text-[#FF9F0A] hover:underline text-[10px] font-bold"
            >
              Save Result
            </button>
          </div>
        )}

        {/* Quick Category Unit Multi-Converter Grid */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">Equivalent Values</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {quickComparisons.map((c) => (
              <div
                key={c.unit.id}
                onClick={() => setToUnitId(c.unit.id)}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  toUnitId === c.unit.id
                    ? 'bg-[#30D158]/10 border-[#30D158]/40'
                    : 'bg-black/40 border-[#242424] hover:bg-[#242424]'
                }`}
              >
                <span className="text-[9px] text-gray-400 block truncate">{c.unit.name}</span>
                <div className="flex items-baseline justify-between gap-1">
                  <span className="font-mono text-[11px] font-bold text-white truncate">{c.result}</span>
                  <span className="text-[9px] text-[#FF9F0A] font-mono shrink-0">{c.unit.symbol}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-[#2C2C2E]/60 text-xs">
          <button
            type="button"
            onClick={() => handleCopy(conversionData.formattedResult || '')}
            className="flex items-center gap-1 px-2.5 py-0.5 bg-[#242424] hover:bg-[#333333] text-gray-300 hover:text-white rounded-full transition-colors border border-[#333333] text-[11px]"
          >
            {copied ? <Check className="w-3 h-3 text-[#30D158]" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendToCalc(conversionData.formattedResult || '0')}
            className="flex items-center gap-1 px-2.5 py-0.5 bg-[#242424] hover:bg-[#333333] text-gray-300 hover:text-white rounded-full transition-colors border border-[#333333] text-[11px]"
          >
            <Calculator className="w-3 h-3 text-[#FF9F0A]" />
            <span>Use in Calc</span>
          </button>
        </div>
      </div>
    </div>
  );
};
