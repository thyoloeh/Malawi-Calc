import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Divide, 
  TrendingUp, 
  ArrowRightLeft, 
  BarChart3, 
  History, 
  Maximize, 
  Minimize, 
  Keyboard, 
  X,
  ChevronDown,
  LayoutGrid,
  Sparkles,
  ShieldCheck,
  Zap,
  ClipboardPaste,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HistoryProvider, useHistory } from './context/HistoryContext';
import { StandardCalculator } from './components/StandardCalculator';
import { FractionsModule } from './components/FractionsModule';
import { EquationSolvers } from './components/EquationSolvers';
import { ConversionModule } from './components/ConversionModule';
import { StatisticsModule } from './components/StatisticsModule';
import { HistoryDrawer } from './components/HistoryDrawer';

const NAV_TABS = [
  { id: 'standard', label: 'Calculator', icon: Calculator, desc: 'Standard & Scientific' },
  { id: 'fractions', label: 'Fractions', icon: Divide, desc: 'Operations & Reduction' },
  { id: 'equations', label: 'Equations', icon: TrendingUp, desc: 'Quadratic, Cubic, Systems & Roots' },
  { id: 'conversions', label: 'Unit Converter', icon: ArrowRightLeft, desc: '11 Unit Dimensions' },
  { id: 'statistics', label: 'Statistics', icon: BarChart3, desc: 'Metrics & Dispersion' },
] as const;

const AppContent: React.FC = () => {
  const { 
    activeModule, 
    setActiveModule, 
    history, 
    setIsDrawerOpen,
    toastMessage,
    pasteText,
    setInjectedExpression
  } = useHistory();
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isModuleMenuOpen, setIsModuleMenuOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const handleHeaderPaste = async () => {
    const text = await pasteText();
    if (text) {
      setInjectedExpression(text);
      if (activeModule !== 'standard') {
        setActiveModule('standard');
      }
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const activeTabInfo = NAV_TABS.find((t) => t.id === activeModule) || NAV_TABS[0];
  const ActiveIcon = activeTabInfo.icon;

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-black text-white flex flex-col selection:bg-[#FF9F0A] selection:text-white font-sans antialiased flex-1">
      {/* Background Subtle Ambient Tone */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/3 w-[500px] h-[500px] bg-[#FF9F0A]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl" />
      </div>

      {/* Primary Header - Clean & Focused */}
      <header className="relative z-20 border-b border-[#1C1C1E] bg-black/90 backdrop-blur-xl sticky top-0 w-full">
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 h-12 sm:h-14 flex items-center justify-between">
          
          {/* Active Module Switcher (Clean Dropdown / Pill) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsModuleMenuOpen(!isModuleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] text-white border border-[#2C2C2E] transition-all active:scale-95 group shadow-sm"
              title="Click to switch calculator module"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FF9F0A] flex items-center justify-center shadow-sm">
                <ActiveIcon className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                {activeTabInfo.label}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 text-gray-400 group-hover:text-white transition-transform ${isModuleMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Module Picker Dropdown */}
            <AnimatePresence>
              {isModuleMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsModuleMenuOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-2 w-64 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-1.5 shadow-2xl z-50 flex flex-col gap-1 backdrop-blur-2xl"
                  >
                    <div className="px-3 py-1 text-[11px] font-mono text-gray-500 uppercase tracking-wider">
                      Switch Mode
                    </div>
                    {NAV_TABS.map((tab) => {
                      const Icon = tab.icon;
                      const isSelected = activeModule === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setActiveModule(tab.id as any);
                            setIsModuleMenuOpen(false);
                          }}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all ${
                            isSelected
                              ? 'bg-[#FF9F0A] text-white font-bold shadow-md'
                              : 'text-gray-300 hover:text-white hover:bg-[#2C2C2E]'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-[#242424]'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-semibold">{tab.label}</span>
                            <span className={`text-[11px] ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                              {tab.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Action Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 100% Offline Ready Badge */}
            <div 
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1C1C1E] border border-[#2C2C2E] text-xs font-mono text-gray-300 shadow-sm"
              title="All calculations run 100% locally on your device with zero internet requirement"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-gray-300">100% Offline Ready</span>
            </div>

            {/* Quick Paste to Window Button */}
            <button
              id="header-paste-btn"
              type="button"
              onClick={handleHeaderPaste}
              title="Paste copied item onto Calculator display"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] text-gray-300 hover:text-white border border-[#2C2C2E] font-medium text-xs sm:text-sm transition-all shadow-sm active:scale-95"
            >
              <ClipboardPaste className="w-4 h-4 text-[#FF9F0A]" />
              <span className="hidden sm:inline">Paste</span>
            </button>

            {/* Keyboard Shortcuts Trigger */}
            <button
              id="shortcuts-btn"
              type="button"
              onClick={() => setShowShortcuts(true)}
              title="Keyboard Shortcuts"
              className="p-2 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] text-gray-300 hover:text-white border border-[#2C2C2E] transition-all"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Fullscreen Trigger */}
            <button
              id="fullscreen-btn"
              type="button"
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className="p-2 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] text-gray-300 hover:text-white border border-[#2C2C2E] transition-all flex"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* History Drawer Toggle Button */}
            <button
              id="history-drawer-toggle"
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] text-white border border-[#2C2C2E] font-medium text-xs sm:text-sm transition-all shadow-sm active:scale-95"
            >
              <History className="w-4 h-4 text-[#FF9F0A]" />
              <span className="hidden sm:inline">History</span>
              {history.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#FF9F0A] text-black font-mono text-xs font-bold">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Floating Global Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="fixed top-16 sm:top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[#1C1C1E]/95 border border-[#FF9F0A]/60 text-white rounded-full shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-medium backdrop-blur-md pointer-events-none"
          >
            <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
            <span className="font-mono text-gray-100">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main App Work Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-4 md:px-6 py-2.5 sm:py-4 flex flex-col justify-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="w-full flex-1 flex flex-col items-center justify-start"
          >
            {activeModule === 'standard' && <StandardCalculator />}
            {activeModule === 'fractions' && <FractionsModule />}
            {activeModule === 'equations' && <EquationSolvers />}
            {activeModule === 'conversions' && <ConversionModule />}
            {activeModule === 'statistics' && <StatisticsModule />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShortcuts(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-50 w-full max-w-lg bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl p-6 shadow-2xl flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-[#2C2C2E] pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#FF9F0A]/20 flex items-center justify-center">
                    <Keyboard className="w-4 h-4 text-[#FF9F0A]" />
                  </div>
                  <h3 className="text-base font-bold text-white">Keyboard Shortcuts</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowShortcuts(false)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#2C2C2E]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-black/60 rounded-2xl border border-[#2C2C2E] flex items-center justify-between">
                  <span className="text-gray-400">Paste Copied Item</span>
                  <kbd className="px-2.5 py-1 bg-[#FF9F0A] text-black font-bold rounded-lg font-mono">Ctrl / ⌘ + V</kbd>
                </div>
                <div className="p-3 bg-black/60 rounded-2xl border border-[#2C2C2E] flex items-center justify-between">
                  <span className="text-gray-400">Copy Result</span>
                  <kbd className="px-2.5 py-1 bg-[#333333] rounded-lg text-white font-mono font-medium">Ctrl / ⌘ + C</kbd>
                </div>
                <div className="p-3 bg-black/60 rounded-2xl border border-[#2C2C2E] flex items-center justify-between">
                  <span className="text-gray-400">Calculate / Equals</span>
                  <kbd className="px-2.5 py-1 bg-[#333333] rounded-lg text-white font-mono font-medium">Enter / =</kbd>
                </div>
                <div className="p-3 bg-black/60 rounded-2xl border border-[#2C2C2E] flex items-center justify-between">
                  <span className="text-gray-400">Clear All (CLR)</span>
                  <kbd className="px-2.5 py-1 bg-[#A5A5A5] text-black rounded-lg font-mono font-bold">Escape</kbd>
                </div>
                <div className="p-3 bg-black/60 rounded-2xl border border-[#2C2C2E] flex items-center justify-between">
                  <span className="text-gray-400">Delete Character</span>
                  <kbd className="px-2.5 py-1 bg-[#333333] rounded-lg text-white font-mono font-medium">Backspace</kbd>
                </div>
                <div className="p-3 bg-black/60 rounded-2xl border border-[#2C2C2E] flex items-center justify-between">
                  <span className="text-gray-400">Pi (π) Constant</span>
                  <kbd className="px-2.5 py-1 bg-[#333333] rounded-lg text-white font-mono font-medium">P</kbd>
                </div>
                <div className="p-3 bg-black/60 rounded-2xl border border-[#2C2C2E] flex items-center justify-between">
                  <span className="text-gray-400">Euler's (e) Constant</span>
                  <kbd className="px-2.5 py-1 bg-[#333333] rounded-lg text-white font-mono font-medium">E</kbd>
                </div>
                <div className="p-3 bg-black/60 rounded-2xl border border-[#2C2C2E] flex items-center justify-between">
                  <span className="text-gray-400">Power exponent</span>
                  <kbd className="px-2.5 py-1 bg-[#333333] rounded-lg text-white font-mono font-medium">^</kbd>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Slide-over Drawer */}
      <HistoryDrawer />
    </div>
  );
};

export default function App() {
  return (
    <HistoryProvider>
      <AppContent />
    </HistoryProvider>
  );
}
