# NBA Playoffs Bracket Challenge 2025

A web application where users can create and compete with their NBA Playoffs brackets for the 2025 season. Create your perfect bracket, compete with friends, and track your progress throughout the playoffs!

## Features

- User registration and authentication
- Interactive bracket creation interface
- Real-time bracket updates
- Leaderboard system
- Personal dashboard with performance tracking
- Mobile-responsive design

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nba-bracket-challenge
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install the required packages:
```bash
pip install -r requirements.txt
```

4. Set up the database:
```bash
python app.py
```

## Running the Application

1. Activate the virtual environment (if not already activated):
```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Run the Flask application:
```bash
python app.py
```

3. Open your web browser and navigate to:
```
http://localhost:5000
```

## Project Structure

```
nba-bracket-challenge/
├── app.py              # Main application file
├── requirements.txt    # Python dependencies
├── templates/         # HTML templates
│   ├── base.html      # Base template
│   ├── index.html     # Home page
│   ├── login.html     # Login page
│   ├── register.html  # Registration page
│   ├── dashboard.html # User dashboard
│   ├── create_bracket.html # Bracket creation interface
│   └── leaderboard.html   # Global leaderboard
└── README.md          # Project documentation
```

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- NBA and its logos are trademarks of the National Basketball Association
- Flask web framework
- Bootstrap for the frontend design
- Font Awesome for icons 