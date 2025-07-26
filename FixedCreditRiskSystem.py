import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
import joblib
import warnings
import os
warnings.filterwarnings('ignore')

class FixedCreditRiskSystem:
    def __init__(self):
        self.default_model = None
        self.timeliness_model = None
        self.repayment_model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_names = []

    def calculate_financial_ratios(self, df):
        """Calculate comprehensive financial ratios"""
        ratios_df = df.copy()

        # Core financial ratios
        ratios_df['debt_to_income_ratio'] = ratios_df['outstanding_loan_amount_inr'] / np.maximum(ratios_df['monthly_income_inr'] * 12, 1)
        ratios_df['savings_rate'] = ratios_df['monthly_savings_inr'] / np.maximum(ratios_df['monthly_income_inr'], 1)
        ratios_df['expense_ratio'] = ratios_df['monthly_expenses_inr'] / np.maximum(ratios_df['monthly_income_inr'], 1)

        # Asset ratios
        total_assets = ratios_df['property_value_inr'] + ratios_df['vehicle_value_inr'] + ratios_df['total_investments_inr']
        ratios_df['asset_to_income_ratio'] = total_assets / np.maximum(ratios_df['monthly_income_inr'] * 12, 1)

        # Stability metrics
        ratios_df['employment_stability'] = np.minimum(ratios_df['years_current_employment'] / 10, 1.0)
        ratios_df['banking_stability'] = np.minimum(ratios_df['banking_relationship_years'] / 15, 1.0)

        # Digital engagement
        ratios_df['digital_engagement'] = (ratios_df['monthly_digital_transactions'] / 100) * 0.6 + (ratios_df['digital_payment_adoption_score'] / 100) * 0.4

        # Family burden
        ratios_df['dependency_ratio'] = ratios_df['number_of_dependents'] / np.maximum(ratios_df['family_size'], 1)

        # Income diversification
        total_household_income = ratios_df['monthly_income_inr'] + ratios_df.get('spouse_income_inr', 0)
        ratios_df['income_diversification'] = ratios_df.get('spouse_income_inr', 0) / np.maximum(total_household_income, 1)

        return ratios_df.fillna(0)

    def prepare_features(self, df):
        """Prepare comprehensive feature set for ML models"""
        df_with_ratios = self.calculate_financial_ratios(df)

        # Core features
        feature_columns = [
            'age', 'family_size', 'number_of_dependents', 'monthly_income_inr',
            'monthly_expenses_inr', 'monthly_savings_inr', 'outstanding_loan_amount_inr',
            'property_value_inr', 'vehicle_value_inr', 'total_investments_inr',
            'years_current_employment', 'banking_relationship_years', 'monthly_business_revenue_inr',
            'daily_mobile_hours', 'monthly_digital_transactions', 'avg_transaction_amount_inr',
            'social_media_accounts_count', 'mobile_app_usage_intensity_score',
            'digital_payment_adoption_score', 'utility_payment_regularity_score',
            'location_stability_score', 'mobile_banking_usage_score',
            'payment_reliability_score', 'financial_health_score', 'stability_index',
            'debt_to_income_ratio', 'savings_rate', 'expense_ratio',
            'asset_to_income_ratio', 'employment_stability', 'banking_stability',
            'digital_engagement', 'dependency_ratio', 'income_diversification'
        ]

        categorical_columns = ['gender', 'education_level', 'employment_type', 'marital_status', 'location_type']

        X = df_with_ratios[feature_columns].copy()

        # Encode categorical features
        for col in categorical_columns:
            if col in df_with_ratios.columns:
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                    X[f'{col}_encoded'] = self.label_encoders[col].fit_transform(df_with_ratios[col].astype(str))
                else:
                    try:
                        X[f'{col}_encoded'] = self.label_encoders[col].transform(df_with_ratios[col].astype(str))
                    except ValueError:
                        X[f'{col}_encoded'] = 0

        X = X.fillna(0)
        self.feature_names = X.columns.tolist()
        return X

    def create_balanced_risk_targets(self, df):
        """Create BALANCED risk targets - not everyone should be high risk!"""

        # Calculate key financial health indicators
        debt_income_ratio = df['outstanding_loan_amount_inr'] / np.maximum(df['monthly_income_inr'] * 12, 1)
        savings_rate = df['monthly_savings_inr'] / np.maximum(df['monthly_income_inr'], 1)
        expense_ratio = df['monthly_expenses_inr'] / np.maximum(df['monthly_income_inr'], 1)

        # **FIXED**: More lenient risk calculation
        default_prob = np.zeros(len(df))

        for i in range(len(df)):
            base_risk = 0.04  # Lower base risk (4% instead of 6%)

            # Risk factors (less aggressive penalties)
            debt_penalty = min(debt_income_ratio.iloc[i] * 0.06, 0.15)  # Reduced from 0.12 to 0.06
            low_income_penalty = 0.03 if df['monthly_income_inr'].iloc[i] < 25000 else 0  # Reduced threshold
            young_penalty = 0.02 if df['age'].iloc[i] < 23 else 0  # Reduced penalty and threshold
            employment_penalty = 0.03 if df['years_current_employment'].iloc[i] < 1.5 else 0  # Reduced

            # **STRONGER** Protective factors
            savings_bonus = min(savings_rate.iloc[i] * 0.15, 0.08)  # Increased bonus
            income_bonus = 0.04 if df['monthly_income_inr'].iloc[i] > 60000 else 0.02 if df['monthly_income_inr'].iloc[i] > 40000 else 0
            stability_bonus = min(df['years_current_employment'].iloc[i] * 0.008, 0.04)  # Increased
            education_bonus = 0.025 if df['education_level'].iloc[i] in ['Post Graduate', 'Professional'] else 0.01 if df['education_level'].iloc[i] == 'Graduate' else 0

            final_risk = (base_risk + debt_penalty + low_income_penalty + young_penalty + employment_penalty -
                         savings_bonus - income_bonus - stability_bonus - education_bonus)

            default_prob[i] = max(0.01, min(0.35, final_risk))

        return default_prob

    def train_models(self, training_data_path):
        """Train models with BALANCED risk distribution"""
        print("🔄 Loading training data...")
        df = pd.read_csv(training_data_path)
        print(f"✅ Loaded {len(df)} training samples")

        X = self.prepare_features(df)
        print(f"✅ Prepared {X.shape[1]} features")

        X_scaled = self.scaler.fit_transform(X)

        # **FIXED**: Use balanced risk calculation
        balanced_default_prob = self.create_balanced_risk_targets(df)

        # **FIXED**: More reasonable threshold for high risk classification
        y_default = (balanced_default_prob > 0.12).astype(int)  # 12% threshold instead of 10%

        print(f"📊 Training Risk Distribution: Low={np.sum(y_default == 0)} ({np.mean(y_default == 0):.1%}), High={np.sum(y_default == 1)} ({np.mean(y_default == 1):.1%})")

        y_timeliness = df['timeliness_score'].fillna(df['timeliness_score'].mean())
        y_repayment = df['repayment_ability_score'].fillna(df['repayment_ability_score'].mean())

        # Split data
        X_train, X_test, y_def_train, y_def_test = train_test_split(
            X_scaled, y_default, test_size=0.2, random_state=42, stratify=y_default
        )

        _, _, y_time_train, y_time_test = train_test_split(
            X_scaled, y_timeliness, test_size=0.2, random_state=42
        )

        _, _, y_rep_train, y_rep_test = train_test_split(
            X_scaled, y_repayment, test_size=0.2, random_state=42
        )

        # Train models with balanced settings
        print("🔄 Training default prediction model...")
        self.default_model = RandomForestClassifier(
            n_estimators=100,  # Reduced to prevent overfitting
            max_depth=10,      # Reduced depth
            min_samples_split=10,
            min_samples_leaf=5,
            class_weight='balanced_subsample',  # Better balance handling
            random_state=42,
            n_jobs=-1
        )
        self.default_model.fit(X_train, y_def_train)

        print("🔄 Training timeliness model...")
        self.timeliness_model = GradientBoostingRegressor(
            n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42
        )
        self.timeliness_model.fit(X_train, y_time_train)

        print("🔄 Training repayment model...")
        self.repayment_model = GradientBoostingRegressor(
            n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42
        )
        self.repayment_model.fit(X_train, y_rep_train)

        # Evaluate models
        default_pred = self.default_model.predict(X_test)
        default_accuracy = accuracy_score(y_def_test, default_pred)

        print(f"✅ Default Model Accuracy: {default_accuracy:.3f}")
        print(f"✅ Test Predictions: Low={np.sum(default_pred == 0)}, High={np.sum(default_pred == 1)}")

    def save_models(self, model_path="balanced_credit_models.pkl"):
        """Save all trained models"""
        joblib.dump({
            'default_model': self.default_model,
            'timeliness_model': self.timeliness_model,
            'repayment_model': self.repayment_model,
            'scaler': self.scaler,
            'label_encoders': self.label_encoders,
            'feature_names': self.feature_names
        }, model_path)
        print(f"✅ Models saved to {model_path}")

    def load_models(self, model_path="balanced_credit_models.pkl"):
        """Load trained models"""
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file {model_path} not found")

        model_data = joblib.load(model_path)
        self.default_model = model_data['default_model']
        self.timeliness_model = model_data['timeliness_model']
        self.repayment_model = model_data['repayment_model']
        self.scaler = model_data['scaler']
        self.label_encoders = model_data['label_encoders']
        self.feature_names = model_data.get('feature_names', [])
        print("✅ Models loaded successfully!")

    def predict_applicant_risk(self, applicant_data):
        """FIXED: More realistic risk prediction"""
        X = self.prepare_features(pd.DataFrame([applicant_data]))
        X_scaled = self.scaler.transform(X)

        # Predictions
        default_prob = float(self.default_model.predict_proba(X_scaled)[0][1])
        timeliness_score = float(np.clip(self.timeliness_model.predict(X_scaled)[0], 25, 95))
        repayment_score = float(np.clip(self.repayment_model.predict(X_scaled)[0], 25, 95))

        # **FIXED**: More lenient risk categorization thresholds
        if default_prob > 0.18:  # 18% threshold (was 20%)
            risk_category = "High"
            risk_level = 3
            risk_color = "#dc3545"
        elif default_prob > 0.07:  # 7% threshold (was 8%)
            risk_category = "Medium"
            risk_level = 2
            risk_color = "#ffc107"
        else:
            risk_category = "Low"
            risk_level = 1
            risk_color = "#28a745"

        # Financial analysis
        monthly_income = applicant_data['monthly_income_inr']
        monthly_expenses = applicant_data['monthly_expenses_inr']
        outstanding_debt = applicant_data.get('outstanding_loan_amount_inr', 0)
        monthly_savings = applicant_data.get('monthly_savings_inr', 0)

        # Calculate ratios
        debt_to_income = outstanding_debt / (monthly_income * 12) if monthly_income > 0 else 0
        savings_rate = monthly_savings / monthly_income if monthly_income > 0 else 0
        expense_ratio = monthly_expenses / monthly_income if monthly_income > 0 else 0

        # **FIXED**: More generous loan calculations
        disposable_income = monthly_income - monthly_expenses
        existing_emi = outstanding_debt / 60 if outstanding_debt > 0 else 0
        available_income = disposable_income - existing_emi

        # **FIXED**: More generous loan multipliers
        risk_multipliers = {"Low": 0.45, "Medium": 0.35, "High": 0.25}  # Increased from 0.40, 0.30, 0.20
        max_emi = available_income * risk_multipliers[risk_category]

        if max_emi > 800:  # Reduced threshold from 1000
            min_loan = max(50000, max_emi * 30)   # Increased min from 25000
            max_loan = max_emi * 60
        else:
            min_loan = 50000
            max_loan = 100000  # Increased from 50000

        # Interest rates and terms
        loan_config = {
            "Low": {"term": 60, "rate_min": 8.5, "rate_max": 12.0},
            "Medium": {"term": 48, "rate_min": 11.0, "rate_max": 15.0},  # Improved rates
            "High": {"term": 36, "rate_min": 14.0, "rate_max": 20.0}     # Improved rates
        }

        config = loan_config[risk_category]

        return {
            'default_probability': round(default_prob, 4),
            'risk_category': risk_category,
            'risk_level': risk_level,
            'risk_color': risk_color,
            'timeliness_score': round(timeliness_score, 1),
            'repayment_ability_score': round(repayment_score, 1),
            'financial_ratios': {
                'debt_to_income_ratio': round(debt_to_income, 3),
                'savings_rate': round(savings_rate, 3),
                'expense_ratio': round(expense_ratio, 3)
            },
            'loan_recommendations': {
                'min_amount': max(50000, int(min_loan)),
                'max_amount': max(100000, int(max_loan)),
                'suggested_term_months': config["term"],
                'estimated_emi': int(max_loan / config["term"]) if max_loan > 0 else 0,
                'interest_rate_range': {
                    'min': config["rate_min"],
                    'max': config["rate_max"]
                }
            },
            'approval_recommendation': 'Approve' if risk_category == 'Low' else 'Review' if risk_category == 'Medium' else 'Reject'
        }

    def process_csv_for_website(self, csv_file_path, output_file_path=None):
        """Process CSV with FIXED risk distribution"""
        print(f"🔄 Processing {csv_file_path}...")

        df = pd.read_csv(csv_file_path)
        # if len(df) != 10:
        #     raise ValueError(f"Expected exactly 10 rows, got {len(df)}")

        # Initialize results
        results = {
            'analysis_metadata': {
                'timestamp': datetime.now().isoformat(),
                'total_applicants': len(df),
                'model_version': '3.0_FIXED',
                'analysis_type': 'balanced_credit_risk_assessment'
            },
            'portfolio_overview': {
                'risk_distribution': {'Low': 0, 'Medium': 0, 'High': 0},
                'approval_summary': {'Approve': 0, 'Review': 0, 'Reject': 0},
                'total_loan_potential': 0,
                'average_metrics': {}
            },
            'individual_applicants': [],
            'comprehensive_visualizations': {}
        }

        # Process each applicant
        total_metrics = {'default_prob': 0, 'timeliness': 0, 'repayment': 0, 'income': 0}
        total_loan_potential = 0

        for idx, row in df.iterrows():
            applicant_data = row.to_dict()
            predictions = self.predict_applicant_risk(applicant_data)

            # Update counters
            risk_cat = predictions['risk_category']
            approval = predictions['approval_recommendation']

            results['portfolio_overview']['risk_distribution'][risk_cat] += 1
            results['portfolio_overview']['approval_summary'][approval] += 1

            total_metrics['default_prob'] += predictions['default_probability']
            total_metrics['timeliness'] += predictions['timeliness_score']
            total_metrics['repayment'] += predictions['repayment_ability_score']
            total_metrics['income'] += applicant_data['monthly_income_inr']

            loan_amount = predictions['loan_recommendations']['max_amount']
            total_loan_potential += loan_amount

            # Create applicant profile
            applicant_profile = {
                'applicant_id': applicant_data.get('applicant_id', f'APP_{idx+1:03d}'),
                'sequence_number': idx + 1,
                'demographics': {
                    'age': int(applicant_data['age']),
                    'gender': applicant_data['gender'],
                    'education': applicant_data['education_level'],
                    'employment': applicant_data['employment_type'],
                    'monthly_income': int(applicant_data['monthly_income_inr'])
                },
                'top_decision_metrics': [
                    {
                        'name': 'Default Risk',
                        'value': f"{predictions['default_probability']*100:.1f}%",
                        'status': predictions['risk_category']
                    },
                    {
                        'name': 'Repayment Ability',
                        'value': predictions['repayment_ability_score'],
                        'status': 'Good' if predictions['repayment_ability_score'] > 70 else 'Average'
                    },
                    {
                        'name': 'Payment Timeliness',
                        'value': predictions['timeliness_score'],
                        'status': 'Good' if predictions['timeliness_score'] > 70 else 'Average'
                    }
                ],
                'risk_assessment': {
                    'overall_risk': predictions['risk_category'],
                    'risk_level': predictions['risk_level'],
                    'risk_color': predictions['risk_color'],
                    'default_probability': predictions['default_probability'],
                    'recommendation': predictions['approval_recommendation']
                },
                'loan_details': {
                    'eligibility': 'Eligible' if approval != 'Reject' else 'Not Eligible',
                    'loan_range': {
                        'minimum': predictions['loan_recommendations']['min_amount'],
                        'maximum': predictions['loan_recommendations']['max_amount']
                    },
                    'terms': {
                        'tenure_months': predictions['loan_recommendations']['suggested_term_months'],
                        'monthly_emi': predictions['loan_recommendations']['estimated_emi'],
                        'interest_rate_range': predictions['loan_recommendations']['interest_rate_range']
                    }
                }
            }

            results['individual_applicants'].append(applicant_profile)

        # Calculate averages
        n = len(df)
        results['portfolio_overview']['average_metrics'] = {
            'default_probability': round(total_metrics['default_prob'] / n, 4),
            'timeliness_score': round(total_metrics['timeliness'] / n, 1),
            'repayment_score': round(total_metrics['repayment'] / n, 1),
            'monthly_income': int(total_metrics['income'] / n)
        }

        results['portfolio_overview']['total_loan_potential'] = int(total_loan_potential)

        # Generate visualizations
        results['comprehensive_visualizations'] = {
            'approval_funnel': {
                'type': 'funnel',
                'title': 'Loan Approval Funnel',
                'data': {
                    'stages': [
                        {'name': 'Total Applications', 'value': len(df), 'color': '#6c757d'},
                        {'name': 'Approved', 'value': results['portfolio_overview']['approval_summary']['Approve'], 'color': '#28a745'},
                        {'name': 'Under Review', 'value': results['portfolio_overview']['approval_summary']['Review'], 'color': '#ffc107'},
                        {'name': 'Rejected', 'value': results['portfolio_overview']['approval_summary']['Reject'], 'color': '#dc3545'}
                    ]
                }
            },
            'risk_distribution_chart': {
                'type': 'donut',
                'title': 'Portfolio Risk Distribution',
                'data': {
                    'labels': ['Low Risk', 'Medium Risk', 'High Risk'],
                    'values': [
                        results['portfolio_overview']['risk_distribution']['Low'],
                        results['portfolio_overview']['risk_distribution']['Medium'],
                        results['portfolio_overview']['risk_distribution']['High']
                    ],
                    'colors': ['#28a745', '#ffc107', '#dc3545']
                }
            }
        }

        # Save results
        if output_file_path is None:
            output_file_path = f"fixed_credit_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        with open(output_file_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        print(f"✅ FIXED Analysis complete!")
        print(f"📊 Risk Distribution: Low={results['portfolio_overview']['risk_distribution']['Low']}, Medium={results['portfolio_overview']['risk_distribution']['Medium']}, High={results['portfolio_overview']['risk_distribution']['High']}")
        print(f"🎯 Approval Summary: Approve={results['portfolio_overview']['approval_summary']['Approve']}, Review={results['portfolio_overview']['approval_summary']['Review']}, Reject={results['portfolio_overview']['approval_summary']['Reject']}")
        print(f"📄 Results: {output_file_path}")

        return results, output_file_path
    

# Usage function
def run_fixed_system():
    """Run the FIXED system with proper risk distribution"""
    try:
        system = FixedCreditRiskSystem()

        # Train models with balanced approach
        print("\n=== TRAINING BALANCED MODELS ===")
        system.train_models("C:\\Users\\Sahil Chandel\\OneDrive\\Desktop\\everything\\Finshield\\DefaultPrediction\\realistic_credit_risk_dataset.csv")
        system.save_models()

        # Process test data
        print("\n=== PROCESSING TEST DATA ===")
        results, output_path = system.process_csv_for_website("C:\\Users\\Sahil Chandel\\OneDrive\\Desktop\\everything\\Finshield\\DefaultPrediction\\balanced_test_dataset.csv")

        print(f"\n🎉 SUCCESS - BALANCED RESULTS!")
        return results, output_path

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise

if __name__ == "__main__":
    results, output_file = run_fixed_system()
