import React, { useCallback, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';

function FileUpload({ onProcess, isLoading, showNotification }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const SUPPORTED_FORMATS = ['.csv', '.xlsx', '.xls', '.xlsm', '.xlsb', '.ods', '.json'];

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setError(null);
    setResults(null);
    
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds the 5MB limit.");
      return;
    }

    const fileName = file.name.toLowerCase();
    const isValidFormat = SUPPORTED_FORMATS.some(format => 
      fileName.endsWith(format)
    );

    if (!isValidFormat) {
      setError(`Unsupported file format. Please upload: ${SUPPORTED_FORMATS.join(', ')}`);
      return;
    }

    setSelectedFile(file);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
    setResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadProgress(0);
    setError(null);
    setResults(null);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 30;
      });
    }, 200);

    try {
      const result = await onProcess(selectedFile);
      setUploadProgress(100);
      setResults(result);
      
      showNotification('✅ File processed successfully! Results displayed below.', 'success');
      
      // Auto-clear file after successful upload but keep results
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
      }, 1000);

    } catch (error) {
      setError(error.message);
      setUploadProgress(0);
      showNotification('❌ Upload failed: ' + error.message, 'error');
    } finally {
      clearInterval(progressInterval);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const name = fileName.toLowerCase();
    if (name.endsWith('.csv')) return 'fas fa-file-csv text-green-600';
    if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.xlsm') || name.endsWith('.xlsb')) return 'fas fa-file-excel text-emerald-600';
    if (name.endsWith('.ods')) return 'fas fa-file-alt text-blue-600';
    if (name.endsWith('.json')) return 'fas fa-file-code text-purple-600';
    return 'fas fa-file text-gray-600';
  };

  const getBadgeColor = (value) => {
    const lower = value?.toLowerCase() || '';
    if (lower === 'low' || lower === 'approve') return 'bg-green-100 text-green-800';
    if (lower === 'medium' || lower === 'review') return 'bg-yellow-100 text-yellow-800';
    if (lower === 'high' || lower === 'reject') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Upload & Analyze</h1>
        <p className="text-lg text-gray-600 mt-2">Upload your dataset for AI-powered credit risk assessment</p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <div className="space-y-4">
              <i className="fas fa-spinner animate-spin text-4xl text-blue-500"></i>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Processing your file...</h3>
                <p className="text-gray-600">AI models are analyzing credit risk patterns...</p>
              </div>
            </div>
          ) : selectedFile ? (
            <div className="space-y-4">
              <i className={getFileIcon(selectedFile.name) + ' text-4xl'}></i>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedFile.name}</h3>
                <p className="text-gray-600">Size: {formatFileSize(selectedFile.size)}</p>
                {uploadProgress === 100 ? (
                  <p className="text-green-600 font-medium">✓ File ready for analysis</p>
                ) : uploadProgress > 0 ? (
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{Math.round(uploadProgress)}% processed</p>
                  </div>
                ) : null}
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleUpload}
                  disabled={isLoading || uploadProgress > 0}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploadProgress > 0 ? 'Processing...' : 'Analyze File'}
                </button>
                <button
                  onClick={removeSelectedFile}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <i className="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Drag & Drop your data file here</h3>
                <p className="text-gray-600">Supports CSV, Excel (.xlsx, .xls, .xlsm, .xlsb), ODS, JSON files</p>
              </div>
              <div>
                <p className="text-gray-500 mb-4">or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Files
                </button>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={SUPPORTED_FORMATS.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Supported Formats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
          <div className="p-3 bg-green-50 rounded-lg">
            <i className="fas fa-file-csv text-green-600 text-2xl mb-2"></i>
            <p className="text-green-700 font-medium">CSV</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg">
            <i className="fas fa-file-excel text-emerald-600 text-2xl mb-2"></i>
            <p className="text-emerald-700 font-medium">Excel</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <i className="fas fa-file-alt text-blue-600 text-2xl mb-2"></i>
            <p className="text-blue-700 font-medium">ODS</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <i className="fas fa-file-code text-purple-600 text-2xl mb-2"></i>
            <p className="text-purple-700 font-medium">JSON</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <i className="fas fa-brain text-3xl text-blue-600 mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
          <p className="text-gray-600 text-sm">Advanced ML models assess credit risk with high accuracy</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <i className="fas fa-database text-3xl text-green-600 mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Database Storage</h3>
          <p className="text-gray-600 text-sm">All results permanently stored for future reference</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <i className="fas fa-chart-bar text-3xl text-purple-600 mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Reports</h3>
          <p className="text-gray-600 text-sm">Get comprehensive risk assessment reports instantly</p>
        </div>
      </div>

      {/* Results Display */}
      {results && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">Analysis Results</h2>
            <p className="text-gray-600">Processing completed successfully - {results.analysis_metadata?.total_applicants} applicants analyzed</p>
          </div>

          {/* Summary Stats */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{results.analysis_metadata?.total_applicants}</p>
                <p className="text-sm text-gray-600">Total Applicants</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{results.portfolio_overview?.approval_summary?.Approve || 0}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{results.portfolio_overview?.approval_summary?.Review || 0}</p>
                <p className="text-sm text-gray-600">Under Review</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{results.portfolio_overview?.approval_summary?.Reject || 0}</p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>

            {/* Applicants Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Individual Applicants</h3>
              <div className="grid gap-4">
                {results.individual_applicants?.slice(0, 10).map((applicant, index) => (
                  <div key={applicant.applicant_id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{applicant.applicant_id}</h4>
                            <p className="text-sm text-gray-600">
                              Age: {applicant.demographics?.age} • Income: ₹{applicant.demographics?.monthly_income?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(applicant.risk_assessment?.overall_risk)}`}>
                          {applicant.risk_assessment?.overall_risk}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(applicant.risk_assessment?.recommendation)}`}>
                          {applicant.risk_assessment?.recommendation}
                        </span>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-600">
                            {(applicant.risk_assessment?.default_probability * 100).toFixed(1)}% Risk
                          </p>
                          <p className="text-xs text-gray-500">
                            Max Loan: ₹{applicant.loan_details?.loan_range?.maximum?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {results.individual_applicants?.length > 10 && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => navigate('/history')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View All {results.individual_applicants.length} Applicants in History
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
