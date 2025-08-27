import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';

function Dashboard({ history, stats, onLoadAnalysis, showNotification }) {
  const [animatedStats, setAnimatedStats] = useState({});
  const lastAnalysis = history[0];

  useEffect(() => {
    if (stats) {
      setAnimatedStats(stats);
    }
  }, [stats]);

  const StatCard = ({ title, value, icon, color, suffix = '', description, trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            <CountUp end={value} duration={1.5} suffix={suffix} />
          </p>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
          {trend && (
            <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <i className={`fas ${trend > 0 ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <i className={`${icon} text-xl text-white`}></i>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900">AI-Powered Credit Risk Assessment Platform</h1>
        <p className="text-lg text-gray-600 mt-2">Real-time risk analysis with database persistence</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Analyses"
          value={animatedStats?.total_analyses || 0}
          icon="fas fa-chart-line"
          color="bg-blue-500"
          description="Completed analyses"
        />
        <StatCard
          title="Total Applicants"
          value={animatedStats?.total_applicants || 0}
          icon="fas fa-users"
          color="bg-green-500"
          description="Processed applicants"
        />
        <StatCard
          title="Approved"
          value={animatedStats?.total_approved || 0}
          icon="fas fa-check-circle"
          color="bg-purple-500"
          description="Loan approvals"
        />
      </div>

      {/* Recent Analysis Card */}
      {lastAnalysis ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Analysis</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Database ID: {lastAnalysis.id}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Analysis Date</p>
              <p className="font-medium">{new Date(lastAnalysis.timestamp).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">File Name</p>
              <p className="font-medium">{lastAnalysis.filename}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Applicants Processed</p>
              <p className="font-medium">{lastAnalysis.data?.analysis_metadata?.total_applicants || 0}</p>
            </div>
          </div>
          <button
            onClick={() => onLoadAnalysis(lastAnalysis)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-eye mr-2"></i>
            View Analysis
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <i className="fas fa-upload text-4xl text-gray-400 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your first dataset to get started</h3>
          <Link
            to="/upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            Upload Data Now
          </Link>
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/upload"
          className="block bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <div className="flex items-center">
            <i className="fas fa-upload text-2xl mr-4"></i>
            <div>
              <h3 className="text-lg font-semibold">Upload & analyze data</h3>
              <p className="text-blue-100">Process CSV files with AI models</p>
            </div>
          </div>
        </Link>

        <Link
          to="/history"
          className="block bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all"
        >
          <div className="flex items-center">
            <i className="fas fa-database text-2xl mr-4"></i>
            <div>
              <h3 className="text-lg font-semibold">Browse past analyses</h3>
              <p className="text-purple-100">View stored analysis results</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
