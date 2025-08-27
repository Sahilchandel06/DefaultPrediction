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

# Supported file extensions
ALLOWED_EXTS = {'.csv', '.xlsx', '.xls', '.xlsm', '.xlsb', '.ods', '.json'}

def read_uploaded_to_df(file_storage, filename_hint):
    """Read uploaded file into pandas DataFrame based on file extension"""
    name = (filename_hint or "").lower()
    file_storage.seek(0)  # Reset file pointer
    
    if name.endswith('.csv') or name.endswith('.txt'):
        return pd.read_csv(file_storage)
    elif name.endswith(('.xlsx', '.xls', '.xlsm', '.xlsb')):
        # For Excel files
        try:
            return pd.read_excel(file_storage, sheet_name=0, engine='openpyxl')
        except ImportError:
            raise ImportError("Missing optional dependency 'openpyxl'. Use pip install openpyxl for Excel files.")
    elif name.endswith('.ods'):
        # For OpenDocument Spreadsheets
        try:
            return pd.read_excel(file_storage, sheet_name=0, engine='odf')
        except ImportError:
            raise ImportError("Missing optional dependency 'odfpy'. Use pip install odfpy for ODS files.")
    elif name.endswith('.json'):
        # Support both standard JSON and NDJSON formats
        try:
            return pd.read_json(file_storage, lines=False)
        except ValueError:
            file_storage.seek(0)
            return pd.read_json(file_storage, lines=True)
    else:
        # Default fallback to CSV
        return pd.read_csv(file_storage)

@app.route('/api/credit_risk/analyze', methods=['POST'])
def analyze_credit_risk():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided', 'status': 'error'}), 400

    file = request.files['file']
    filename = file.filename or ''
    
    # Extract file extension properly
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTS:
        return jsonify({
            'error': f'Invalid file type: {ext}. Supported formats: {", ".join(ALLOWED_EXTS)}', 
            'status': 'error'
        }), 400

    # Create temporary CSV file path
    temp_csv_path = os.path.join(
        tempfile.gettempdir(), 
        f"upload_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}.csv"
    )
    
    try:
        # Read uploaded file into DataFrame (handles multiple formats)
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
        
        # Process via existing CSV-only function
        results, output_path = credit_system.process_csv_for_website(temp_csv_path)
        return jsonify({
            'status': 'success', 
            'results': results, 
            'output_file': output_path,
            'processed_rows': len(df)
        }), 200

    except pd.errors.EmptyDataError:
        return jsonify({'error': 'Empty file provided', 'status': 'error'}), 400
    except ImportError as e:
        return jsonify({'error': str(e), 'status': 'error'}), 400
    except KeyError as e:
        return jsonify({'error': f'Missing column: {str(e)}', 'status': 'error'}), 400
    except Exception as e:
        return jsonify({'error': f'Processing failed: {str(e)}', 'status': 'error'}), 500
    finally:
        # Clean up temporary file
        if os.path.exists(temp_csv_path):
            try:
                os.remove(temp_csv_path)
            except Exception:
                pass

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
