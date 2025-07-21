from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from datetime import datetime
import tempfile
from FixedCreditRiskSystem import FixedCreditRiskSystem

app = Flask(__name__)
CORS(app)

# Initialize and load models
credit_system = FixedCreditRiskSystem()
try:
    credit_system.load_models("balanced_credit_models.pkl")
except FileNotFoundError:
    print("Model not found. Training new models...")
    credit_system.train_models("training_data.csv")
    credit_system.save_models("balanced_credit_models.pkl")

@app.route('/api/credit_risk/analyze', methods=['POST'])
def analyze_credit_risk():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided', 'status': 'error'}), 400

    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Invalid file type', 'status': 'error'}), 400

    temp_file_path = os.path.join(tempfile.gettempdir(), f"upload_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv")
    
    try:
        file.save(temp_file_path)
        
        # Validate CSV structure
        df = pd.read_csv(temp_file_path)
        required_columns = ['age', 'monthly_income_inr', 'outstanding_loan_amount_inr']  # Add all required features
        if not all(col in df.columns for col in required_columns):
            return jsonify({'error': f'Missing required columns. Needed: {required_columns}', 'status': 'error'}), 400

        # Process CSV
        results, output_path = credit_system.process_csv_for_website(temp_file_path)
        return jsonify({'status': 'success', 'results': results, 'output_file': output_path}), 200

    except pd.errors.EmptyDataError:
        return jsonify({'error': 'Empty CSV file', 'status': 'error'}), 400
    except KeyError as e:
        return jsonify({'error': f'Missing column: {str(e)}', 'status': 'error'}), 400
    except Exception as e:
        return jsonify({'error': f'Processing failed: {str(e)}', 'status': 'error'}), 500
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)