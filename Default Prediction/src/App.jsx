import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import Notification from './components/Notification';
import AnalysisHistory from './components/AnalysisHistory';
import './App.css';

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('analysisHistory');
    if (savedHistory) {
      setAnalysisHistory(JSON.parse(savedHistory));
    }
  }, []);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFileProcess = async (file) => {
    if (!file) {
      showNotification("Please upload a valid file.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://localhost:5000/api/credit_risk/analyze', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      const newAnalysis = {
        id: `ANL-${Date.now()}`,
        timestamp: new Date().toISOString(),
        data: data.results,
        filename: file.name,
        status: 'completed'
      };

      const updatedHistory = [newAnalysis, ...analysisHistory];
      setAnalysisHistory(updatedHistory);
      localStorage.setItem('analysisHistory', JSON.stringify(updatedHistory));

      setAnalysisData(data);
      showNotification('Analysis completed successfully!', 'success');
    } catch (error) {
      showNotification('Processing failed. Please try again.', 'error');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFromHistory = (analysis) => {
    setAnalysisData({ results: analysis.data });
    showNotification('Analysis loaded from history', 'success');
  };

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={
            <Dashboard 
              history={analysisHistory} 
              onLoadAnalysis={handleLoadFromHistory} 
            />
          } />
          <Route path="/analyze" element={
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <FileUpload onProcess={handleFileProcess} isLoading={isLoading} />
              </div>
              {analysisData && (
                <div className="bg-white rounded-xl shadow p-6 mb-8">
                  <ResultsDisplay 
                    data={analysisData.results} 
                    filename={analysisData.filename}
                    showNotification={showNotification}
                  />
                </div>
              )}
            </div>
          } />
          <Route path="/history" element={
            <AnalysisHistory 
              history={analysisHistory} 
              onLoadAnalysis={handleLoadFromHistory}
            />
          } />
        </Routes>

        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type} 
          />
        )}
      </Layout>
    </Router>
  );
}

export default App;