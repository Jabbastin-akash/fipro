/**
 * API Service
 * 
 * This module handles all API requests to the backend server.
 */

import axios from 'axios';
import { toast } from 'react-toastify';

// Base URL from environment variable or default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

// Create axios instance with common configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An unknown error occurred';
    console.error('API Error:', message);
    toast.error(`Error: ${message}`);
    return Promise.reject(error);
  }
);

/**
 * Submit a claim for fact-checking
 * 
 * @param {string} claim - The claim text to check
 * @returns {Promise<Object>} - The fact-check result
 */
export const checkFact = async (claim) => {
  try {
    const response = await apiClient.post('/check', { claim });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to check fact');
  }
};

/**
 * Get fact-check history
 * 
 * @param {number} limit - Maximum number of results to retrieve
 * @param {number} offset - Number of results to skip
 * @returns {Promise<Array>} - Array of historical fact-check results
 */
export const getHistory = async (limit = 50, offset = 0) => {
  try {
    const response = await apiClient.get('/history', {
      params: { limit, offset }
    });
    return response.data.history; // Extract the history array from the response
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to retrieve history');
  }
};

/**
 * Get fact-checking statistics
 * 
 * @returns {Promise<Object>} - Statistics object
 */
export const getStats = async () => {
  try {
    const response = await apiClient.get('/stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to retrieve statistics');
  }
};

/**
 * Check API health
 * 
 * @returns {Promise<Object>} - Health status information
 */
export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('API is not available');
  }
};

/**
 * Search for claims
 * 
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Search results
 */
export const searchClaims = async (query, limit = 20) => {
  try {
    const response = await apiClient.get('/search', {
      params: { query, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to search claims');
  }
};