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

  const getRiskColor = (probability) => {
    if (probability < 0.3) return "text-green-600";
    if (probability < 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition overflow-hidden ${
      isExpanded ? "border-blue-300" : "border-gray-200"
    }`}>
      {/* Summary Row */}
      <div
        className="grid grid-cols-12 items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="col-span-2 text-sm font-medium text-gray-700">{applicant_id}</div>
        <div className="col-span-3 text-sm">
          {/* Only AGE is shown here, nothing else */}
          {demographics.age !== undefined && demographics.age !== null ? demographics.age : ""}
        </div>
        <div className="col-span-2 text-sm">₹{demographics.monthly_income.toLocaleString()}</div>
        <div className="col-span-2">
          <div className="flex items-center">
            <span className={`px-2 py-1 text-xs rounded-full ${badgeColor(risk_assessment.overall_risk)}`}>
              {risk_assessment.overall_risk}
            </span>
            <span className={`ml-2 text-xs ${getRiskColor(risk_assessment.default_probability)}`}>
              ({(risk_assessment.default_probability * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
        <div className="col-span-2">
          <span className={`px-2 py-1 text-xs rounded-full ${badgeColor(risk_assessment.recommendation)}`}>
            {risk_assessment.recommendation}
          </span>
        </div>
        <div className="col-span-1 flex justify-end">
          <button className="text-gray-400 hover:text-gray-600">
            <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
          </button>
        </div>
      </div>

      {/* Expanded Section */}
      {isExpanded && (
        <div className="bg-gray-50 px-6 py-4 space-y-6 border-t border-gray-200">
          {/* Demographics */}
          <div>
            <h4 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
              <i className="fas fa-user-circle mr-2 text-blue-500"></i> Demographic Info
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Age</div>
                <div className="font-medium">
                  {demographics.age !== undefined && demographics.age !== null ? demographics.age : ""}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Gender</div>
                <div className="font-medium">{demographics.gender}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Education</div>
                <div className="font-medium">{demographics.education || "N/A"}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Employment</div>
                <div className="font-medium">{demographics.employment || "N/A"}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Monthly Income</div>
                <div className="font-medium">₹{demographics.monthly_income.toLocaleString()}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Location</div>
                <div className="font-medium">{demographics.location || "N/A"}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Marital Status</div>
                <div className="font-medium">{demographics.marital_status || "N/A"}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Dependents</div>
                <div className="font-medium">{demographics.dependents || "N/A"}</div>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div>
            <h4 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
              <i className="fas fa-chart-line mr-2 text-purple-500"></i> Risk Assessment
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Overall Risk</div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${badgeColor(risk_assessment.overall_risk)}`}>
                        {risk_assessment.overall_risk}
                      </span>
                      <span className={`ml-2 text-sm ${getRiskColor(risk_assessment.default_probability)}`}>
                        ({(risk_assessment.default_probability * 100).toFixed(1)}% default probability)
                      </span>
                    </div>
                  </div>
                  <div className="w-16 h-16">
                    <div className="radial-progress" style={{"--value":(risk_assessment.default_probability * 100), "--size":"4rem", "--thickness": "6px"}}>
                      {(risk_assessment.default_probability * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Recommendation</div>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1.5 text-sm rounded-full ${badgeColor(risk_assessment.recommendation)}`}>
                    {risk_assessment.recommendation}
                  </span>
                  <div className="text-sm text-gray-600">
                    Confidence: <span className="font-medium">{(risk_assessment.confidence_score * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Decision Metrics */}
          {top_decision_metrics && top_decision_metrics.length > 0 && (
            <div>
              <h4 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
                <i className="fas fa-tachometer-alt mr-2 text-teal-500"></i> Key Metrics
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {top_decision_metrics.map((metric, index) => (
                  <div key={index} className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-700">{metric.name}</div>
                        <div className="text-xs text-gray-500 mt-1">Impact: {metric.impact}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{metric.value}</div>
                        {metric.status && (
                          <span className={`px-2 py-1 text-xs rounded-full mt-1 inline-block ${badgeColor(metric.status)}`}>
                            {metric.status}
                          </span>
                        )}
                      </div>
                    </div>
                    {metric.description && (
                      <div className="mt-2 text-xs text-gray-500">{metric.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loan Details */}
          {loan_details && (
            <div>
              <h4 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
                <i className="fas fa-file-invoice-dollar mr-2 text-green-500"></i> Loan Terms
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Eligibility</div>
                  <div className="font-medium">{loan_details.eligibility}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Loan Range</div>
                  <div className="font-medium">
                    ₹{loan_details.loan_range.minimum.toLocaleString()} - ₹{loan_details.loan_range.maximum.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Tenure</div>
                  <div className="font-medium">{loan_details.terms.tenure_months} months</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Monthly EMI</div>
                  <div className="font-medium">₹{loan_details.terms.monthly_emi.toLocaleString()}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Interest Rate Range</div>
                  <div className="font-medium">
                    {loan_details.terms.interest_rate_range.min}% - {loan_details.terms.interest_rate_range.max}%
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Loan Purpose</div>
                  <div className="font-medium">{loan_details.purpose || "N/A"}</div>
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
