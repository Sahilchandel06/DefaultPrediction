import React, { useEffect } from 'react';
import ResultsDisplay from '../../components/ResultsDisplay';

function ResultsModal({ isOpen, onClose, analysisData, showNotification }) {
  // Escape key handler and background scroll prevention
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose} // Click outside to close
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Modal Body - Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {analysisData?.data ? (
            <ResultsDisplay 
              data={analysisData.data}
              filename={analysisData.filename}
              showNotification={showNotification}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <i className="fas fa-exclamation-triangle text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-500">No analysis data available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultsModal;
