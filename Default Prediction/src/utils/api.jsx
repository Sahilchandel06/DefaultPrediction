const API_BASE_URL = 'http://localhost:5000/api/credit_risk';

export const api = {
  // Analyze credit risk and save to database
  analyzeFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get analysis history from database
  getHistory: async (page = 1, perPage = 50) => {
    const response = await fetch(`${API_BASE_URL}/history?page=${page}&per_page=${perPage}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get specific analysis from database
  getAnalysis: async (analysisId) => {
    const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get complete applicant details from database
  getApplicantDetails: async (applicantId) => {
    const response = await fetch(`${API_BASE_URL}/applicant/${applicantId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get all applicants for an analysis
  getAnalysisApplicants: async (analysisId) => {
    const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}/applicants`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Delete analysis from database
  deleteAnalysis: async (analysisId) => {
    const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get dashboard stats from database
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Advanced search functionality
  searchApplicants: async (searchParams) => {
    const params = new URLSearchParams(searchParams);
    const response = await fetch(`${API_BASE_URL}/search?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
};
