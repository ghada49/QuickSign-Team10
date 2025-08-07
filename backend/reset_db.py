from py import app, db, User
from werkzeug.security import generate_password_hash

def reset_database():
    with app.app_context():
        # Drop all tables
        db.drop_all()
        # Create all tables
        db.create_all()
        
        # Create a test user
        test_user = User(
            username='testuser',
            password=generate_password_hash('password123'),
            email='test@example.com',
            gender='Other'
        )
        
        db.session.add(test_user)
        db.session.commit()
        
        print("Database reset successfully!")
        print("Test user created:")
        print("Username: testuser")
        print("Password: password123")

if __name__ == "__main__":
    reset_database() 