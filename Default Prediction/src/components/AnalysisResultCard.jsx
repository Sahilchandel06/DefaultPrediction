import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import ApplicantDetailsModal from './ApplicantDetailsModal';

function AnalysisResultCard({ analysis, showNotification }) {
  const [analysisData, setAnalysisData] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicantId, setSelectedApplicantId] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  useEffect(() => {
    loadAnalysisData();
  }, [analysis.id]);

  const loadAnalysisData = async () => {
    try {
      setLoading(true);
      // Load complete analysis with applicants
      const response = await api.getAnalysisApplicants(analysis.id);
      if (response.status === 'success') {
        setAnalysisData(response.analysis_info);
        setApplicants(response.applicants);
      }
    } catch (error) {
      showNotification('Failed to load analysis data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplicantDetails = (applicant) => {
    setSelectedApplicantId(applicant.id);
    setDetailsModalOpen(true);
  };

  const getBadgeColor = (value) => {
    const lower = value?.toLowerCase() || '';
    if (lower === 'low' || lower === 'approve') return 'bg-green-100 text-green-800';
    if (lower === 'medium' || lower === 'review') return 'bg-yellow-100 text-yellow-800';
    if (lower === 'high' || lower === 'reject') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const riskStats = analysis.data?.portfolio_overview?.risk_distribution;
  const approvalStats = analysis.data?.portfolio_overview?.approval_summary;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{analysis.filename}</h3>
              <p className="text-sm text-gray-500">
                <i className="fas fa-calendar mr-1"></i>
                {new Date(analysis.timestamp).toLocaleDateString()} at {new Date(analysis.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
              ID: {analysis.id}
            </span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{analysis.total_applicants}</p>
              <p className="text-xs text-gray-600">Total Applicants</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{approvalStats?.Approve || 0}</p>
              <p className="text-xs text-gray-600">Approved</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{approvalStats?.Review || 0}</p>
              <p className="text-xs text-gray-600">Review</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{approvalStats?.Reject || 0}</p>
              <p className="text-xs text-gray-600">Rejected</p>
            </div>
          </div>

          {/* Risk Distribution */}
          {riskStats && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Risk Distribution</h4>
              <div className="flex space-x-2">
                <div className="flex-1 bg-green-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-500 h-full" 
                    style={{width: `${(riskStats.Low / analysis.total_applicants) * 100}%`}}
                  ></div>
                </div>
                <div className="flex-1 bg-yellow-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-yellow-500 h-full" 
                    style={{width: `${(riskStats.Medium / analysis.total_applicants) * 100}%`}}
                  ></div>
                </div>
                <div className="flex-1 bg-red-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-red-500 h-full" 
                    style={{width: `${(riskStats.High / analysis.total_applicants) * 100}%`}}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Low ({riskStats.Low})</span>
                <span>Medium ({riskStats.Medium})</span>
                <span>High ({riskStats.High})</span>
              </div>
            </div>
          )}

          {/* Applicants List */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Applicants ({applicants.length})</h4>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {applicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleViewApplicantDetails(applicant)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-gray-900">{applicant.applicant_id}</p>
                        <p className="text-sm text-gray-500">
                          Age: {applicant.demographics.age} • ₹{applicant.demographics.monthly_income?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(applicant.risk_assessment.overall_risk)}`}>
                      {applicant.risk_assessment.overall_risk}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(applicant.risk_assessment.recommendation)}`}>
                      {applicant.risk_assessment.recommendation}
                    </span>
                    <i className="fas fa-chevron-right text-gray-400 text-sm"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Applicant Details Modal */}
      <ApplicantDetailsModal
        applicantId={selectedApplicantId}
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedApplicantId(null);
        }}
        showNotification={showNotification}
      />
    </>
  );
}

export default AnalysisResultCard;
