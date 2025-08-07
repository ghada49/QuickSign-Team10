from flask import Flask, redirect, url_for, render_template, request, session, flash
from datetime import timedelta
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app= Flask(__name__)
app.secret_key="uihvirjvoiernbivesrijberibneribhherjboijbiernbjerjoberheroinebjij"
app.config['SQLALCHEMY_DATABASE_URI']='sqlite:///users.sqlite3' #user is the name of the table
app.config['SQLALCHEMY_TRACK_MODIFICATIONS']=False
app.permanent_session_lifetime = timedelta(minutes=20)
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True)
    gender = db.Column(db.String(30))

@app.route("/", methods=["POST", "GET"])
def login_signin():
    if 'user_id' in session:
        return redirect(url_for('home'))
    if request.method=="POST":
        action=request.form.get('action')
        if action=="login":
            return redirect(url_for("login"))
        elif action=="signin":
            return redirect(url_for("signin"))
    return render_template("login_signin.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if 'user_id' in session:
        return redirect(url_for('home'))
    if request.method == "POST":
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            session['username'] = user.username
            session['email'] = user.email
            session['gender'] = user.gender
            flash('Login successful!', 'success')
            return redirect(url_for('home'))
        else:
            flash('Invalid username or password', 'error')
    return render_template("login.html")

@app.route("/signin", methods=["GET", "POST"])
def signin():
    if 'user_id' in session:
        return redirect(url_for('home'))
    if request.method == "POST":
        username = request.form.get('username')
        password = request.form.get('password')
        email = request.form.get('email')
        gender = request.form.get('gender')
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash('Username already exists', 'error')
            return render_template("signin.html")
        new_user = User(username=username, password=generate_password_hash(password), email=email, gender=gender)
        try:
            db.session.add(new_user)
            db.session.commit()
            flash('Account created successfully! Please login.', 'success')
            return redirect(url_for('login'))
        except:
            flash('Error creating account', 'error')
    
    return render_template("signin.html")

@app.route("/home")
def home():
    if 'user_id' not in session:
        return redirect(url_for('login_signin'))
    return render_template("home.html", username=session.get('username'))

@app.route("/logout")
def logout():
    session.clear()
    flash('You have been logged out', 'info')
    return redirect(url_for('login_signin'))

if __name__ =="__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
    