import React, { useState } from "react";
import ApplicantDetailsModal from "./ApplicantDetailsModal";

function ApplicantCard({ applicant, isExpanded, onToggle, showNotification }) {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  
  const { applicant_id, demographics, risk_assessment, top_decision_metrics, loan_details } = applicant;
  
  const badgeColor = (value) => {
    const lower = value.toLowerCase();
    if (lower === "low" || lower === "approve") return "bg-green-100 text-green-700";
    if (lower === "medium" || lower === "review") return "bg-yellow-100 text-yellow-800";
    if (lower === "high" || lower === "reject") return "bg-red-100 text-red-700";
    return "bg-gray-200 text-gray-800";
  };

  const getRiskColor = (probability) => {
    if (probability < 0.3) return "text-green-600";
    if (probability < 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  // Get database ID for modal
  const applicantDbId = applicant.id || applicant.applicant_id;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">{applicant_id}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor(risk_assessment.overall_risk)}`}>
                {risk_assessment.overall_risk} Risk
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor(risk_assessment.recommendation)}`}>
                {risk_assessment.recommendation}
              </span>
            </div>
            {applicant.id && (
              <span className="text-xs text-gray-500">DB ID: {applicant.id}</span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Age</p>
              <p className="font-semibold">{demographics.age}y</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Gender</p>
              <p className="font-semibold">{demographics.gender}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Education</p>
              <p className="font-semibold">{demographics.education}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Income</p>
              <p className="font-semibold">₹{demographics.monthly_income?.toLocaleString()}</p>
            </div>
          </div>

          {top_decision_metrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {top_decision_metrics.slice(0, 3).map((metric, index) => (
                <div key={index} className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">{metric.name}</p>
                  <p className="font-bold text-lg">{metric.value}</p>
                  <span className={`text-xs px-2 py-1 rounded ${badgeColor(metric.status)}`}>
                    {metric.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {loan_details && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Eligibility</p>
                  <p className="font-medium">{loan_details.eligibility}</p>
                </div>
                <div>
                  <p className="text-gray-600">Loan Range</p>
                  <p className="font-medium">
                    ₹{loan_details.loan_range?.minimum?.toLocaleString()} - 
                    ₹{loan_details.loan_range?.maximum?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">EMI</p>
                  <p className="font-medium">₹{loan_details.terms?.monthly_emi?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Term</p>
                  <p className="font-medium">{loan_details.terms?.tenure_months} months</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4">
            <button
              onClick={() => setDetailsModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              <i className="fas fa-external-link-alt mr-2"></i>
              View Complete Profile & All Database Data
            </button>
          </div>
        </div>
      </div>

      {/* Modal loads complete data from database */}
      <ApplicantDetailsModal
        applicantId={applicantDbId}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        showNotification={showNotification}
      />
    </>
  );
}

export default ApplicantCard;
