import React, { useState } from 'react';
import AnalysisResultCard from './AnalysisResultCard';

function AnalysisHistory({ history, onDeleteAnalysis, showNotification }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');
  const [deleting, setDeleting] = useState(new Set());

  const handleDelete = async (e, analysisId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) {
      setDeleting(prev => new Set([...prev, analysisId]));
      try {
        await onDeleteAnalysis(analysisId);
        showNotification('✅ Analysis deleted from database', 'success');
      } catch (error) {
        console.error('Delete error:', error);
        showNotification('❌ Failed to delete analysis', 'error');
      } finally {
        setDeleting(prev => {
          const newSet = new Set(prev);
          newSet.delete(analysisId);
          return newSet;
        });
      }
    }
  };

  const filteredHistory = history
    .filter(analysis => {
      const matchesSearch = analysis.filename.toLowerCase().includes(searchTerm.toLowerCase());
      if (filterBy === 'all') return matchesSearch;
      
      const approveCount = analysis.data?.portfolio_overview?.approval_summary?.Approve || 0;
      const totalCount = analysis.data?.analysis_metadata?.total_applicants || 1;
      const approvalRate = approveCount / totalCount;
      
      if (filterBy === 'high-approval' && approvalRate >= 0.7) return matchesSearch;
      if (filterBy === 'medium-approval' && approvalRate >= 0.4 && approvalRate < 0.7) return matchesSearch;
      if (filterBy === 'low-approval' && approvalRate < 0.4) return matchesSearch;
      return false;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.timestamp) - new Date(a.timestamp);
      if (sortBy === 'name') return a.filename.localeCompare(b.filename);
      if (sortBy === 'applicants') return (b.data?.analysis_metadata?.total_applicants || 0) - (a.data?.analysis_metadata?.total_applicants || 0);
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis History</h2>
        <p className="text-gray-600">Browse and manage your stored credit risk analyses</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search by filename..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Date (newest first)</option>
              <option value="name">Name (A-Z)</option>
              <option value="applicants">Applicants count</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
            >
              <option value="all">All analyses</option>
              <option value="high-approval">High approval rate (≥70%)</option>
              <option value="medium-approval">Medium approval rate (40-70%)</option>
              <option value="low-approval">Low approval rate (under 40%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <i className="fas fa-database text-4xl text-gray-400 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No matching analyses found' : 'No analyses yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search criteria' : 'Upload your first dataset to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredHistory.map((analysis) => (
            <div key={analysis.id} className="relative">
              {deleting.has(analysis.id) && (
                <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center z-10">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-spinner animate-spin text-red-500"></i>
                    <span className="text-red-600">Deleting...</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <AnalysisResultCard
                    analysis={analysis}
                    showNotification={showNotification}
                  />
                </div>
                
                <button
                  onClick={(e) => handleDelete(e, analysis.id)}
                  className="mt-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={deleting.has(analysis.id)}
                >
                  <i className="fas fa-trash text-sm"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AnalysisHistory;
