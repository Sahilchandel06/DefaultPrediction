import React, { useState } from 'react';
import SummaryCards from './SummaryCards';
import ApplicantCard from './ApplicantCard';

function ResultsDisplay({ data, isLoading, showNotification }) {
  const [expandedApplicant, setExpandedApplicant] = useState(null);

  const handleExport = () => {
    if (data) {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `credit_risk_analysis_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotification('Results exported as JSON', 'success');
    }
  };

  if (isLoading) return null;

  if (!data) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-poll text-blue-500"></i> Analysis Results
        </h2>
        <div className="text-center text-gray-500 py-12">
          <i className="fas fa-chart-pie text-4xl mb-4"></i>
          <p>Upload and analyze a CSV file to see results</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <i className="fas fa-poll text-blue-500"></i> Analysis Results
      </h2>

      <SummaryCards data={data.portfolio_overview.approval_summary} />

      <div className="mt-8">
        <div className="grid grid-cols-5 gap-4 font-semibold text-gray-600 border-b pb-2">
          <div>ID</div>
          <div>Name</div>
          <div>Income</div>
          <div>Risk</div>
          <div>Decision</div>
        </div>

        <div className="mt-2 space-y-4">
          {data.individual_applicants.map((applicant) => (
            <ApplicantCard
              key={applicant.applicant_id}
              applicant={applicant}
              isExpanded={expandedApplicant === applicant.applicant_id}
              onToggle={() =>
                setExpandedApplicant(
                  expandedApplicant === applicant.applicant_id ? null : applicant.applicant_id
                )
              }
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button
          type="button"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
          onClick={handleExport}
        >
          <i className="fas fa-download mr-2"></i> Export JSON
        </button>

        <button
          type="button"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          <i className="fas fa-save mr-2"></i> Save to Storage
        </button>
      </div>
    </div>
  );
}

export default ResultsDisplay;
