import os
from api_endpoint import app, db
from database_models import Analysis, Applicant

def initialize_database():
    """Initialize the SQLite database"""
    with app.app_context():
        print("🔄 Creating database tables...")
        
        # Create all tables
        db.create_all()
        
        # Verify database file creation
        db_path = os.path.join(os.path.dirname(__file__), 'credit_risk.db')
        if os.path.exists(db_path):
            print(f"✅ Database created successfully at: {db_path}")
            print(f"📊 Database size: {os.path.getsize(db_path)} bytes")
        else:
            print("❌ Database file not created")
            return False
            
        # Test database connection
        try:
            # Simple query to test connection
            count = Analysis.query.count()
            print(f"✅ Database connection successful. Current analyses: {count}")
            return True
        except Exception as e:
            print(f"❌ Database connection failed: {str(e)}")
            return False

if __name__ == "__main__":
    success = initialize_database()
    if success:
        print("\n🎉 Database setup completed successfully!")
        print("You can now run: python updated_api_endpoint.py")
    else:
        print("\n💥 Database setup failed!")
