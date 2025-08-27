from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Analysis(db.Model):
    __tablename__ = 'analyses'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    total_applicants = db.Column(db.Integer, nullable=False)
    model_version = db.Column(db.String(50), default='3.0_FIXED')
    analysis_type = db.Column(db.String(100), default='balanced_credit_risk_assessment')
    
    # Portfolio overview
    approve_count = db.Column(db.Integer, default=0)
    review_count = db.Column(db.Integer, default=0)
    reject_count = db.Column(db.Integer, default=0)
    low_risk_count = db.Column(db.Integer, default=0)
    medium_risk_count = db.Column(db.Integer, default=0)
    high_risk_count = db.Column(db.Integer, default=0)
    total_loan_potential = db.Column(db.BigInteger, default=0)
    
    # Average metrics
    avg_default_probability = db.Column(db.Float, default=0.0)
    avg_timeliness_score = db.Column(db.Float, default=0.0)
    avg_repayment_score = db.Column(db.Float, default=0.0)
    avg_monthly_income = db.Column(db.Integer, default=0)
    
    # Relationships
    applicants = db.relationship('Applicant', backref='analysis', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'timestamp': self.timestamp.isoformat(),
            'data': {
                'analysis_metadata': {
                    'timestamp': self.timestamp.isoformat(),
                    'total_applicants': self.total_applicants,
                    'model_version': self.model_version,
                    'analysis_type': self.analysis_type
                },
                'portfolio_overview': {
                    'risk_distribution': {
                        'Low': self.low_risk_count,
                        'Medium': self.medium_risk_count,
                        'High': self.high_risk_count
                    },
                    'approval_summary': {
                        'Approve': self.approve_count,
                        'Review': self.review_count,
                        'Reject': self.reject_count
                    },
                    'total_loan_potential': self.total_loan_potential,
                    'average_metrics': {
                        'default_probability': self.avg_default_probability,
                        'timeliness_score': self.avg_timeliness_score,
                        'repayment_score': self.avg_repayment_score,
                        'monthly_income': self.avg_monthly_income
                    }
                },
                'individual_applicants': [applicant.to_dict() for applicant in self.applicants]
            }
        }

class Applicant(db.Model):
    __tablename__ = 'applicants'
    
    id = db.Column(db.Integer, primary_key=True)
    applicant_id = db.Column(db.String(50), nullable=False)
    analysis_id = db.Column(db.Integer, db.ForeignKey('analyses.id'), nullable=False)
    sequence_number = db.Column(db.Integer, nullable=False)
    
    # Complete Demographics
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(20))
    education = db.Column(db.String(50))
    employment = db.Column(db.String(50))
    marital_status = db.Column(db.String(20))
    location_type = db.Column(db.String(50))
    family_size = db.Column(db.Integer)
    number_of_dependents = db.Column(db.Integer)
    
    # Financial Data - ALL FIELDS
    monthly_income = db.Column(db.Integer, nullable=False)
    monthly_expenses = db.Column(db.Integer)
    monthly_savings = db.Column(db.Integer)
    outstanding_loan_amount = db.Column(db.Integer)
    property_value = db.Column(db.BigInteger)
    vehicle_value = db.Column(db.Integer)
    total_investments = db.Column(db.Integer)
    monthly_business_revenue = db.Column(db.Integer)
    
    # Employment & Banking
    years_current_employment = db.Column(db.Float)
    banking_relationship_years = db.Column(db.Integer)
    
    # Digital Profile - ALL FIELDS
    daily_mobile_hours = db.Column(db.Float)
    monthly_digital_transactions = db.Column(db.Integer)
    avg_transaction_amount = db.Column(db.Integer)
    social_media_accounts_count = db.Column(db.Integer)
    mobile_app_usage_intensity_score = db.Column(db.Integer)
    digital_payment_adoption_score = db.Column(db.Integer)
    utility_payment_regularity_score = db.Column(db.Integer)
    location_stability_score = db.Column(db.Integer)
    mobile_banking_usage_score = db.Column(db.Integer)
    
    # Model Scores - ALL SCORES
    payment_reliability_score = db.Column(db.Integer)
    financial_health_score = db.Column(db.Integer)
    stability_index = db.Column(db.Integer)
    timeliness_score = db.Column(db.Float)
    repayment_ability_score = db.Column(db.Float)
    
    # Risk Assessment Results
    risk_category = db.Column(db.String(20), nullable=False)
    risk_level = db.Column(db.Integer, nullable=False)
    risk_color = db.Column(db.String(20), nullable=False)
    default_probability = db.Column(db.Float, nullable=False)
    recommendation = db.Column(db.String(20), nullable=False)
    
    # Loan Details
    eligibility = db.Column(db.String(20))
    min_loan_amount = db.Column(db.Integer)
    max_loan_amount = db.Column(db.Integer)
    tenure_months = db.Column(db.Integer)
    monthly_emi = db.Column(db.Integer)
    interest_rate_min = db.Column(db.Float)
    interest_rate_max = db.Column(db.Float)
    
    # Financial Ratios (calculated)
    debt_to_income_ratio = db.Column(db.Float)
    savings_rate = db.Column(db.Float)
    expense_ratio = db.Column(db.Float)
    asset_to_income_ratio = db.Column(db.Float)
    employment_stability = db.Column(db.Float)
    banking_stability = db.Column(db.Float)
    digital_engagement = db.Column(db.Float)
    dependency_ratio = db.Column(db.Float)
    income_diversification = db.Column(db.Float)
    
    # Store additional raw data as JSON
    raw_data = db.Column(db.Text)  # Complete original CSV row
    
    def to_dict(self):
        # Parse raw data
        try:
            raw_data = json.loads(self.raw_data) if self.raw_data else {}
        except:
            raw_data = {}
            
        return {
            'id': self.id,  # Database ID for frontend reference
            'applicant_id': self.applicant_id,
            'sequence_number': self.sequence_number,
            'demographics': {
                'age': self.age,
                'gender': self.gender,
                'education': self.education,
                'employment': self.employment,
                'marital_status': self.marital_status,
                'location_type': self.location_type,
                'family_size': self.family_size,
                'number_of_dependents': self.number_of_dependents,
                'monthly_income': self.monthly_income
            },
            'financial_profile': {
                'monthly_income': self.monthly_income,
                'monthly_expenses': self.monthly_expenses,
                'monthly_savings': self.monthly_savings,
                'outstanding_loan_amount': self.outstanding_loan_amount,
                'property_value': self.property_value,
                'vehicle_value': self.vehicle_value,
                'total_investments': self.total_investments,
                'monthly_business_revenue': self.monthly_business_revenue,
                'years_current_employment': self.years_current_employment,
                'banking_relationship_years': self.banking_relationship_years
            },
            'digital_profile': {
                'daily_mobile_hours': self.daily_mobile_hours,
                'monthly_digital_transactions': self.monthly_digital_transactions,
                'avg_transaction_amount': self.avg_transaction_amount,
                'social_media_accounts_count': self.social_media_accounts_count,
                'mobile_app_usage_intensity_score': self.mobile_app_usage_intensity_score,
                'digital_payment_adoption_score': self.digital_payment_adoption_score,
                'utility_payment_regularity_score': self.utility_payment_regularity_score,
                'location_stability_score': self.location_stability_score,
                'mobile_banking_usage_score': self.mobile_banking_usage_score
            },
            'scores': {
                'payment_reliability_score': self.payment_reliability_score,
                'financial_health_score': self.financial_health_score,
                'stability_index': self.stability_index,
                'timeliness_score': self.timeliness_score,
                'repayment_ability_score': self.repayment_ability_score
            },
            'calculated_ratios': {
                'debt_to_income_ratio': self.debt_to_income_ratio,
                'savings_rate': self.savings_rate,
                'expense_ratio': self.expense_ratio,
                'asset_to_income_ratio': self.asset_to_income_ratio,
                'employment_stability': self.employment_stability,
                'banking_stability': self.banking_stability,
                'digital_engagement': self.digital_engagement,
                'dependency_ratio': self.dependency_ratio,
                'income_diversification': self.income_diversification
            },
            'risk_assessment': {
                'overall_risk': self.risk_category,
                'risk_level': self.risk_level,
                'risk_color': self.risk_color,
                'default_probability': self.default_probability,
                'recommendation': self.recommendation
            },
            'loan_details': {
                'eligibility': self.eligibility,
                'loan_range': {
                    'minimum': self.min_loan_amount,
                    'maximum': self.max_loan_amount
                },
                'terms': {
                    'tenure_months': self.tenure_months,
                    'monthly_emi': self.monthly_emi,
                    'interest_rate_range': {
                        'min': self.interest_rate_min,
                        'max': self.interest_rate_max
                    }
                }
            },
            'raw_data': raw_data,
            'top_decision_metrics': [
                {
                    'name': 'Default Risk',
                    'value': f"{self.default_probability*100:.1f}%",
                    'status': self.risk_category
                },
                {
                    'name': 'Repayment Ability',
                    'value': self.repayment_ability_score,
                    'status': 'Good' if self.repayment_ability_score and self.repayment_ability_score > 70 else 'Average'
                },
                {
                    'name': 'Payment Timeliness',
                    'value': self.timeliness_score,
                    'status': 'Good' if self.timeliness_score and self.timeliness_score > 70 else 'Average'
                }
            ]
        }
