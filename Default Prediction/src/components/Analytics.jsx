import React, { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Analytics({ history, stats, showNotification }) {
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return null;

    // Time series data for trend analysis
    const timeSeriesData = history
      .slice(-10) // Last 10 analyses
      .map(analysis => ({
        date: new Date(analysis.timestamp).toLocaleDateString(),
        applicants: analysis.data?.analysis_metadata?.total_applicants || 0,
        approved: analysis.data?.portfolio_overview?.approval_summary?.Approve || 0,
        approvalRate: ((analysis.data?.portfolio_overview?.approval_summary?.Approve || 0) / 
                     (analysis.data?.analysis_metadata?.total_applicants || 1) * 100).toFixed(1)
      }));

    // Risk distribution aggregation
    const riskData = history.reduce((acc, analysis) => {
      const riskDist = analysis.data?.portfolio_overview?.risk_distribution;
      if (riskDist) {
        acc.Low += riskDist.Low || 0;
        acc.Medium += riskDist.Medium || 0;
        acc.High += riskDist.High || 0;
      }
      return acc;
    }, { Low: 0, Medium: 0, High: 0 });

    const pieData = [
      { name: 'Low Risk', value: riskData.Low, color: '#10B981' },
      { name: 'Medium Risk', value: riskData.Medium, color: '#F59E0B' },
      { name: 'High Risk', value: riskData.High, color: '#EF4444' }
    ];

    // Monthly analysis volume
    const monthlyData = history.reduce((acc, analysis) => {
      const month = new Date(analysis.timestamp).toLocaleString('default', { month: 'short', year: '2-digit' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const volumeData = Object.entries(monthlyData).map(([month, count]) => ({
      month,
      analyses: count
    }));

    return { timeSeriesData, pieData, volumeData };
  }, [history]);

  const MetricCard = ({ title, value, change, icon, color }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <i className={`fas ${change > 0 ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
              {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <i className={`${icon} text-2xl`} style={{ color }}></i>
        </div>
      </div>
    </div>
  );

  if (!chartData) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">Advanced insights and trends from your data</p>
        </div>
        
        <div className="text-center py-16">
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-chart-line text-gray-400 text-3xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">Upload some analyses to see insights and trends</p>
        </div>
      </div>
    );
  }

  const avgApprovalRate = history.reduce((acc, analysis) => {
    const approved = analysis.data?.portfolio_overview?.approval_summary?.Approve || 0;
    const total = analysis.data?.analysis_metadata?.total_applicants || 1;
    return acc + (approved / total);
  }, 0) / history.length * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600">Advanced insights and trends from your credit risk analyses</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Analyses"
          value={stats?.total_analyses || 0}
          icon="fas fa-database"
          color="#3B82F6"
        />
        <MetricCard
          title="Total Applicants"
          value={stats?.total_applicants || 0}
          icon="fas fa-users"
          color="#10B981"
        />
        <MetricCard
          title="Avg Approval Rate"
          value={`${avgApprovalRate.toFixed(1)}%`}
          icon="fas fa-check-circle"
          color="#F59E0B"
        />
        <MetricCard
          title="Loan Potential"
          value={`₹${stats?.total_loan_potential ? (stats.total_loan_potential / 10000000).toFixed(1) : 0}Cr`}
          icon="fas fa-rupee-sign"
          color="#EF4444"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Approval Trends */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <i className="fas fa-chart-line text-blue-600 mr-3"></i>
            Approval Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="approved" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                name="Approved Applications"
              />
              <Line 
                type="monotone" 
                dataKey="applicants" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                name="Total Applications"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <i className="fas fa-chart-pie text-purple-600 mr-3"></i>
            Risk Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Analysis Volume */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <i className="fas fa-chart-bar text-green-600 mr-3"></i>
            Analysis Volume by Month
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.volumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="analyses" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Approval Rate Trends */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <i className="fas fa-percentage text-orange-600 mr-3"></i>
            Approval Rate Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Approval Rate']} />
              <Line 
                type="monotone" 
                dataKey="approvalRate" 
                stroke="#F59E0B" 
                strokeWidth={4}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 8 }}
                name="Approval Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <i className="fas fa-lightbulb text-yellow-500 mr-3"></i>
          Key Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <h4 className="font-semibold text-gray-900">High Performance</h4>
            </div>
            <p className="text-gray-600 text-sm">
              Your approval rate of {avgApprovalRate.toFixed(1)}% indicates strong risk assessment capabilities.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <h4 className="font-semibold text-gray-900">Processing Volume</h4>
            </div>
            <p className="text-gray-600 text-sm">
              {stats?.total_applicants || 0} applicants processed across {stats?.total_analyses || 0} analyses with consistent quality.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center mb-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              <h4 className="font-semibold text-gray-900">Risk Management</h4>
            </div>
            <p className="text-gray-600 text-sm">
              Balanced risk distribution shows effective screening of high-risk applications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
