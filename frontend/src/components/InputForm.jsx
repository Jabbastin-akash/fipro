import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  SparklesIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

/**
 * Premium InputForm Component
 * 
 * Advanced form with animations, validation, and premium UX
 */
const InputForm = ({ onSubmit, isLoading }) => {
  const [claim, setClaim] = useState('');
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  const maxChars = 500;
  const minChars = 10;

  useEffect(() => {
    setCharCount(claim.length);
  }, [claim]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate input
    const trimmedClaim = claim.trim();
    
    if (!trimmedClaim) {
      setError('Please enter a claim to fact-check');
      return;
    }
    
    if (trimmedClaim.length < minChars) {
      setError(`Claim is too short. Please enter at least ${minChars} characters.`);
      return;
    }
    
    if (trimmedClaim.length > maxChars) {
      setError(`Claim is too long. Please keep it under ${maxChars} characters.`);
      return;
    }
    
    // Clear error and submit
    setError('');
    onSubmit(trimmedClaim);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setClaim(value);
      if (error) setError(''); // Clear error on input change
    }
  };

  const isValid = claim.trim().length >= minChars && claim.trim().length <= maxChars;
  const charCountColor = charCount > maxChars * 0.9 ? 'text-red-500' : 
                        charCount > maxChars * 0.7 ? 'text-amber-500' : 
                        'text-slate-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      {/* Header */}
      <motion.div 
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Submit Your Claim
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Our AI will analyze and verify the accuracy of your statement
        </p>
      </motion.div>

      {/* Premium Form Card */}
      <motion.div
        className={clsx(
          "relative p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl border transition-all duration-300 group",
          isFocused 
            ? "border-blue-300 dark:border-blue-600 shadow-xl shadow-blue-500/10" 
            : "border-slate-200/50 dark:border-slate-700/50 shadow-lg"
        )}
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <form onSubmit={handleSubmit} className="relative space-y-6">
          {/* Input Label */}
          <div className="space-y-2">
            <label 
              htmlFor="claim" 
              className="flex items-center space-x-2 text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              <SparklesIcon className="w-5 h-5 text-blue-500" />
              <span>Your Claim</span>
            </label>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter any statement, fact, or claim you'd like to verify
            </p>
          </div>

          {/* Premium Textarea Container */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              id="claim"
              value={claim}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="e.g., The Earth is flat, 2+2 equals 4, The sun is bigger than Earth..."
              className={clsx(
                "w-full h-32 px-6 py-4 text-lg bg-slate-50 dark:bg-slate-700/50 border rounded-2xl transition-all duration-300 resize-none focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400",
                error 
                  ? "border-red-300 dark:border-red-600 bg-red-50/50 dark:bg-red-900/10" 
                  : isFocused
                    ? "border-blue-300 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/10"
                    : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
              )}
              disabled={isLoading}
            />
            
            {/* Character Count */}
            <div className="absolute bottom-3 right-3 flex items-center space-x-2">
              <span className={clsx("text-xs font-medium", charCountColor)}>
                {charCount}/{maxChars}
              </span>
              {isValid && (
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm"
              >
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips */}
          <motion.div 
            className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="font-medium mb-2">💡 For best results:</p>
            <ul className="space-y-1">
              <li>• Be specific and concise</li>
              <li>• Focus on factual claims (not opinions)</li>
              <li>• Include specific details (numbers, dates, locations)</li>
            </ul>
          </motion.div>
          
          {/* Submit Button */}
          <motion.button
            type="submit"
            className={clsx(
              "w-full px-8 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center space-x-3 transition-all duration-300",
              isValid && !isLoading
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
            )}
            disabled={!isValid || isLoading}
            whileHover={isValid && !isLoading ? { scale: 1.02 } : {}}
            whileTap={isValid && !isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing Claim...</span>
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="w-5 h-5" />
                <span>Check Fact</span>
                <ArrowRightIcon className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>
        
        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Our AI is analyzing this claim...
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  This may take a few moments
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <motion.div 
        className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Powered by Pathway + LLaMA
      </motion.div>
    </motion.div>
  );
};

InputForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default InputForm;