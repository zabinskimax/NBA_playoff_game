from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import json
import re

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change this in production
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///nba_brackets.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    brackets = db.relationship('Bracket', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Bracket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    picks = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    score = db.Column(db.Float, default=0.0)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    return True, "Password is valid"

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')

        # Validate username
        if len(username) < 3:
            flash('Username must be at least 3 characters long', 'danger')
            return redirect(url_for('register'))

        # Validate email
        if not validate_email(email):
            flash('Please enter a valid email address', 'danger')
            return redirect(url_for('register'))

        # Validate password
        is_valid, message = validate_password(password)
        if not is_valid:
            flash(message, 'danger')
            return redirect(url_for('register'))

        # Check if username exists
        if User.query.filter_by(username=username).first():
            flash('Username already exists', 'danger')
            return redirect(url_for('register'))

        # Check if email exists
        if User.query.filter_by(email=email).first():
            flash('Email already registered', 'danger')
            return redirect(url_for('register'))

        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()

        if not user:
            flash('Username not found', 'danger')
            return redirect(url_for('login'))

        if not user.check_password(password):
            flash('Incorrect password', 'danger')
            return redirect(url_for('login'))

        login_user(user)
        flash('Welcome back!', 'success')
        return redirect(url_for('dashboard'))

    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    user_brackets = Bracket.query.filter_by(user_id=current_user.id).all()
    return render_template('dashboard.html', brackets=user_brackets)

@app.route('/create_bracket', methods=['GET', 'POST'])
@login_required
def create_bracket():
    if request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        picks = data.get('picks')

        if not name:
            return jsonify({'success': False, 'message': 'Please enter a bracket name'})

        if not picks:
            return jsonify({'success': False, 'message': 'Please make your picks'})

        bracket = Bracket(
            user_id=current_user.id,
            name=name,
            picks=json.dumps(picks)
        )
        db.session.add(bracket)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Bracket created successfully!'})

    return render_template('create_bracket.html')

@app.route('/leaderboard')
def leaderboard():
    brackets = Bracket.query.order_by(Bracket.score.desc()).all()
    return render_template('leaderboard.html', brackets=brackets)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True) 