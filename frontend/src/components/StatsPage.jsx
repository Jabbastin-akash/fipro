import React, { useState, useEffect } from 'react';
import { FaChartBar, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

// Import API service
import { getStats } from '../services/api';

/**
 * StatsPage Component
 * 
 * Displays statistics about fact-checking results.
 */
const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate percentage for visualization
  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return (value / total * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <FaSpinner className="animate-spin text-indigo-600 text-3xl mx-auto mb-4" />
        <p className="text-gray-600">Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-6 flex items-center">
        <FaExclamationTriangle className="mr-2" />
        {error}
      </div>
    );
  }

  if (!stats || stats.total_claims === 0) {
    return (
      <div>
        <div className="flex items-center mb-6">
          <FaChartBar className="text-indigo-600 text-2xl mr-2" />
          <h1 className="text-2xl font-semibold text-gray-800">Fact-Check Statistics</h1>
        </div>
        
        <div className="bg-gray-50 p-8 text-center rounded-md border border-gray-200">
          <p className="text-gray-600">No statistics available yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Check some facts to start gathering statistics!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <FaChartBar className="text-indigo-600 text-2xl mr-2" />
        <h1 className="text-2xl font-semibold text-gray-800">Fact-Check Statistics</h1>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Overview Card */}
        <div className="card">
          <div className="card-header bg-indigo-700 text-white">
            <h2 className="text-xl font-semibold">Overview</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-4xl font-bold text-indigo-700">{stats.total_claims}</p>
                <p className="text-sm text-gray-600 mt-1">Total Claims</p>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-4xl font-bold text-indigo-700">{stats.success_rate}%</p>
                <p className="text-sm text-gray-600 mt-1">Success Rate</p>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium text-gray-700 mb-2">Average Confidence</h3>
              <div className="confidence-meter">
                <div 
                  className={`confidence-level ${stats.average_confidence >= 75 ? 'confidence-high' : stats.average_confidence >= 40 ? 'confidence-medium' : 'confidence-low'}`}
                  style={{ width: `${stats.average_confidence}%` }}
                ></div>
              </div>
              <p className="text-right text-sm text-gray-600 mt-1">{stats.average_confidence}%</p>
            </div>
            
            {stats.average_processing_time_ms && (
              <div className="mt-4 text-sm text-gray-600">
                Average processing time: {(stats.average_processing_time_ms / 1000).toFixed(2)} seconds
              </div>
            )}
          </div>
        </div>
        
        {/* Verdict Distribution Card */}
        <div className="card">
          <div className="card-header bg-indigo-700 text-white">
            <h2 className="text-xl font-semibold">Verdict Distribution</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {/* True Claims */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">True</span>
                  <span className="text-sm text-gray-600">
                    {stats.true_claims} ({calculatePercentage(stats.true_claims, stats.total_claims)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${calculatePercentage(stats.true_claims, stats.total_claims)}%` }}></div>
                </div>
              </div>
              
              {/* False Claims */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">False</span>
                  <span className="text-sm text-gray-600">
                    {stats.false_claims} ({calculatePercentage(stats.false_claims, stats.total_claims)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${calculatePercentage(stats.false_claims, stats.total_claims)}%` }}></div>
                </div>
              </div>
              
              {/* Unverified Claims */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Unverified</span>
                  <span className="text-sm text-gray-600">
                    {stats.unverified_claims} ({calculatePercentage(stats.unverified_claims, stats.total_claims)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-gray-500 h-2.5 rounded-full" style={{ width: `${calculatePercentage(stats.unverified_claims, stats.total_claims)}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-3 bg-blue-50 rounded-md text-sm text-blue-700 border border-blue-100">
              <strong>Recent Activity:</strong> {stats.recent_claims_24h} claims checked in the last 24 hours
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;