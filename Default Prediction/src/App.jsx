import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import Notification from './components/Notification';
import './App.css'; // Tailwind CSS is injected here

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

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
       // For actual API call:
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://10.21.24.114:5000/api/credit_risk/analyze', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      setTimeout(() => {
        setAnalysisData(data);
        setIsLoading(false);
        showNotification('Analysis completed successfully!', 'success');
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      showNotification('Processing failed. Please try again.', 'error');
      console.error('Error:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 text-gray-800">
      <header className="text-center my-8">
        <h1 className="text-3xl font-bold text-blue-600 flex justify-center items-center gap-2">
          <i className="fas fa-chart-line"></i> Credit Risk Analysis System
        </h1>
        <p className="text-md text-gray-500 mt-2">
          Upload a CSV file containing customer financial data to assess credit
          risk using our advanced machine learning models.
        </p>
      </header>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <FileUpload onProcess={handleFileProcess} isLoading={isLoading} />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <ResultsDisplay 
          data={analysisData?.results} 
          isLoading={isLoading}
          showNotification={showNotification}
        />
      </div>

      <footer className="text-center text-sm text-gray-400 mt-10">
        Credit Risk Analysis System &copy; 2023 | Powered by Machine Learning Models
      </footer>

      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
        />
      )}
    </div>
  );
}

export default App;
