import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ChartBarIcon, 
  MoonIcon, 
  SunIcon,
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Toaster, toast } from 'react-hot-toast';
import clsx from 'clsx';

// Import Components
import InputForm from './components/InputForm';
import ResultCard from './components/ResultCard';
import HistoryPage from './components/HistoryPage';
import StatsPage from './components/StatsPage';

// Import API service
import { checkFact } from './services/api';

const App = () => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const location = useLocation();

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Handle form submission with enhanced UX
  const handleCheckFact = async (claim) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Show loading toast
      const loadingToast = toast.loading('Analyzing claim...', {
        style: {
          borderRadius: '12px',
          background: darkMode ? '#1e293b' : '#ffffff',
          color: darkMode ? '#f1f5f9' : '#0f172a',
        },
      });

      const response = await checkFact(claim);
      setResult(response);
      
      // Show success toast with verdict
      toast.success(`Analysis complete: ${response.verdict}`, {
        id: loadingToast,
        duration: 4000,
        style: {
          borderRadius: '12px',
          background: darkMode ? '#1e293b' : '#ffffff',
          color: darkMode ? '#f1f5f9' : '#0f172a',
        },
      });

    } catch (err) {
      console.error('Error checking fact:', err);
      const errorMessage = err.message || 'Failed to check fact. Please try again later.';
      setError(errorMessage);
      
      toast.error(errorMessage, {
        duration: 5000,
        style: {
          borderRadius: '12px',
          background: darkMode ? '#1e293b' : '#ffffff',
          color: darkMode ? '#f1f5f9' : '#0f172a',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Premium Navigation Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/20 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Brand */}
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShieldCheckIcon className="w-7 h-7 text-white" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Fact Checker AI
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Powered by Pathway & LLaMA</p>
              </div>
            </motion.div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {[
                { to: '/', icon: CheckCircleIcon, label: 'Check Facts', color: 'blue' },
                { to: '/history', icon: ClockIcon, label: 'History', color: 'purple' },
                { to: '/stats', icon: ChartBarIcon, label: 'Analytics', color: 'indigo' }
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => clsx(
                    'relative flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300',
                    isActive
                      ? `bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-700 dark:text-${item.color}-300`
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {location.pathname === item.to && (
                    <motion.div
                      className={`absolute bottom-0 left-1/2 w-2 h-2 bg-${item.color}-500 rounded-full`}
                      layoutId="activeTab"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      style={{ transform: 'translateX(-50%)' }}
                    />
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Dark Mode Toggle & Actions */}
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={toggleDarkMode}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-300"
              >
                {darkMode ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </motion.button>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 dark:from-green-400/10 dark:to-blue-400/10 rounded-xl border border-green-200/50 dark:border-green-700/50"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  AI Online
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Hero Section */}
                <div className="text-center space-y-6 py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full border border-blue-200/50 dark:border-blue-700/50"
                  >
                    <SparklesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      AI-Powered Fact Verification
                    </span>
                  </motion.div>
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-slate-100 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent leading-tight"
                  >
                    Verify Claims
                    <br />
                    <span className="text-4xl sm:text-5xl">Instantly</span>
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
                  >
                    Harness the power of advanced AI to fact-check any claim with precision.
                    Get detailed analysis, confidence scores, and comprehensive explanations.
                  </motion.p>
                </div>

                {/* Main Interface */}
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <InputForm onSubmit={handleCheckFact} isLoading={isLoading} />
                    
                    {/* Quick Examples */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                      className="mt-8 p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50"
                    >
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                        Try these examples:
                      </h3>
                      <div className="space-y-3">
                        {[
                          "The Earth is flat",
                          "2+2 equals 4",
                          "The sun is bigger than the Earth"
                        ].map((example, index) => (
                          <motion.button
                            key={example}
                            onClick={() => handleCheckFact(example)}
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + index * 0.1 }}
                            className="w-full text-left p-3 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            "{example}"
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="lg:sticky lg:top-8"
                  >
                    <AnimatePresence mode="wait">
                      {result ? (
                        <ResultCard result={result} />
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="h-96 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center"
                        >
                          <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                              <ShieldCheckIcon className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-lg">
                              Enter a claim to see the analysis
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </motion.div>
            } />
            
            <Route path="/history" element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <HistoryPage />
              </motion.div>
            } />
            
            <Route path="/stats" element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <StatsPage />
              </motion.div>
            } />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Premium Footer */}
      <motion.footer 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="relative mt-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Fact Checker AI
              </span>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Empowering truth through advanced AI technology. Built with Pathway for data processing 
              and LLaMA for intelligent analysis. Making fact-checking accessible to everyone.
            </p>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-slate-500 dark:text-slate-400">
              <span>© 2025 Fact Checker AI</span>
              <span></span>
              <span>Adengappa nallu per</span>
              <span>•</span>
              <span>Powered by AI</span>
              <span>•</span>
              <span>Built with ❤️</span>
            </div>
          </div>
        </div>
      </motion.footer>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: darkMode ? '#1e293b' : '#ffffff',
            color: darkMode ? '#f1f5f9' : '#0f172a',
            border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />
    </div>
  );
};

export default App;