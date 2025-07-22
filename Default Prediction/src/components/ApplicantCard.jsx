import React from "react";

function ApplicantCard({ applicant, isExpanded, onToggle }) {
  const { applicant_id, demographics, risk_assessment, top_decision_metrics, loan_details } = applicant;

  const badgeColor = (value) => {
    const lower = value.toLowerCase();
    if (lower === "low" || lower === "approve") return "bg-green-100 text-green-700";
    if (lower === "medium" || lower === "review") return "bg-yellow-100 text-yellow-800";
    if (lower === "high" || lower === "reject") return "bg-red-100 text-red-700";
    return "bg-gray-200 text-gray-800";
  };

  return (
    <div className="bg-white border rounded-lg shadow hover:shadow-md transition overflow-hidden">
      {/* Summary Row */}
      <div
        className="grid grid-cols-5 items-center gap-2 p-4 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="text-sm font-medium text-gray-700">{applicant_id}</div>
        <div className="text-sm">{demographics.gender}, {demographics.age}</div>
        <div className="text-sm">₹{demographics.monthly_income.toLocaleString()}</div>
        <div>
          <span className={`px-2 py-1 text-xs rounded ${badgeColor(risk_assessment.overall_risk)}`}>
            {risk_assessment.overall_risk}
          </span>
        </div>
        <div>
          <span className={`px-2 py-1 text-xs rounded ${badgeColor(risk_assessment.recommendation)}`}>
            {risk_assessment.recommendation}
          </span>
        </div>
      </div>

      {/* Expanded Section */}
      {isExpanded && (
        <div className="bg-gray-50 px-6 py-4 space-y-6 border-t">
          {/* Demographics */}
          <div>
            <h4 className="text-md font-semibold mb-2 text-gray-700">
              <i className="fas fa-user mr-2 text-blue-500"></i> Demographic Info
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-600">
              <div><strong>Age:</strong> {demographics.age}</div>
              <div><strong>Gender:</strong> {demographics.gender}</div>
              <div><strong>Education:</strong> {demographics.education || "N/A"}</div>
              <div><strong>Employment:</strong> {demographics.employment || "N/A"}</div>
              <div><strong>Monthly Income:</strong> ₹{demographics.monthly_income.toLocaleString()}</div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div>
            <h4 className="text-md font-semibold mb-2 text-gray-700">
              <i className="fas fa-chart-line mr-2 text-purple-500"></i> Risk Assessment
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <strong>Overall Risk:</strong>{" "}
                <span className={`px-2 py-1 text-xs rounded ${badgeColor(risk_assessment.overall_risk)}`}>
                  {risk_assessment.overall_risk} ({(risk_assessment.default_probability * 100).toFixed(1)}%)
                </span>
              </div>
              <div>
                <strong>Recommendation:</strong>{" "}
                <span className={`px-2 py-1 text-xs rounded ${badgeColor(risk_assessment.recommendation)}`}>
                  {risk_assessment.recommendation}
                </span>
              </div>
            </div>
          </div>

          {/* Top Decision Metrics */}
          {top_decision_metrics && top_decision_metrics.length > 0 && (
            <div>
              <h4 className="text-md font-semibold mb-2 text-gray-700">
                <i className="fas fa-tachometer-alt mr-2 text-teal-500"></i> Key Metrics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                {top_decision_metrics.map((metric, index) => (
                  <div key={index} className="flex justify-between items-center bg-white border rounded px-3 py-2 shadow-sm">
                    <div>{metric.name}</div>
                    <div className="text-right">
                      <span className="font-semibold mr-2">{metric.value}</span>
                      {metric.status && (
                        <span className={`px-2 py-1 text-xs rounded ${badgeColor(metric.status)}`}>
                          {metric.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loan Details */}
          {loan_details && (
            <div>
              <h4 className="text-md font-semibold mb-2 text-gray-700">
                <i className="fas fa-file-invoice-dollar mr-2 text-green-600"></i> Loan Terms
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div><strong>Eligibility:</strong> {loan_details.eligibility}</div>
                <div>
                  <strong>Loan Range:</strong> ₹{loan_details.loan_range.minimum.toLocaleString()} - ₹{loan_details.loan_range.maximum.toLocaleString()}
                </div>
                <div><strong>Tenure:</strong> {loan_details.terms.tenure_months} months</div>
                <div><strong>Monthly EMI:</strong> ₹{loan_details.terms.monthly_emi.toLocaleString()}</div>
                <div>
                  <strong>Interest Rate:</strong> {loan_details.terms.interest_rate_range.min}% - {loan_details.terms.interest_rate_range.max}%
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ApplicantCard;
