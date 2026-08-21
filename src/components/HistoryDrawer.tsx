import React, { useState, useMemo } from 'react';
import { 
  X, 
  Trash2, 
  Copy, 
  Check, 
  Calculator, 
  Search, 
  Download, 
  Clock, 
  History as HistoryIcon,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHistory } from '../context/HistoryContext';
import { CalculationType, HistoryItem } from '../types/history';

const TYPE_LABELS: Record<CalculationType, { label: string; color: string }> = {
  standard: { label: 'Standard', color: 'bg-[#FF9F0A]/20 text-[#FF9F0A] border-[#FF9F0A]/40' },
  scientific: { label: 'Scientific', color: 'bg-[#FF9F0A]/20 text-[#FF9F0A] border-[#FF9F0A]/40' },
  fraction: { label: 'Fraction', color: 'bg-[#30D158]/20 text-[#30D158] border-[#30D158]/40' },
  equation: { label: 'Equation', color: 'bg-[#A5A5A5]/20 text-white border-[#A5A5A5]/40' },
  conversion: { label: 'Conversion', color: 'bg-[#FF9F0A]/20 text-[#FF9F0A] border-[#FF9F0A]/40' },
  statistics: { label: 'Statistics', color: 'bg-[#A5A5A5]/20 text-white border-[#A5A5A5]/40' },
};

export const HistoryDrawer: React.FC = () => {
  const { 
    history, 
    clearHistory, 
    deleteHistoryItem, 
    isDrawerOpen, 
    setIsDrawerOpen,
    setActiveModule,
    setInjectedExpression
  } = useHistory();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        item.expression.toLowerCase().includes(q) ||
        item.result.toLowerCase().includes(q) ||
        (item.details && item.details.toLowerCase().includes(q));

      return matchesType && matchesSearch;
    });
  }, [history, selectedType, searchQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUseInCalculator = (item: HistoryItem) => {
    setInjectedExpression(item.expression || item.result);
    setActiveModule('standard');
    setIsDrawerOpen(false);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `smart_calc_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (!isDrawerOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs"
        />

        {/* Drawer Content */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative z-50 w-full max-w-md h-full bg-black border-l border-[#2C2C2E] shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#2C2C2E]">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-full bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/30">
                <HistoryIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Calculation History</h2>
                <p className="text-xs text-[#8E8E93]">{history.length} saved entries</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {history.length > 0 && (
                <>
                  <button
                    id="export-history-btn"
                    type="button"
                    onClick={handleExport}
                    title="Export to JSON"
                    className="p-2.5 rounded-full bg-[#242424] hover:bg-[#333333] text-gray-300 border border-[#333333] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    id="clear-history-btn"
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    title="Clear All History"
                    className="p-2.5 rounded-full bg-[#FF453A]/20 hover:bg-[#FF453A]/30 text-[#FF453A] border border-[#FF453A]/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                id="close-history-btn"
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2.5 rounded-full bg-[#242424] hover:bg-[#333333] text-gray-300 border border-[#333333] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Clear Confirmation Banner */}
          {showClearConfirm && (
            <div className="p-4 bg-[#FF453A]/20 border-b border-[#FF453A]/40 flex flex-col gap-2">
              <span className="text-xs text-red-200 font-medium">
                Are you sure you want to delete all calculation history? This action cannot be undone.
              </span>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1 bg-[#242424] text-gray-300 text-xs rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearHistory();
                    setShowClearConfirm(false);
                  }}
                  className="px-3 py-1 bg-[#FF453A] hover:bg-[#FF453A]/80 text-white text-xs rounded-full font-medium shadow-sm"
                >
                  Confirm Delete All
                </button>
              </div>
            </div>
          )}

          {/* Search & Filters */}
          <div className="p-4 border-b border-[#2C2C2E] flex flex-col gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search calculations..."
                className="w-full pl-9 pr-3 py-2 bg-[#1C1C1E] border border-[#2C2C2E] rounded-full text-xs text-white placeholder-[#8E8E93] focus:outline-none focus:border-[#FF9F0A] font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Type Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All' },
                { id: 'standard', label: 'Standard' },
                { id: 'scientific', label: 'Scientific' },
                { id: 'fraction', label: 'Fractions' },
                { id: 'equation', label: 'Equations' },
                { id: 'conversion', label: 'Conversions' },
                { id: 'statistics', label: 'Stats' },
              ].map((chip) => {
                const isActive = selectedType === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setSelectedType(chip.id)}
                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border shrink-0 ${
                      isActive
                        ? 'bg-[#FF9F0A] text-white border-transparent'
                        : 'bg-[#1C1C1E] text-[#8E8E93] border-[#2C2C2E] hover:text-white'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List of History Items */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-none">
            {filteredHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8E8E93]">
                <Clock className="w-12 h-12 text-[#2C2C2E] mb-3" />
                <p className="text-sm font-medium text-gray-300">No calculation history found</p>
                <p className="text-xs text-[#8E8E93] mt-1 max-w-xs">
                  {searchQuery || selectedType !== 'all'
                    ? 'No results match your search query or filter.'
                    : 'Calculations from standard math, fractions, equations, and conversions will appear here.'}
                </p>
              </div>
            ) : (
              filteredHistory.map((item) => {
                const typeStyle = TYPE_LABELS[item.type] || TYPE_LABELS.standard;
                return (
                  <div
                    key={item.id}
                    className="p-4 bg-[#1C1C1E] hover:bg-[#242424] border border-[#2C2C2E] rounded-[24px] flex flex-col gap-2 transition-all group shadow-sm"
                  >
                    {/* Top Type & Time */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wider ${typeStyle.color}`}>
                        {typeStyle.label}
                      </span>
                      <span className="text-[11px] text-[#8E8E93] font-medium">
                        {formatTimeAgo(item.timestamp)}
                      </span>
                    </div>

                    {/* Expression & Result */}
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-xs text-[#8E8E93] truncate">
                        {item.expression}
                      </span>
                      <span className="font-mono text-lg font-bold text-white break-words">
                        = {item.result}
                      </span>
                    </div>

                    {/* Optional details */}
                    {item.details && (
                      <span className="text-[11px] text-gray-300 bg-black/60 p-2.5 rounded-2xl border border-[#2C2C2E] font-sans leading-relaxed">
                        {item.details}
                      </span>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#2C2C2E]">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.result, item.id)}
                        title="Copy Result"
                        className="p-2 rounded-full bg-[#242424] hover:bg-[#333333] text-gray-300 hover:text-white transition-colors"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-[#30D158]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUseInCalculator(item)}
                        title="Use in Standard Calculator"
                        className="p-2 rounded-full bg-[#FF9F0A]/20 hover:bg-[#FF9F0A]/30 text-[#FF9F0A] border border-[#FF9F0A]/30 transition-colors"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteHistoryItem(item.id)}
                        title="Delete Item"
                        className="p-2 rounded-full bg-[#FF453A]/20 hover:bg-[#FF453A]/30 text-[#FF453A] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
