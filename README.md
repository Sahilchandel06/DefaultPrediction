# 🔮 FinShield - AI-Powered Credit Risk & Loan Recommendation Engine 📊

**FinShield** is a comprehensive AI tool designed to assist banks and financial institutions in making informed lending decisions. It leverages a multi-model machine learning system to assess an applicant's credit risk, predict their repayment ability, and provide intelligent loan recommendations. This ensures a balanced approach to risk management, helping to maximize approvals for qualified customers while minimizing potential defaults.

***

## ✨ Features

- 🤖 **Multi-Model AI Prediction:** Utilizes a combination of a Random Forest Classifier and Gradient Boosting Regressors to provide a holistic risk assessment.
- 🧠 **Balanced Risk Assessment:** A custom risk calculation methodology ensures a more realistic and fair distribution of risk categories (Low, Medium, High).
- 📈 **Comprehensive Metrics:** Predicts key metrics including **Default Probability**, **Repayment Ability Score**, and **Payment Timeliness Score**.
- 📊 **Dynamic Loan Recommendations:** Generates personalized loan offers with recommended amounts, terms, and interest rates based on the applicant's risk profile.
- 📁 **Batch Processing:** Can process a CSV file of applicants, providing a portfolio-level overview and individual applicant reports.
- 🖼️ **Data Visualization:** Generates a JSON output that includes data for a loan approval funnel and risk distribution charts, ideal for web dashboard integration.

***

## 🛠️ Technical Details

FinShield's core functionality is built on a robust machine learning pipeline. The system processes raw applicant data, engineers new features, and then feeds this information into three distinct models to produce a comprehensive risk profile.

### Model Architecture

The system uses a pipeline-based approach to ensure data consistency and accuracy.

1.  **Feature Preparation:** Raw data (e.g., income, employment history) is enriched with calculated financial ratios (e.g., `debt_to_income_ratio`, `savings_rate`).
2.  **Preprocessing:** Categorical data is encoded using `LabelEncoder`, and all numerical features are standardized using `StandardScaler`.
3.  **Model Predictions:**
    -   **Default Prediction:** A **RandomForestClassifier** determines the probability of a loan default, categorizing the applicant as Low, Medium, or High risk.
    -   **Repayment & Timeliness:** Two **GradientBoostingRegressor** models predict the applicant's likelihood of timely payments and overall repayment ability, providing a score out of 100.
4.  **Loan Recommendation Logic:** A post-processing step uses the model outputs to generate practical loan recommendations, including a max loan amount and suggested interest rate range.

### Model Design Flow
![FinShield Model Design Flowchart](https://i.imgur.com/your-image-id.png)  
*(You can replace the image URL with a link to a diagram of your model's workflow.)*

***

## 🚀 Installation & Local Setup

### Prerequisites

-   Python (v3.8+)
-   `pip` (Python package installer)
-   Node.js (v18+)
-   Vite

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Nikhil-9876/DefaultPrediction.git
    cd DefaultPrediction
    ```

2.  **Install Backend Dependencies**
    First, ensure you have a `requirements.txt` file (or create one) with the following packages:
    -   `flask`
    -   `flask-cors`
    -   `pandas`
    -   `scikit-learn`
    -   `joblib`


    Then, install them using `pip`:
    ```bash
    cd DefaultPrediction
    pip install -r requirements.txt
    ```

3.  **Prepare a Training Dataset**
    Your model is pre-configured to use a specific training file path. Place your training data (e.g., `realistic_credit_risk_dataset.csv`) and a test data file (e.g., `balanced_test_dataset.csv`) in the specified directory:
    -   modify the file paths in the `run_fixed_system()` function to match your local setup.

***

## How to Run

### Backend

1.  **Open the Script**
    Navigate to the project directory and open the Python script (e.g., `fixed_credit_risk_system.py`) in your preferred code editor.

2.  **Execute the Script**
    Run the main function from your terminal. This will train the models, save them, and then process the test dataset, generating a JSON output with the analysis results.

    ```bash
    python fixed_credit_risk_system.py
    python api_endpoint.py
    ```

    You will see a series of log messages indicating the progress of the training and processing steps. The final output file path and a summary of the analysis will be printed to the console.

***

### Frontend

1.  **Install Frontend Dependencies**
    ```bash
    cd DefaultPrediction/Default Prediction
    npm install
    ```

2.  **Run the Frontend**
    ```bash
    npm run dev
    ```
    This command will start a development server, and your frontend application will be available on `http://localhost:5173/` (or another port specified by Vite).

***

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request