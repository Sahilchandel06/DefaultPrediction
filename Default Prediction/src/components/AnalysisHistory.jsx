import React from 'react';

function AnalysisHistory({ history, onLoadAnalysis }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Analysis History</h1>
        <div className="text-sm text-gray-500">
          {history.length} analyses stored
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-history text-3xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Analysis History</h3>
          <p className="text-gray-500">Perform analyses to see them appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-600">
            <div className="col-span-3">Filename</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Total</div>
            <div className="col-span-2">Approved</div>
            <div className="col-span-2">Review</div>
            <div className="col-span-1">Actions</div>
          </div>
          <div className="divide-y divide-gray-200">
            {history.map((analysis) => {
              const stats = analysis.data.portfolio_overview.approval_summary;
              const total = stats.Approve + stats.Review + stats.Reject;
              
              return (
                <div 
                  key={analysis.id} 
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => onLoadAnalysis(analysis)}
                >
                  <div className="col-span-3 font-medium text-blue-600 truncate">
                    {analysis.filename}
                  </div>
                  <div className="col-span-2 text-sm">
                    {new Date(analysis.timestamp).toLocaleDateString()}
                    <span className="text-gray-400 block">
                      {new Date(analysis.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {analysis.status}
                    </span>
                  </div>
                  <div className="col-span-1 font-medium">{total}</div>
                  <div className="col-span-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-2">
                        {stats.Approve}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.round((stats.Approve / total) * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center mr-2">
                        {stats.Review}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.round((stats.Review / total) * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoadAnalysis(analysis);
                      }}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalysisHistory;