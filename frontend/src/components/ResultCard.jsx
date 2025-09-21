import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

/**
 * Premium ResultCard Component
 * 
 * Advanced result display with animations, confidence visualization, and premium design
 */
const ResultCard = ({ result }) => {
  if (!result || !result.claim) {
    return null;
  }

  // Determine the verdict configuration
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
          gradientFrom: 'from-green-400',
          gradientTo: 'to-emerald-500',
          heading: 'Claim Verified ✓'
        };
      case 'FALSE':
        return {
          icon: XCircleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
          gradientFrom: 'from-red-400',
          gradientTo: 'to-rose-500',
          heading: 'Claim Disputed ✗'
        };
      case 'PARTIALLY_TRUE':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
          badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
          gradientFrom: 'from-amber-400',
          gradientTo: 'to-orange-500',
          heading: 'Partially True ⚠'
        };
      default:
        return {
          icon: InformationCircleIcon,
          color: 'text-slate-600',
          bgColor: 'bg-slate-50 dark:bg-slate-900/20',
          borderColor: 'border-slate-200 dark:border-slate-800',
          badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
          gradientFrom: 'from-slate-400',
          gradientTo: 'to-slate-500',
          heading: 'Analysis Complete'
        };
    }
  };

  // Get confidence visualization
  const getConfidenceInfo = (confidence) => {
    const score = Math.round(confidence * 100);
    if (score >= 90) return { label: 'Very High', color: 'bg-green-500', textColor: 'text-green-700' };
    if (score >= 75) return { label: 'High', color: 'bg-blue-500', textColor: 'text-blue-700' };
    if (score >= 60) return { label: 'Moderate', color: 'bg-amber-500', textColor: 'text-amber-700' };
    return { label: 'Low', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  // Format timestamp
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
      return 'Just now';
    }
  };

  const verdictInfo = getVerdictInfo(result.verdict);
  const confidenceInfo = getConfidenceInfo(result.confidence);
  const IconComponent = verdictInfo.icon;
  const confidenceScore = Math.round(result.confidence * 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
        className="w-full"
      >
        {/* Premium Result Card */}
        <motion.div
          className={clsx(
            "relative p-8 rounded-3xl border-2 backdrop-blur-sm shadow-xl",
            verdictInfo.bgColor,
            verdictInfo.borderColor
          )}
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {/* Background Gradient */}
          <div className={clsx(
            "absolute inset-0 bg-gradient-to-br opacity-5 rounded-3xl",
            verdictInfo.gradientFrom,
            verdictInfo.gradientTo
          )} />

          {/* Header */}
          <motion.div 
            className="relative flex items-center justify-between mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-3">
              <div className={clsx(
                "p-3 rounded-2xl",
                verdictInfo.badgeColor
              )}>
                <IconComponent className={clsx("w-8 h-8", verdictInfo.color)} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {verdictInfo.heading}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatTimestamp(result.timestamp)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Claim Display */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Analyzed Claim
            </h3>
            <div className="p-4 bg-white/50 dark:bg-slate-700/50 rounded-2xl border border-slate-200/50 dark:border-slate-600/50">
              <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
                "{result.claim}"
              </p>
            </div>
          </motion.div>

          {/* Confidence Section */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <ChartBarIcon className="w-5 h-5" />
                <span>Confidence Score</span>
              </h3>
              <div className="flex items-center space-x-2">
                <span className={clsx("text-sm font-medium", confidenceInfo.textColor)}>
                  {confidenceInfo.label}
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {confidenceScore}%
                </span>
              </div>
            </div>
            
            {/* Animated Confidence Bar */}
            <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className={clsx("h-full rounded-full", confidenceInfo.color)}
                initial={{ width: 0 }}
                animate={{ width: `${confidenceScore}%` }}
                transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </motion.div>

          {/* Explanation */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Analysis & Explanation
            </h3>
            <div className="p-4 bg-white/50 dark:bg-slate-700/50 rounded-2xl border border-slate-200/50 dark:border-slate-600/50">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {result.explanation}
              </p>
            </div>
          </motion.div>

          {/* Sources (if available) */}
          {result.sources && result.sources.length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center space-x-2">
                <LinkIcon className="w-5 h-5" />
                <span>Sources</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {result.sources.map((source, index) => (
                  <motion.div
                    key={index}
                    className="p-3 bg-white/50 dark:bg-slate-700/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50 text-sm"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="text-slate-600 dark:text-slate-400">
                      {source}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200/50 dark:border-slate-600/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span>Powered by AI Analysis</span>
            <span>Analysis ID: #{result.id || Math.random().toString(36).substr(2, 9)}</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

ResultCard.propTypes = {
  result: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    claim: PropTypes.string.isRequired,
    verdict: PropTypes.string.isRequired,
    confidence: PropTypes.number.isRequired,
    explanation: PropTypes.string.isRequired,
    timestamp: PropTypes.string,
    sources: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
};

export default ResultCard;