from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import pandas as pd
import os
import json
from datetime import datetime
import tempfile
from FixedCreditRiskSystem import FixedCreditRiskSystem
from database_models import db, Analysis, Applicant

app = Flask(__name__)
CORS(app)

# Database configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "credit_risk.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db.init_app(app)
migrate = Migrate(app, db)

# Initialize and load models
credit_system = FixedCreditRiskSystem()
try:
    credit_system.load_models("balanced_credit_models.pkl")
    print("✅ Models loaded successfully!")
except FileNotFoundError:
    print("⚠️ Model not found. Please train models first.")

# Create tables
with app.app_context():
    db.create_all()
    print("✅ Database tables created/verified!")

# Supported file extensions
ALLOWED_EXTS = {'.csv', '.xlsx', '.xls', '.xlsm', '.xlsb', '.ods', '.json'}

def read_uploaded_to_df(file_storage, filename_hint):
    """Read uploaded file into pandas DataFrame based on file extension"""
    name = (filename_hint or "").lower()
    file_storage.seek(0)
    
    if name.endswith('.csv') or name.endswith('.txt'):
        return pd.read_csv(file_storage)
    elif name.endswith(('.xlsx', '.xls', '.xlsm', '.xlsb')):
        try:
            return pd.read_excel(file_storage, sheet_name=0, engine='openpyxl')
        except ImportError:
            raise ImportError("Missing optional dependency 'openpyxl'. Use pip install openpyxl for Excel files.")
    elif name.endswith('.ods'):
        try:
            return pd.read_excel(file_storage, sheet_name=0, engine='odf')
        except ImportError:
            raise ImportError("Missing optional dependency 'odfpy'. Use pip install odfpy for ODS files.")
    elif name.endswith('.json'):
        try:
            return pd.read_json(file_storage, lines=False)
        except ValueError:
            file_storage.seek(0)
            return pd.read_json(file_storage, lines=True)
    else:
        return pd.read_csv(file_storage)

def save_analysis_to_db(results, filename, original_df):
    """Save COMPLETE analysis results to database with ALL data"""
    try:
        # Create Analysis record
        analysis = Analysis(
            filename=filename,
            total_applicants=results['analysis_metadata']['total_applicants'],
            model_version=results['analysis_metadata']['model_version'],
            analysis_type=results['analysis_metadata']['analysis_type'],
            approve_count=results['portfolio_overview']['approval_summary']['Approve'],
            review_count=results['portfolio_overview']['approval_summary']['Review'],
            reject_count=results['portfolio_overview']['approval_summary']['Reject'],
            low_risk_count=results['portfolio_overview']['risk_distribution']['Low'],
            medium_risk_count=results['portfolio_overview']['risk_distribution']['Medium'],
            high_risk_count=results['portfolio_overview']['risk_distribution']['High'],
            total_loan_potential=results['portfolio_overview']['total_loan_potential'],
            avg_default_probability=results['portfolio_overview']['average_metrics']['default_probability'],
            avg_timeliness_score=results['portfolio_overview']['average_metrics']['timeliness_score'],
            avg_repayment_score=results['portfolio_overview']['average_metrics']['repayment_score'],
            avg_monthly_income=results['portfolio_overview']['average_metrics']['monthly_income']
        )
        
        db.session.add(analysis)
        db.session.flush()  # To get the analysis ID
        
        # Create Applicant records with ALL data
        for idx, applicant_data in enumerate(results['individual_applicants']):
            # Get original row data
            original_row = original_df.iloc[idx].to_dict()
            
            # Calculate financial ratios from original data
            ratios = credit_system.calculate_financial_ratios(pd.DataFrame([original_row])).iloc[0]
            
            applicant = Applicant(
                applicant_id=applicant_data['applicant_id'],
                analysis_id=analysis.id,
                sequence_number=applicant_data['sequence_number'],
                
                # Complete Demographics
                age=applicant_data['demographics']['age'],
                gender=applicant_data['demographics']['gender'],
                education=applicant_data['demographics']['education'],
                employment=applicant_data['demographics']['employment'],
                marital_status=original_row.get('marital_status'),
                location_type=original_row.get('location_type'),
                family_size=original_row.get('family_size'),
                number_of_dependents=original_row.get('number_of_dependents'),
                
                # Complete Financial Data
                monthly_income=applicant_data['demographics']['monthly_income'],
                monthly_expenses=original_row.get('monthly_expenses_inr'),
                monthly_savings=original_row.get('monthly_savings_inr'),
                outstanding_loan_amount=original_row.get('outstanding_loan_amount_inr'),
                property_value=original_row.get('property_value_inr'),
                vehicle_value=original_row.get('vehicle_value_inr'),
                total_investments=original_row.get('total_investments_inr'),
                monthly_business_revenue=original_row.get('monthly_business_revenue_inr'),
                years_current_employment=original_row.get('years_current_employment'),
                banking_relationship_years=original_row.get('banking_relationship_years'),
                
                # Complete Digital Profile
                daily_mobile_hours=original_row.get('daily_mobile_hours'),
                monthly_digital_transactions=original_row.get('monthly_digital_transactions'),
                avg_transaction_amount=original_row.get('avg_transaction_amount_inr'),
                social_media_accounts_count=original_row.get('social_media_accounts_count'),
                mobile_app_usage_intensity_score=original_row.get('mobile_app_usage_intensity_score'),
                digital_payment_adoption_score=original_row.get('digital_payment_adoption_score'),
                utility_payment_regularity_score=original_row.get('utility_payment_regularity_score'),
                location_stability_score=original_row.get('location_stability_score'),
                mobile_banking_usage_score=original_row.get('mobile_banking_usage_score'),
                
                # All Scores
                payment_reliability_score=original_row.get('payment_reliability_score'),
                financial_health_score=original_row.get('financial_health_score'),
                stability_index=original_row.get('stability_index'),
                timeliness_score=applicant_data['top_decision_metrics'][2]['value'] if len(applicant_data['top_decision_metrics']) > 2 else None,
                repayment_ability_score=applicant_data['top_decision_metrics'][1]['value'] if len(applicant_data['top_decision_metrics']) > 1 else None,
                
                # Risk Assessment
                risk_category=applicant_data['risk_assessment']['overall_risk'],
                risk_level=applicant_data['risk_assessment']['risk_level'],
                risk_color=applicant_data['risk_assessment']['risk_color'],
                default_probability=applicant_data['risk_assessment']['default_probability'],
                recommendation=applicant_data['risk_assessment']['recommendation'],
                
                # Loan Details
                eligibility=applicant_data['loan_details']['eligibility'],
                min_loan_amount=applicant_data['loan_details']['loan_range']['minimum'],
                max_loan_amount=applicant_data['loan_details']['loan_range']['maximum'],
                tenure_months=applicant_data['loan_details']['terms']['tenure_months'],
                monthly_emi=applicant_data['loan_details']['terms']['monthly_emi'],
                interest_rate_min=applicant_data['loan_details']['terms']['interest_rate_range']['min'],
                interest_rate_max=applicant_data['loan_details']['terms']['interest_rate_range']['max'],
                
                # Calculated Ratios
                debt_to_income_ratio=ratios.get('debt_to_income_ratio'),
                savings_rate=ratios.get('savings_rate'),
                expense_ratio=ratios.get('expense_ratio'),
                asset_to_income_ratio=ratios.get('asset_to_income_ratio'),
                employment_stability=ratios.get('employment_stability'),
                banking_stability=ratios.get('banking_stability'),
                digital_engagement=ratios.get('digital_engagement'),
                dependency_ratio=ratios.get('dependency_ratio'),
                income_diversification=ratios.get('income_diversification'),
                
                # Store complete original data as JSON
                raw_data=json.dumps(original_row, default=str)
            )
            db.session.add(applicant)
        
        db.session.commit()
        print(f"✅ Saved analysis to database with ID: {analysis.id}")
        return analysis.id
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Database save error: {str(e)}")
        raise e

@app.route('/api/credit_risk/analyze', methods=['POST'])
def analyze_credit_risk():
    """Process uploaded file and save ONLY to database (NO JSON FILES)"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided', 'status': 'error'}), 400

    file = request.files['file']
    filename = file.filename or ''
    
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTS:
        return jsonify({
            'error': f'Invalid file type: {ext}. Supported formats: {", ".join(ALLOWED_EXTS)}',
            'status': 'error'
        }), 400

    temp_csv_path = os.path.join(
        tempfile.gettempdir(),
        f"upload_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}.csv"
    )

    try:
        # Read uploaded file into DataFrame
        df = read_uploaded_to_df(file, filename)
        
        # Validate required columns
        required_columns = ['age', 'monthly_income_inr', 'outstanding_loan_amount_inr']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            return jsonify({
                'error': f'Missing required columns: {missing_columns}. Available columns: {list(df.columns)}',
                'status': 'error'
            }), 400

        # Convert DataFrame to CSV for existing pipeline
        df.to_csv(temp_csv_path, index=False)
        
        # Process via existing function (but don't save JSON file)
        results, _ = credit_system.process_csv_for_website(temp_csv_path, output_file_path=None)
        
        # Save ONLY to database
        analysis_id = save_analysis_to_db(results, filename, df)
        
        return jsonify({
            'status': 'success',
            'results': results,
            'analysis_id': analysis_id,
            'processed_rows': len(df),
            'message': f'Successfully analyzed and saved {len(df)} records to database'
        }), 200

    except Exception as e:
        return jsonify({'error': f'Processing failed: {str(e)}', 'status': 'error'}), 500
    finally:
        if os.path.exists(temp_csv_path):
            try:
                os.remove(temp_csv_path)
            except Exception:
                pass

# ... (keep all other existing routes the same)

@app.route('/api/credit_risk/history', methods=['GET'])
def get_analysis_history():
    """Get all analysis history from database"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        analyses = Analysis.query.order_by(Analysis.timestamp.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'status': 'success',
            'analyses': [analysis.to_dict() for analysis in analyses.items],
            'total': analyses.total,
            'pages': analyses.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch history: {str(e)}', 'status': 'error'}), 500

@app.route('/api/credit_risk/analysis/<int:analysis_id>', methods=['GET'])
def get_analysis_by_id(analysis_id):
    """Get specific analysis from database"""
    try:
        analysis = Analysis.query.get_or_404(analysis_id)
        return jsonify({
            'status': 'success',
            'analysis': analysis.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Analysis not found: {str(e)}', 'status': 'error'}), 404

@app.route('/api/credit_risk/applicant/<int:applicant_id>', methods=['GET'])
def get_applicant_details(applicant_id):
    """Get COMPLETE applicant details from database"""
    try:
        applicant = Applicant.query.get_or_404(applicant_id)
        return jsonify({
            'status': 'success',
            'applicant': applicant.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Applicant not found: {str(e)}', 'status': 'error'}), 404

@app.route('/api/credit_risk/analysis/<int:analysis_id>/applicants', methods=['GET'])
def get_analysis_applicants(analysis_id):
    """Get all applicants for a specific analysis"""
    try:
        analysis = Analysis.query.get_or_404(analysis_id)
        applicants = Applicant.query.filter_by(analysis_id=analysis_id).order_by(Applicant.sequence_number).all()
        
        return jsonify({
            'status': 'success',
            'analysis_info': {
                'filename': analysis.filename,
                'timestamp': analysis.timestamp.isoformat(),
                'total_applicants': analysis.total_applicants
            },
            'applicants': [applicant.to_dict() for applicant in applicants]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch applicants: {str(e)}', 'status': 'error'}), 500

@app.route('/api/credit_risk/analysis/<int:analysis_id>', methods=['DELETE'])
def delete_analysis(analysis_id):
    """Delete analysis from database"""
    try:
        analysis = Analysis.query.get_or_404(analysis_id)
        db.session.delete(analysis)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Analysis deleted successfully from database'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete analysis: {str(e)}', 'status': 'error'}), 500

@app.route('/api/credit_risk/stats', methods=['GET'])
def get_dashboard_stats():
    """Get dashboard statistics from database"""
    try:
        total_analyses = Analysis.query.count()
        total_applicants = db.session.query(db.func.sum(Analysis.total_applicants)).scalar() or 0
        total_approved = db.session.query(db.func.sum(Analysis.approve_count)).scalar() or 0
        total_loan_potential = db.session.query(db.func.sum(Analysis.total_loan_potential)).scalar() or 0
        
        # Recent analysis
        recent_analysis = Analysis.query.order_by(Analysis.timestamp.desc()).first()
        
        return jsonify({
            'status': 'success',
            'stats': {
                'total_analyses': total_analyses,
                'total_applicants': total_applicants,
                'total_approved': total_approved,
                'total_loan_potential': total_loan_potential,
                'recent_analysis': recent_analysis.to_dict() if recent_analysis else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch stats: {str(e)}', 'status': 'error'}), 500

@app.route('/api/credit_risk/search', methods=['GET'])
def search_applicants():
    """Advanced search functionality"""
    try:
        query = request.args.get('q', '')
        risk_filter = request.args.get('risk')
        recommendation_filter = request.args.get('recommendation')
        min_income = request.args.get('min_income', type=int)
        max_income = request.args.get('max_income', type=int)
        
        # Build query
        applicant_query = Applicant.query
        
        if query:
            applicant_query = applicant_query.filter(
                Applicant.applicant_id.contains(query)
            )
        
        if risk_filter:
            applicant_query = applicant_query.filter(Applicant.risk_category == risk_filter)
        
        if recommendation_filter:
            applicant_query = applicant_query.filter(Applicant.recommendation == recommendation_filter)
        
        if min_income:
            applicant_query = applicant_query.filter(Applicant.monthly_income >= min_income)
        
        if max_income:
            applicant_query = applicant_query.filter(Applicant.monthly_income <= max_income)
        
        results = applicant_query.limit(100).all()  # Limit results
        
        return jsonify({
            'status': 'success',
            'results': [applicant.to_dict() for applicant in results],
            'count': len(results)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Search failed: {str(e)}', 'status': 'error'}), 500

if __name__ == '__main__':
    print("🚀 Starting Credit Risk API Server...")
    print("🗄️ Database: SQLite (credit_risk.db)")
    print("🔗 API Base URL: http://localhost:5000/api/credit_risk")
    print("📁 No JSON files created - Everything stored in database!")
    app.run(debug=True, host='0.0.0.0', port=5000)
