import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import AnalysisHistory from './components/AnalysisHistory';
import Notification from './components/Notification';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorBoundary from './components/ErrorBoundary';
import { api } from './utils/api';

function App() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [historyResponse, statsResponse] = await Promise.all([
        api.getHistory(),
        api.getDashboardStats()
      ]);

      if (historyResponse.status === 'success') {
        setHistory(historyResponse.analyses);
      }

      if (statsResponse.status === 'success') {
        setStats(statsResponse.stats);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      showNotification('Failed to load data from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFileProcess = async (file) => {
    setLoading(true);
    try {
      const response = await api.analyzeFile(file);
      if (response.status === 'success') {
        showNotification('✅ File processed and saved to database successfully!', 'success');
        setCurrentAnalysis(response.results);
        
        // Reload data to update dashboard and history
        await loadData();
        
        return response.results;
      } else {
        throw new Error(response.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Processing error:', error);
      showNotification(`❌ Processing failed: ${error.message}`, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnalysis = async (analysisId) => {
    try {
      const response = await api.deleteAnalysis(analysisId);
      if (response.status === 'success') {
        await loadData(); // Reload data after deletion
        return true;
      } else {
        throw new Error(response.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  };

  const handleLoadAnalysis = (analysis) => {
    setCurrentAnalysis(analysis.data);
    showNotification(`📊 Loaded analysis: ${analysis.filename}`, 'success');
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          {loading && <LoadingOverlay />}
          
          <Layout>
            <Routes>
              <Route 
                path="/" 
                element={
                  <Dashboard 
                    history={history}
                    stats={stats}
                    onLoadAnalysis={handleLoadAnalysis}
                    showNotification={showNotification}
                  />
                } 
              />
              
              <Route 
                path="/upload" 
                element={
                  <FileUpload 
                    onProcess={handleFileProcess}
                    isLoading={loading}
                    showNotification={showNotification}
                  />
                } 
              />
              
              <Route 
                path="/history" 
                element={
                  <AnalysisHistory
                    history={history}
                    onDeleteAnalysis={handleDeleteAnalysis}
                    showNotification={showNotification}
                  />
                } 
              />
            </Routes>
          </Layout>

          {notification && (
            <Notification 
              message={notification.message} 
              type={notification.type} 
            />
          )}
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
