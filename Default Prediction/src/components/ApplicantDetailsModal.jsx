import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

function ApplicantDetailsModal({ applicantId, isOpen, onClose, showNotification }) {
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && applicantId) {
      loadApplicantDetails();
    }
  }, [isOpen, applicantId]);

  const loadApplicantDetails = async () => {
    setLoading(true);
    try {
      console.log('Loading applicant details for ID:', applicantId);
      const response = await api.getApplicantDetails(applicantId);
      console.log('API Response:', response);
      
      if (response.status === 'success') {
        setApplicant(response.applicant);
        showNotification('✅ Applicant details loaded successfully', 'success');
      } else {
        showNotification('❌ Failed to load applicant details', 'error');
      }
    } catch (error) {
      console.error('Error loading applicant details:', error);
      showNotification('❌ Failed to load applicant details', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  const getBadgeColor = (value) => {
    const lower = value?.toLowerCase() || '';
    if (lower === 'low' || lower === 'approve') return 'bg-green-100 text-green-800';
    if (lower === 'medium' || lower === 'review') return 'bg-yellow-100 text-yellow-800';
    if (lower === 'high' || lower === 'reject') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Complete Applicant Profile</h2>
              <p className="text-blue-100">
                {applicant ? `ID: ${applicant.applicant_id}` : 'Loading...'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <i className="fas fa-spinner animate-spin text-3xl text-blue-500 mb-4"></i>
              <p className="text-gray-600">Loading applicant details...</p>
            </div>
          </div>
        ) : applicant ? (
          <div className="flex flex-col h-full">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b">
              <div className="text-center">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(applicant.risk_assessment.overall_risk)}`}>
                  {applicant.risk_assessment.overall_risk}
                </span>
                <p className="text-xs text-gray-600 mt-1">Risk Level</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-600">
                  {(applicant.risk_assessment.default_probability * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600">Default Risk</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(applicant.demographics.monthly_income)}
                </p>
                <p className="text-xs text-gray-600">Monthly Income</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b bg-white">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: 'fa-user' },
                  { id: 'financial', label: 'Financial', icon: 'fa-chart-line' },
                  { id: 'digital', label: 'Digital', icon: 'fa-mobile-alt' },
                  { id: 'risk', label: 'Risk Assessment', icon: 'fa-shield-alt' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <i className={`fas ${tab.icon} mr-2`}></i>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Demographics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Age:</span>
                          <span className="font-medium">{applicant.demographics.age} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gender:</span>
                          <span className="font-medium">{applicant.demographics.gender}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Education:</span>
                          <span className="font-medium">{applicant.demographics.education}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Employment:</span>
                          <span className="font-medium">{applicant.demographics.employment}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Recommendation</h4>
                      <div className="text-center">
                        <span className={`inline-block px-4 py-2 rounded-full text-lg font-medium ${getBadgeColor(applicant.risk_assessment.recommendation)}`}>
                          {applicant.risk_assessment.recommendation}
                        </span>
                        <p className="text-sm text-gray-600 mt-2">
                          Based on comprehensive risk analysis
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Loan Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Eligibility:</span>
                        <span className="font-medium">{applicant.loan_details.eligibility}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Amount:</span>
                        <span className="font-medium">{formatCurrency(applicant.loan_details.loan_range.maximum)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'financial' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Financial Profile</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Monthly Income', value: formatCurrency(applicant.financial_profile.monthly_income) },
                      { label: 'Monthly Expenses', value: formatCurrency(applicant.financial_profile.monthly_expenses) },
                      { label: 'Monthly Savings', value: formatCurrency(applicant.financial_profile.monthly_savings) },
                      { label: 'Outstanding Loans', value: formatCurrency(applicant.financial_profile.outstanding_loan_amount) },
                      { label: 'Property Value', value: formatCurrency(applicant.financial_profile.property_value) },
                      { label: 'Vehicle Value', value: formatCurrency(applicant.financial_profile.vehicle_value) },
                    ].map((item) => (
                      <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">{item.label}</p>
                        <p className="font-semibold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'digital' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Digital Profile</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Daily Mobile Hours', value: `${applicant.digital_profile.daily_mobile_hours} hours` },
                      { label: 'Monthly Transactions', value: applicant.digital_profile.monthly_digital_transactions },
                      { label: 'Avg Transaction', value: formatCurrency(applicant.digital_profile.avg_transaction_amount) },
                      { label: 'Social Media Accounts', value: applicant.digital_profile.social_media_accounts_count },
                      { label: 'App Usage Score', value: `${applicant.digital_profile.mobile_app_usage_intensity_score}/100` },
                      { label: 'Digital Payment Score', value: `${applicant.digital_profile.digital_payment_adoption_score}/100` },
                    ].map((item) => (
                      <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">{item.label}</p>
                        <p className="font-semibold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'risk' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Risk Assessment</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 rounded-lg p-4">
                      <h5 className="font-medium text-red-800 mb-2">Default Probability</h5>
                      <p className="text-2xl font-bold text-red-600">
                        {(applicant.risk_assessment.default_probability * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-medium text-blue-800 mb-2">Risk Category</h5>
                      <span className={`inline-block px-3 py-1 rounded-full font-medium ${getBadgeColor(applicant.risk_assessment.overall_risk)}`}>
                        {applicant.risk_assessment.overall_risk}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-3">Loan Recommendation</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Loan Range:</span>
                        <span className="font-medium">
                          {formatCurrency(applicant.loan_details.loan_range.minimum)} - {formatCurrency(applicant.loan_details.loan_range.maximum)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tenure:</span>
                        <span className="font-medium">{applicant.loan_details.terms.tenure_months} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Interest Rate:</span>
                        <span className="font-medium">
                          {applicant.loan_details.terms.interest_rate_range.min}% - {applicant.loan_details.terms.interest_rate_range.max}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <i className="fas fa-exclamation-triangle text-3xl text-red-500 mb-4"></i>
            <p className="text-gray-600">Failed to load applicant details</p>
            <button
              onClick={onClose}
              className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicantDetailsModal;
