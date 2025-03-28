// User management
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        updateNavigation();
        showDashboard();
    } else {
        showHome();
    }

    // Set up form event listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
});

// Navigation functions
function showHome() {
    const content = `
        <div class="row align-items-center min-vh-75">
            <div class="col-md-6">
                <h1 class="display-4 fw-bold mb-4">NBA Playoffs Bracket Challenge 2025</h1>
                <p class="lead mb-4">Create your perfect bracket, compete with friends, and see who can predict the NBA Playoffs the best!</p>
                ${!currentUser ? `
                    <div class="d-grid gap-2 d-md-flex justify-content-md-start">
                        <button class="btn btn-primary btn-lg px-4 me-md-2" onclick="showRegisterModal()">Get Started</button>
                        <button class="btn btn-outline-primary btn-lg px-4" onclick="showLoginModal()">Login</button>
                    </div>
                ` : `
                    <div class="d-grid gap-2 d-md-flex justify-content-md-start">
                        <button class="btn btn-primary btn-lg px-4 me-md-2" onclick="showCreateBracket()">Create Bracket</button>
                        <button class="btn btn-outline-primary btn-lg px-4" onclick="showDashboard()">View Dashboard</button>
                    </div>
                `}
            </div>
            <div class="col-md-6">
                <div class="card bg-light">
                    <div class="card-body p-4">
                        <h3 class="card-title mb-4">How It Works</h3>
                        <div class="d-flex mb-3">
                            <div class="flex-shrink-0">
                                <i class="fas fa-user-plus fa-2x text-primary"></i>
                            </div>
                            <div class="flex-grow-1 ms-3">
                                <h5>1. Create an Account</h5>
                                <p class="mb-0">Sign up for free and join the competition</p>
                            </div>
                        </div>
                        <div class="d-flex mb-3">
                            <div class="flex-shrink-0">
                                <i class="fas fa-bracket-curly fa-2x text-primary"></i>
                            </div>
                            <div class="flex-grow-1 ms-3">
                                <h5>2. Create Your Bracket</h5>
                                <p class="mb-0">Fill out your predictions for the 2025 NBA Playoffs</p>
                            </div>
                        </div>
                        <div class="d-flex mb-3">
                            <div class="flex-shrink-0">
                                <i class="fas fa-trophy fa-2x text-primary"></i>
                            </div>
                            <div class="flex-grow-1 ms-3">
                                <h5>3. Compete & Win</h5>
                                <p class="mb-0">Track your progress and compete for the top spot</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;
}

function showDashboard() {
    if (!currentUser) {
        showLoginModal();
        return;
    }

    const brackets = JSON.parse(localStorage.getItem('brackets') || '[]')
        .filter(bracket => bracket.userId === currentUser.id);

    const content = `
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>My Brackets</h2>
                    <button class="btn btn-primary" onclick="showCreateBracket()">
                        <i class="fas fa-plus me-2"></i>Create New Bracket
                    </button>
                </div>

                ${brackets.length > 0 ? `
                    <div class="row">
                        ${brackets.map(bracket => `
                            <div class="col-md-6 col-lg-4 mb-4">
                                <div class="card h-100">
                                    <div class="card-body">
                                        <h5 class="card-title">${bracket.name}</h5>
                                        <p class="card-text">
                                            <small class="text-muted">
                                                Created: ${new Date(bracket.createdAt).toLocaleDateString()}
                                            </small>
                                        </p>
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div>
                                                <span class="badge bg-primary">Score: ${bracket.score.toFixed(1)}</span>
                                            </div>
                                            <div>
                                                <button class="btn btn-outline-primary btn-sm" onclick="viewBracket('${bracket.id}')">View Details</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="text-center py-5">
                        <i class="fas fa-bracket-curly fa-3x text-muted mb-3"></i>
                        <h3>No Brackets Yet</h3>
                        <p class="text-muted">Create your first bracket to start competing!</p>
                        <button class="btn btn-primary" onclick="showCreateBracket()">
                            <i class="fas fa-plus me-2"></i>Create Your First Bracket
                        </button>
                    </div>
                `}
            </div>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;
}

function showCreateBracket() {
    if (!currentUser) {
        showLoginModal();
        return;
    }

    const content = `
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Create Your Bracket</h2>
                    <button class="btn btn-primary" onclick="saveBracket()">
                        <i class="fas fa-save me-2"></i>Save Bracket
                    </button>
                </div>

                <div class="card mb-4">
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="bracketName" class="form-label">Bracket Name</label>
                            <input type="text" class="form-control" id="bracketName" placeholder="Enter a name for your bracket">
                        </div>
                    </div>
                </div>

                <div class="bracket-container">
                    <div class="row">
                        <!-- First Round -->
                        <div class="col-md-3">
                            <div class="round-container">
                                <h4 class="text-center mb-3">First Round</h4>
                                <div class="matchups">
                                    ${Array(8).fill().map((_, i) => `
                                        <div class="matchup mb-3">
                                            <div class="team-select">
                                                <select class="form-select team-select" data-round="1" data-matchup="${i}">
                                                    <option value="">Select Team</option>
                                                    ${getTeamOptions()}
                                                </select>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Second Round -->
                        <div class="col-md-3">
                            <div class="round-container">
                                <h4 class="text-center mb-3">Second Round</h4>
                                <div class="matchups">
                                    ${Array(4).fill().map((_, i) => `
                                        <div class="matchup mb-3">
                                            <div class="team-select">
                                                <select class="form-select team-select" data-round="2" data-matchup="${i}">
                                                    <option value="">Select Team</option>
                                                </select>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Conference Finals -->
                        <div class="col-md-3">
                            <div class="round-container">
                                <h4 class="text-center mb-3">Conference Finals</h4>
                                <div class="matchups">
                                    ${Array(2).fill().map((_, i) => `
                                        <div class="matchup mb-3">
                                            <div class="team-select">
                                                <select class="form-select team-select" data-round="3" data-matchup="${i}">
                                                    <option value="">Select Team</option>
                                                </select>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- NBA Finals -->
                        <div class="col-md-3">
                            <div class="round-container">
                                <h4 class="text-center mb-3">NBA Finals</h4>
                                <div class="matchups">
                                    <div class="matchup mb-3">
                                        <div class="team-select">
                                            <select class="form-select team-select" data-round="4" data-matchup="0">
                                                <option value="">Select Team</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;
    setupBracketHandlers();
}

function showLeaderboard() {
    const brackets = JSON.parse(localStorage.getItem('brackets') || '[]')
        .sort((a, b) => b.score - a.score);

    const content = `
        <div class="row">
            <div class="col-12">
                <h2 class="mb-4">Leaderboard</h2>

                <div class="card">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>User</th>
                                        <th>Bracket Name</th>
                                        <th>Score</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${brackets.map((bracket, index) => `
                                        <tr>
                                            <td>
                                                <span class="badge bg-primary">${index + 1}</span>
                                            </td>
                                            <td>${bracket.username}</td>
                                            <td>${bracket.name}</td>
                                            <td>
                                                <span class="badge bg-success">${bracket.score.toFixed(1)}</span>
                                            </td>
                                            <td>${new Date(bracket.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button class="btn btn-sm btn-outline-primary" onclick="viewBracket('${bracket.id}')">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;
}

// Modal functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Form handlers
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        currentUser = { id: user.id, username: user.username };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        closeModal('loginModal');
        updateNavigation();
        showDashboard();
        showFlashMessage('Welcome back!', 'success');
    } else {
        showFlashMessage('Invalid username or password', 'danger');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    // Validate username
    if (username.length < 3) {
        showFlashMessage('Username must be at least 3 characters long', 'danger');
        return;
    }

    // Validate email
    if (!validateEmail(email)) {
        showFlashMessage('Please enter a valid email address', 'danger');
        return;
    }

    // Validate password
    if (!validatePassword(password)) {
        showFlashMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number', 'danger');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.some(u => u.username === username)) {
        showFlashMessage('Username already exists', 'danger');
        return;
    }

    if (users.some(u => u.email === email)) {
        showFlashMessage('Email already registered', 'danger');
        return;
    }

    const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    closeModal('registerModal');
    showFlashMessage('Registration successful! Please login.', 'success');
    showLoginModal();
}

// Bracket functions
function setupBracketHandlers() {
    const teamSelects = document.querySelectorAll('.team-select');
    teamSelects.forEach(select => {
        select.addEventListener('change', function() {
            const currentRound = parseInt(this.dataset.round);
            const currentMatchup = parseInt(this.dataset.matchup);
            const selectedTeam = this.value;

            if (currentRound < 4) {
                const nextRound = currentRound + 1;
                const nextMatchup = Math.floor(currentMatchup / 2);
                const nextSelect = document.querySelector(`.team-select[data-round="${nextRound}"][data-matchup="${nextMatchup}"]`);
                
                if (nextSelect) {
                    while (nextSelect.options.length > 1) {
                        nextSelect.remove(1);
                    }
                    
                    if (selectedTeam) {
                        const option = document.createElement('option');
                        option.value = selectedTeam;
                        option.textContent = selectedTeam;
                        nextSelect.appendChild(option);
                    }
                }
            }
        });
    });
}

function saveBracket() {
    const name = document.getElementById('bracketName').value.trim();
    if (!name) {
        showFlashMessage('Please enter a name for your bracket', 'danger');
        return;
    }

    const picks = {};
    const teamSelects = document.querySelectorAll('.team-select');
    teamSelects.forEach(select => {
        picks[`round${select.dataset.round}_matchup${select.dataset.matchup}`] = select.value;
    });

    if (!Object.values(picks).every(pick => pick)) {
        showFlashMessage('Please complete all matchups', 'danger');
        return;
    }

    const brackets = JSON.parse(localStorage.getItem('brackets') || '[]');
    const newBracket = {
        id: Date.now().toString(),
        userId: currentUser.id,
        username: currentUser.username,
        name,
        picks,
        score: 0,
        createdAt: new Date().toISOString()
    };

    brackets.push(newBracket);
    localStorage.setItem('brackets', JSON.stringify(brackets));
    showFlashMessage('Bracket saved successfully!', 'success');
    showDashboard();
}

function viewBracket(bracketId) {
    const brackets = JSON.parse(localStorage.getItem('brackets') || '[]');
    const bracket = brackets.find(b => b.id === bracketId);
    
    if (!bracket) {
        showFlashMessage('Bracket not found', 'danger');
        return;
    }

    const content = `
        <div class="row">
            <div class="col-12">
                <h2 class="mb-4">${bracket.name}</h2>
                <div class="card">
                    <div class="card-body">
                        <div class="bracket-view">
                            ${Object.entries(bracket.picks).map(([key, value]) => `
                                <div class="mb-3">
                                    <strong>${key}:</strong> ${value}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;
}

// Utility functions
function updateNavigation() {
    const isLoggedIn = !!currentUser;
    document.getElementById('dashboardNav').style.display = isLoggedIn ? 'block' : 'none';
    document.getElementById('createBracketNav').style.display = isLoggedIn ? 'block' : 'none';
    document.getElementById('leaderboardNav').style.display = isLoggedIn ? 'block' : 'none';
    document.getElementById('logoutNav').style.display = isLoggedIn ? 'block' : 'none';
    document.getElementById('loginNav').style.display = isLoggedIn ? 'none' : 'block';
    document.getElementById('registerNav').style.display = isLoggedIn ? 'none' : 'block';
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateNavigation();
    showHome();
    showFlashMessage('You have been logged out', 'info');
}

function showFlashMessage(message, type) {
    const flashMessages = document.getElementById('flashMessages');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    flashMessages.appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
}

function validateEmail(email) {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
}

function validatePassword(password) {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /\d/.test(password);
}

function getTeamOptions() {
    const teams = [
        "Boston Celtics", "Brooklyn Nets", "New York Knicks", "Philadelphia 76ers",
        "Toronto Raptors", "Chicago Bulls", "Cleveland Cavaliers", "Detroit Pistons",
        "Indiana Pacers", "Milwaukee Bucks", "Atlanta Hawks", "Charlotte Hornets",
        "Miami Heat", "Orlando Magic", "Washington Wizards", "Denver Nuggets",
        "Minnesota Timberwolves", "Oklahoma City Thunder", "Portland Trail Blazers",
        "Utah Jazz", "Golden State Warriors", "LA Clippers", "Los Angeles Lakers",
        "Phoenix Suns", "Sacramento Kings", "Dallas Mavericks", "Houston Rockets",
        "Memphis Grizzlies", "New Orleans Pelicans", "San Antonio Spurs"
    ];
    return teams.map(team => `<option value="${team}">${team}</option>`).join('');
} 