
// In-memory storage for results (since localStorage is not supported)
let analysisStorage = {
    currentResults: null,
    storedResults: [],
    lastProcessedFile: null,
    processingHistory: [],
};

// Prevent any accidental form submissions or page reloads
window.addEventListener("beforeunload", function (e) {
    if (
        analysisStorage.currentResults &&
        !analysisStorage.storedResults.find(
            (r) => r.id === analysisStorage.currentResults.id
        )
    ) {
        e.preventDefault();
        e.returnValue =
            "You have unsaved analysis results. Are you sure you want to leave?";
        return e.returnValue;
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const dropArea = document.getElementById("dropArea");
    const fileInput = document.getElementById("fileInput");
    const browseBtn = document.getElementById("browseBtn");
    const fileInfo = document.getElementById("fileInfo");
    const processBtn = document.getElementById("processBtn");
    const loader = document.getElementById("loader");
    const resultsContainer = document.getElementById("resultsContainer");
    const storageInfo = document.getElementById("storageInfo");
    const storageDetails = document.getElementById("storageDetails");
    const resultActions = document.getElementById("resultActions");

    // Storage action buttons
    const clearStorageBtn = document.getElementById("clearStorageBtn");
    const loadStoredBtn = document.getElementById("loadStoredBtn");
    const saveResultsBtn = document.getElementById("saveResultsBtn");
    const exportJsonBtn = document.getElementById("exportJsonBtn");

    // Initialize storage display
    updateStorageDisplay();

    // Browse button click event - prevent default and handle manually
    browseBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
        return false;
    });

    // File input change event
    fileInput.addEventListener("change", function (e) {
        e.preventDefault();
        handleFileSelection();
        return false;
    });

    // Drag and drop events - prevent defaults
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        dropArea.addEventListener(
            eventName,
            function (e) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            },
            false
        );
    });

    ["dragenter", "dragover"].forEach((eventName) => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ["dragleave", "drop"].forEach((eventName) => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        e.preventDefault();
        dropArea.style.backgroundColor = "#d4eaf7";
        dropArea.style.borderColor = "#2980b9";
    }

    function unhighlight(e) {
        e.preventDefault();
        dropArea.style.backgroundColor = "#e8f4fc";
        dropArea.style.borderColor = "#3498db";
    }

    dropArea.addEventListener(
        "drop",
        function (e) {
            e.preventDefault();
            e.stopPropagation();
            handleDrop(e);
            return false;
        },
        false
    );

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            handleFiles(files[0]);
        }
    }

    function handleFileSelection() {
        if (fileInput.files.length) {
            handleFiles(fileInput.files[0]);
        }
    }

    function handleFiles(file) {
        // Validate file type
        if (!file.name.toLowerCase().endsWith(".csv")) {
            showError("Please upload a valid CSV file.");
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showError("File size exceeds the 5MB limit.");
            return;
        }

        // Store file info
        analysisStorage.lastProcessedFile = {
            name: file.name,
            size: file.size,
            lastModified: file.lastModified,
        };

        // Display file info
        fileInfo.innerHTML = `
                          <div style="background-color: #e1f5e9; padding: 15px; border-radius: 8px; margin-top: 15px;">
                              <h3 style="color: #27ae60; margin-bottom: 10px;">
                                  <i class="fas fa-file-csv"></i> Selected File
                              </h3>
                              <p style="margin-bottom: 5px;"><strong>Filename:</strong> ${file.name
            }</p>
                              <p><strong>Size:</strong> ${formatFileSize(
                file.size
            )}</p>
                          </div>
                      `;

        // Enable process button
        processBtn.disabled = false;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
        );
    }

    function showError(message) {
        fileInfo.innerHTML = `
                          <div style="background-color: #fdecea; padding: 15px; border-radius: 8px; margin-top: 15px;">
                              <h3 style="color: #e74c3c; margin-bottom: 10px;">
                                  <i class="fas fa-exclamation-triangle"></i> Error
                              </h3>
                              <p>${message}</p>
                          </div>
                      `;
        processBtn.disabled = true;
    }

    // Process button click event - prevent form submission
    processBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        processFile();
        return false;
    });

    function processFile() {
        if (!fileInput.files.length) return;

        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append("file", file);

        // Show loader
        loader.style.display = "block";
        processBtn.disabled = true;
        resultsContainer.style.display = "none";

        // Simulate API call for demo (replace with actual API call)
        setTimeout(() => {
            // Mock successful response for demonstration
            const mockResponse = {
                status: "success",
                results: {
                    portfolio_overview: {
                        approval_summary: {
                            Approve: 15,
                            Review: 8,
                            Reject: 7
                        }
                    },
                    individual_applicants: [
                        {
                            applicant_id: "APP_001",
                            demographics: {
                                age: 32,
                                gender: "Male",
                                education: "Graduate",
                                employment: "Salaried",
                                monthly_income: 45000
                            },
                            risk_assessment: {
                                overall_risk: "Low",
                                default_probability: 0.12,
                                recommendation: "Approve"
                            },
                            top_decision_metrics: [
                                {
                                    name: "Income Stability",
                                    value: "85%",
                                    status: "Good"
                                },
                                {
                                    name: "Debt-to-Income",
                                    value: "25%",
                                    status: "Good"
                                }
                            ],
                            loan_details: {
                                eligibility: "Eligible",
                                loan_range: {
                                    minimum: 100000,
                                    maximum: 500000
                                },
                                terms: {
                                    tenure_months: 36,
                                    monthly_emi: 15000,
                                    interest_rate_range: {
                                        min: 8.5,
                                        max: 12.0
                                    }
                                }
                            }
                        }
                        // Add more mock applicants as needed
                    ]
                }
            };

            handleApiResponse(mockResponse);
        }, 2000);

        // Uncomment below for actual API call
        
        fetch("http://192.168.29.155:5000/api/credit_risk/analyze", {
            method: "POST",
            body: formData,
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((errorData) => {
                        throw new Error(
                            errorData.error || `Server error: ${response.status}`
                        );
                    });
                }
                return response.json();
            })
            .then((data) => {
                handleApiResponse(data);
                resultsContainer.style.display = "block";
            })
            .catch((error) => {
                console.error("API Error:", error);
                handleApiError(error);
            });
        
    }

    function handleApiResponse(data) {
        // Hide loader
        loader.style.display = "none";
        processBtn.disabled = false;

        if (data.status === "success") {
            // Store current results
            analysisStorage.currentResults = {
                ...data,
                id: generateId(),
                processedAt: new Date().toISOString(),
                fileName:
                    analysisStorage.lastProcessedFile?.name || "unknown.csv",
            };

            // Add to processing history
            analysisStorage.processingHistory.push({
                id: analysisStorage.currentResults.id,
                fileName: analysisStorage.currentResults.fileName,
                processedAt: analysisStorage.currentResults.processedAt,
                recordCount: data.results.individual_applicants ? data.results.individual_applicants.length : 0,
            });

            displayResults(data.results);
            updateStorageDisplay();
            resultActions.style.display = "flex";
            showNotification("Analysis completed successfully!", "success");
        } else {
            throw new Error(data.error || "Processing failed");
        }
    }

    function handleApiError(error) {
        // Hide loader
        loader.style.display = "none";
        processBtn.disabled = false;

        resultsContainer.innerHTML = `
                          <div style="background-color: #fdecea; padding: 25px; border-radius: 8px; text-align: center;">
                              <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 20px;"></i>
                              <h3 style="color: #e74c3c; margin-bottom: 15px;">Error Processing File</h3>
                              <p style="margin-bottom: 10px;">${error.message}</p>
                              <p style="margin-top: 15px; font-size: 0.9rem;">Please check your CSV file and try again.</p>
                          </div>
                      `;
        showNotification("Processing failed. Please try again.", "error");
    }

    function displayResults(data) {
        try {
            // Check if required elements exist
            const approvedEl = document.getElementById('approved-count');
            const reviewEl = document.getElementById('review-count');
            const rejectEl = document.getElementById('reject-count');
            const applicantList = document.getElementById('applicantList');

            if (!approvedEl || !reviewEl || !rejectEl || !applicantList) {
                throw new Error('Required DOM elements not found');
            }

            // Check if data is valid
            if (!data?.portfolio_overview?.approval_summary || !data?.individual_applicants) {
                throw new Error('Invalid data structure');
            }

            const portfolioOverview = data.portfolio_overview;
            const applicants = data.individual_applicants;

            // Update summary cards
            approvedEl.textContent = portfolioOverview.approval_summary.Approve || 0;
            reviewEl.textContent = portfolioOverview.approval_summary.Review || 0;
            rejectEl.textContent = portfolioOverview.approval_summary.Reject || 0;

            applicantList.innerHTML = "";

            // Create applicant cards
            applicants.forEach((applicant) => {
                const applicantCard = document.createElement("div");
                applicantCard.className = "applicant-card";

                // Create header
                const cardHeader = document.createElement("div");
                cardHeader.className = "applicant-card-header";
                cardHeader.innerHTML = `
                        <div class="applicant-id">${applicant.applicant_id}</div>
                        <div class="applicant-name">${applicant.demographics.gender}, ${applicant.demographics.age}</div>
                        <div class="applicant-income">₹${applicant.demographics.monthly_income.toLocaleString()}</div>
                        <div class="applicant-risk">
                          <span class="risk-badge ${applicant.risk_assessment.overall_risk.toLowerCase()}">${applicant.risk_assessment.overall_risk}</span>
                        </div>
                        <div class="applicant-decision">
                          <span class="decision-badge ${applicant.risk_assessment.recommendation.toLowerCase()}">${applicant.risk_assessment.recommendation}</span>
                        </div>
                      `;

                // Create details section
                const cardDetails = document.createElement("div");
                cardDetails.className = "applicant-details";

                // Demographics
                let demographicsHTML = `
                        <div class="details-grid">
                          <div class="detail-item">
                            <div class="detail-label">Age</div>
                            <div class="detail-value">${applicant.demographics.age}</div>
                          </div>
                          <div class="detail-item">
                            <div class="detail-label">Gender</div>
                            <div class="detail-value">${applicant.demographics.gender}</div>
                          </div>
                          <div class="detail-item">
                            <div class="detail-label">Education</div>
                            <div class="detail-value">${applicant.demographics.education || 'N/A'}</div>
                          </div>
                          <div class="detail-item">
                            <div class="detail-label">Employment</div>
                            <div class="detail-value">${applicant.demographics.employment || 'N/A'}</div>
                          </div>
                          <div class="detail-item">
                            <div class="detail-label">Monthly Income</div>
                            <div class="detail-value">₹${applicant.demographics.monthly_income.toLocaleString()}</div>
                          </div>
                        </div>
                      `;

                // Risk assessment
                let riskHTML = `
                        <div class="metrics-container">
                          <h4><i class="fas fa-chart-line"></i> Risk Assessment</h4>
                          <div class="detail-item">
                            <div class="detail-label">Overall Risk</div>
                            <div class="detail-value">
                              <span class="risk-badge ${applicant.risk_assessment.overall_risk.toLowerCase()}">
                                ${applicant.risk_assessment.overall_risk} (${(applicant.risk_assessment.default_probability * 100).toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          <div class="detail-item">
                            <div class="detail-label">Recommendation</div>
                            <div class="detail-value">
                              <span class="decision-badge ${applicant.risk_assessment.recommendation.toLowerCase()}">
                                ${applicant.risk_assessment.recommendation}
                              </span>
                            </div>
                          </div>
                        </div>
                      `;

                // Metrics
                let metricsHTML = '<div class="metrics-container"><h4><i class="fas fa-tachometer-alt"></i> Key Metrics</h4>';
                if (applicant.top_decision_metrics && applicant.top_decision_metrics.length > 0) {
                    applicant.top_decision_metrics.forEach((metric) => {
                        const statusClass = metric.status ? metric.status.toLowerCase().replace(" ", "-") : "";
                        metricsHTML += `
                              <div class="metric-item">
                                <span class="metric-name">${metric.name}</span>
                                <div>
                                  <span class="metric-value">${metric.value}</span>
                                  ${metric.status ? `<span class="metric-status status-${statusClass}">${metric.status}</span>` : ""}
                                </div>
                              </div>
                            `;
                    });
                } else {
                    metricsHTML += '<p>No metrics available</p>';
                }
                metricsHTML += "</div>";

                // Loan terms
                let loanHTML = "";
                if (applicant.loan_details) {
                    loanHTML = `
                          <div class="loan-terms">
                            <h4><i class="fas fa-file-invoice-dollar"></i> Loan Terms</h4>
                            <div class="loan-terms-grid">
                              <div class="detail-item">
                                <div class="detail-label">Eligibility</div>
                                <div class="detail-value">${applicant.loan_details.eligibility}</div>
                              </div>
                              <div class="detail-item">
                                <div class="detail-label">Loan Range</div>
                                <div class="detail-value">₹${applicant.loan_details.loan_range.minimum.toLocaleString()} - ₹${applicant.loan_details.loan_range.maximum.toLocaleString()}</div>
                              </div>
                              <div class="detail-item">
                                <div class="detail-label">Tenure</div>
                                <div class="detail-value">${applicant.loan_details.terms.tenure_months} months</div>
                              </div>
                              <div class="detail-item">
                                <div class="detail-label">Monthly EMI</div>
                                <div class="detail-value">₹${applicant.loan_details.terms.monthly_emi.toLocaleString()}</div>
                              </div>
                              <div class="detail-item">
                                <div class="detail-label">Interest Rate</div>
                                <div class="detail-value">${applicant.loan_details.terms.interest_rate_range.min}% - ${applicant.loan_details.terms.interest_rate_range.max}%</div>
                              </div>
                            </div>
                          </div>
                        `;
                }

                // Combine all sections
                cardDetails.innerHTML = demographicsHTML + riskHTML + metricsHTML + loanHTML;

                // Toggle details on click
                cardHeader.addEventListener("click", function () {
                    cardDetails.classList.toggle("active");
                });

                // Append to card
                applicantCard.appendChild(cardHeader);
                applicantCard.appendChild(cardDetails);

                // Add to list
                applicantList.appendChild(applicantCard);
            });

            // Show result actions
            resultActions.style.display = "flex";

        } catch (error) {
            console.error('Error displaying results:', error);
            resultsContainer.innerHTML = `
                      <div style="background-color: #fdecea; padding: 25px; border-radius: 8px; text-align: center;">
                          <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 20px;"></i>
                          <h3 style="color: #e74c3c; margin-bottom: 15px;">Error Displaying Results</h3>
                          <p>${error.message}</p>
                      </div>
                  `;
            showNotification('Error displaying results. Please check console.', 'error');
        }
    }

    function updateStorageDisplay() {
        const hasStoredResults = analysisStorage.storedResults.length > 0;
        const hasCurrentResults = analysisStorage.currentResults !== null;
        const hasHistory = analysisStorage.processingHistory.length > 0;

        if (hasStoredResults || hasHistory) {
            storageInfo.style.display = "block";

            let details = [];
            if (hasStoredResults) {
                details.push(
                    `${analysisStorage.storedResults.length} saved result${analysisStorage.storedResults.length > 1 ? "s" : ""}`
                );
            }
            if (hasHistory) {
                details.push(
                    `${analysisStorage.processingHistory.length} processing session${analysisStorage.processingHistory.length > 1 ? "s" : ""}`
                );
            }

            storageDetails.textContent = details.join(", ");

            // Enable/disable buttons based on storage state
            loadStoredBtn.disabled = !hasStoredResults;
            clearStorageBtn.disabled = !hasStoredResults && !hasHistory;
        } else {
            storageInfo.style.display = "none";
        }

        // Update save button state
        if (saveResultsBtn) {
            saveResultsBtn.disabled = !hasCurrentResults;
        }
    }

    function generateId() {
        return (
            "analysis_" +
            Date.now() +
            "_" +
            Math.random().toString(36).substr(2, 5)
        );
    }

    // Storage action event listeners with proper event handling
    clearStorageBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (
            confirm(
                "Are you sure you want to clear all stored results and history?"
            )
        ) {
            analysisStorage.storedResults = [];
            analysisStorage.processingHistory = [];
            analysisStorage.currentResults = null;
            updateStorageDisplay();
            showNotification("Storage cleared successfully", "success");
        }
        return false;
    });

    loadStoredBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (analysisStorage.storedResults.length > 0) {
            // Load the most recent stored result
            const latestResult = analysisStorage.storedResults[analysisStorage.storedResults.length - 1];
            displayResults(latestResult.results);
            showNotification(`Loaded stored results from ${latestResult.fileName}`, "success");
        }
        return false;
    });

    saveResultsBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (analysisStorage.currentResults) {
            // Check if already saved
            const existingIndex = analysisStorage.storedResults.findIndex(
                (r) => r.id === analysisStorage.currentResults.id
            );

            if (existingIndex === -1) {
                analysisStorage.storedResults.push(analysisStorage.currentResults);
                updateStorageDisplay();
                showNotification("Results saved to storage", "success");
            } else {
                showNotification("Results already saved", "info");
            }
        }
        return false;
    });

    exportJsonBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (analysisStorage.currentResults) {
            const dataStr = JSON.stringify(analysisStorage.currentResults, null, 2);
            const dataBlob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `credit_risk_analysis_${analysisStorage.currentResults.id}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showNotification("Results exported as JSON", "success");
        }
        return false;
    });

    function showNotification(message, type = "info") {
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = "slideOut 0.3s ease-out";
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
});