import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClockIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

// Import API service
import { getHistory } from '../services/api';

/**
 * Premium HistoryPage Component
 * 
 * Displays a premium list of previously fact-checked claims with animations
 */
const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      console.log('Fetching history...');
      const results = await getHistory(50, 0); // Get up to 50 recent items
      console.log('History results:', results);
      setHistory(results || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load fact-check history. Please try again later.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchHistory(true);
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Recently';
    }
  };

  // Helper function to get verdict configuration
  const getVerdictInfo = (verdict) => {
    const normalizedVerdict = verdict?.toUpperCase();
    
    switch (normalizedVerdict) {
      case 'TRUE':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        };
      case 'FALSE':
        return {
          icon: XCircleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
      case 'PARTIALLY_TRUE':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
          badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        };
      default:
        return {
          icon: EyeIcon,
          color: 'text-slate-600',
          bgColor: 'bg-slate-50 dark:bg-slate-900/20',
          borderColor: 'border-slate-200 dark:border-slate-800',
          badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto"
    >
      {/* Premium Header */}
      <motion.div 
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
            <ClockIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Fact-Check History
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Review your previous fact-checking results
            </p>
          </div>
        </div>
        
        <motion.button
          onClick={handleRefresh}
          disabled={refreshing}
          className={clsx(
            "px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-all duration-200",
            refreshing 
              ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
          )}
          whileHover={!refreshing ? { scale: 1.05 } : {}}
          whileTap={!refreshing ? { scale: 0.95 } : {}}
        >
          <ArrowPathIcon className={clsx("w-4 h-4", refreshing && "animate-spin")} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </motion.button>
      </motion.div>
      
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 mb-6 flex items-center space-x-2"
          >
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* History Content */}
      <AnimatePresence>
        {history.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {history.map((item, index) => {
              const verdictInfo = getVerdictInfo(item.verdict);
              const IconComponent = verdictInfo.icon;
              const confidenceScore = Math.round((item.confidence || 0) * 100);
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={clsx(
                    "p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300",
                    verdictInfo.bgColor,
                    verdictInfo.borderColor,
                    "hover:shadow-lg hover:scale-[1.01]"
                  )}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={clsx("p-2 rounded-lg", verdictInfo.badgeColor)}>
                          <IconComponent className={clsx("w-5 h-5", verdictInfo.color)} />
                        </div>
                        <div>
                          <span className={clsx("px-3 py-1 rounded-full text-sm font-medium", verdictInfo.badgeColor)}>
                            {item.verdict} ({confidenceScore}%)
                          </span>
                        </div>
                      </div>
                      
                      <blockquote className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                        "{item.claim}"
                      </blockquote>
                      
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Analyzed {formatTimestamp(item.timestamp)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        ID: #{item.id}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : !isLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 max-w-md mx-auto">
              <ClockIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No History Yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                You haven't fact-checked any claims yet. Start by submitting a claim on the home page!
              </p>
              <motion.button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Check Your First Fact
              </motion.button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      
      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg">Loading your history...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HistoryPage;