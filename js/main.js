document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initApp();
    
    // Set up navigation
    setupNavigation();
    
    // Load the default page (home)
    loadPage('home');
});

function initApp() {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (user) {
        showUserNav(JSON.parse(user));
    } else {
        showGuestNav();
    }
}

function setupNavigation() {
    // Handle navigation links
    document.addEventListener('click', function(e) {
        // Page navigation
        if (e.target.closest('[data-page]')) {
            e.preventDefault();
            const pageLink = e.target.closest('[data-page]');
            loadPage(pageLink.dataset.page);
        }
        
        // Logout button
        if (e.target.closest('#logoutButton')) {
            e.preventDefault();
            logout();
        }
    });
    
    // Form submissions
    document.addEventListener('submit', function(e) {
        // Login form
        if (e.target.id === 'loginForm') {
            e.preventDefault();
            handleLogin();
        }
        
        // Register form
        if (e.target.id === 'registerForm') {
            e.preventDefault();
            handleRegister();
        }
    });

    // Manual button handlers
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            handleLogin();
        });
    }

    const registerButton = document.getElementById('registerButton');
    if (registerButton) {
        registerButton.addEventListener('click', function() {
            handleRegister();
        });
    }
}

function loadPage(page) {
    const contentArea = document.getElementById('content');
    if (!contentArea) {
        console.error("Content area not found");
        return;
    }

    // Clear loading indicator if present
    const loadingIndicator = document.getElementById('loading');
    if (loadingIndicator) {
        loadingIndicator.classList.add('d-none');
    }
    
    // Set active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });
    
    // Instead of using templates, we'll dynamically create the content
    contentArea.innerHTML = '';
    
    if (page === 'home') {
        contentArea.innerHTML = createHomePage();
    } else if (page === 'create_bracket') {
        contentArea.innerHTML = createBracketPage();
        
        // Initialize new bracket
        setTimeout(() => {
            const bracketContainer = document.getElementById('bracket-container');
            if (bracketContainer) {
                window.bracketInstance = new Bracket('bracket-container', {
                    bracketName: "My NBA Playoffs Bracket 2025"
                });
            } else {
                console.error("Bracket container not found");
            }
        }, 100);
    } else if (page === 'dashboard') {
        contentArea.innerHTML = createDashboardPage();
        initDashboard();
    } else if (page === 'leaderboard') {
        contentArea.innerHTML = createLeaderboardPage();
        initLeaderboard();
    } else {
        contentArea.innerHTML = '<div class="alert alert-warning">Page not found</div>';
    }
}

function createHomePage() {
    return `
        <div class="jumbotron bg-light p-5 rounded shadow">
            <h1 class="display-4">NBA Playoffs Bracket Challenge</h1>
            <p class="lead">Create your perfect NBA playoffs bracket and compete with friends!</p>
            <hr class="my-4">
            <p>Test your NBA knowledge and prediction skills by creating your own playoff bracket for the 2025 NBA Playoffs.</p>
            <a class="btn btn-primary btn-lg" href="#" role="button" data-page="create_bracket">Create Your Bracket</a>
        </div>

        <div class="row mt-5">
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title"><i class="fas fa-trophy"></i> Compete</h5>
                        <p class="card-text">Create your bracket and compete with friends and basketball fans worldwide.</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title"><i class="fas fa-chart-line"></i> Track</h5>
                        <p class="card-text">Track your progress as the real NBA playoffs unfold and see how your predictions stack up.</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title"><i class="fas fa-share-alt"></i> Share</h5>
                        <p class="card-text">Share your bracket with friends on social media and see who made the best picks.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createBracketPage() {
    return `
        <h2>Create Your Playoff Bracket</h2>
        <p class="lead">Fill out your predictions for the 2025 NBA Playoffs bracket</p>
        
        <div id="bracket-container" class="my-4">
            <!-- Bracket will be generated here -->
        </div>
    `;
}

function createDashboardPage() {
    return `
        <h2>My Dashboard</h2>
        <div class="row">
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">My Brackets</h5>
                        <p class="card-text">You have <span id="bracket-count" class="fw-bold">1</span> saved bracket(s).</p>
                        <a href="#" class="btn btn-primary" data-page="create_bracket">View Bracket</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">My Score</h5>
                        <p class="card-text">Current score: <span id="user-score" class="fw-bold">0</span> points</p>
                        <p>Ranking: <span id="user-rank" class="fw-bold">-</span></p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Account Info</h5>
                        <p class="card-text">Username: <span id="account-username" class="fw-bold">User</span></p>
                        <p>Email: <span id="account-email" class="fw-bold">user@example.com</span></p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createLeaderboardPage() {
    return `
        <h2>Leaderboard</h2>
        <p class="lead">See how your bracket stacks up against others</p>
        
        <div class="card mb-4">
            <div class="card-body">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Rank</th>
                            <th scope="col">Username</th>
                            <th scope="col">Bracket Name</th>
                            <th scope="col">Score</th>
                            <th scope="col">Last Updated</th>
                        </tr>
                    </thead>
                    <tbody id="leaderboard-table">
                        <!-- Leaderboard data will be populated here -->
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function initDashboard() {
    // Get user data
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Update user info
    const accountUsername = document.getElementById('account-username');
    const accountEmail = document.getElementById('account-email');
    
    if (accountUsername) accountUsername.textContent = user.username || 'Guest';
    if (accountEmail) accountEmail.textContent = user.email || 'Not signed in';
    
    // Check if user has brackets
    const brackets = localStorage.getItem('nba_bracket');
    const bracketCount = document.getElementById('bracket-count');
    if (bracketCount) {
        bracketCount.textContent = brackets ? '1' : '0';
    }
    
    // Simulate score and rank (in a real app, these would come from a server)
    const userScore = document.getElementById('user-score');
    const userRank = document.getElementById('user-rank');
    
    if (userScore) userScore.textContent = Math.floor(Math.random() * 100);
    if (userRank) userRank.textContent = Math.floor(Math.random() * 50) + 1;
}

function initLeaderboard() {
    // In a real application, this would fetch leaderboard data from a server
    // For now, we'll generate some sample data
    const leaderboardTable = document.getElementById('leaderboard-table');
    if (!leaderboardTable) return;
    
    leaderboardTable.innerHTML = '';
    
    // Sample leaderboard data
    const sampleData = [
        {rank: 1, username: 'basketball_guru', bracketName: 'Champion Picks', score: 98, updated: '2025-04-16'},
        {rank: 2, username: 'nba_fan123', bracketName: 'My Perfect Bracket', score: 92, updated: '2025-04-15'},
        {rank: 3, username: 'hoops_expert', bracketName: 'Playoff Masters', score: 87, updated: '2025-04-15'},
        {rank: 4, username: 'courtside_view', bracketName: 'NBA Finals 2025', score: 85, updated: '2025-04-16'},
        {rank: 5, username: 'threepointer', bracketName: 'Championship Run', score: 81, updated: '2025-04-14'}
    ];
    
    // Add current user if logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const bracket = JSON.parse(localStorage.getItem('nba_bracket') || '{}');
    
    if (user.username && bracket.name) {
        const userScore = Math.floor(Math.random() * 100);
        const userRank = Math.floor(Math.random() * 10) + 1;
        
        // Check if we should insert the user's data
        let inserted = false;
        
        for (let i = 0; i < sampleData.length; i++) {
            if (sampleData[i].rank === userRank) {
                // Insert at this position
                sampleData.splice(i, 0, {
                    rank: userRank,
                    username: user.username + ' (You)',
                    bracketName: bracket.name,
                    score: userScore,
                    updated: new Date().toISOString().split('T')[0]
                });
                inserted = true;
                break;
            }
        }
        
        if (!inserted) {
            sampleData.push({
                rank: sampleData.length + 1,
                username: user.username + ' (You)',
                bracketName: bracket.name,
                score: userScore,
                updated: new Date().toISOString().split('T')[0]
            });
        }
    }
    
    // Sort by rank
    sampleData.sort((a, b) => a.rank - b.rank);
    
    // Populate table
    sampleData.forEach(entry => {
        const row = document.createElement('tr');
        
        if (entry.username.includes('(You)')) {
            row.classList.add('table-primary');
        }
        
        row.innerHTML = `
            <td>${entry.rank}</td>
            <td>${entry.username}</td>
            <td>${entry.bracketName}</td>
            <td>${entry.score}</td>
            <td>${entry.updated}</td>
        `;
        
        leaderboardTable.appendChild(row);
    });
}

function showFlashMessage(message, type = 'info') {
    const flashContainer = document.getElementById('flash-container');
    if (!flashContainer) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show flash-message`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    flashContainer.appendChild(alert);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

function showUserNav(user) {
    // Hide login/register links
    const loginNavItem = document.getElementById('login-nav-item');
    const registerNavItem = document.getElementById('register-nav-item');
    const logoutNavItem = document.getElementById('logout-nav-item');
    const profileNavItem = document.getElementById('profile-nav-item');
    
    if (loginNavItem) loginNavItem.classList.add('d-none');
    if (registerNavItem) registerNavItem.classList.add('d-none');
    
    // Show user nav items
    if (logoutNavItem) logoutNavItem.classList.remove('d-none');
    if (profileNavItem) {
        profileNavItem.classList.remove('d-none');
        const profileLink = profileNavItem.querySelector('a');
        if (profileLink) {
            profileLink.innerHTML = `<i class="fas fa-user-circle"></i> ${user.username}`;
        }
    }
}

function showGuestNav() {
    // Show login/register links
    const loginNavItem = document.getElementById('login-nav-item');
    const registerNavItem = document.getElementById('register-nav-item');
    const logoutNavItem = document.getElementById('logout-nav-item');
    const profileNavItem = document.getElementById('profile-nav-item');
    
    if (loginNavItem) loginNavItem.classList.remove('d-none');
    if (registerNavItem) registerNavItem.classList.remove('d-none');
    
    // Hide user nav items
    if (logoutNavItem) logoutNavItem.classList.add('d-none');
    if (profileNavItem) profileNavItem.classList.add('d-none');
}

function handleLogin() {
    const username = document.getElementById('loginUsername')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!username || !password) {
        showFlashMessage('Please enter both username and password', 'danger');
        return;
    }
    
    // In a real app, this would call an API
    // For now, we'll simulate a successful login
    const user = {
        id: 1,
        username: username,
        email: `${username}@example.com`
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    showUserNav(user);
    
    // Close modal if open
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    if (loginModal) loginModal.hide();
    
    showFlashMessage(`Welcome back, ${username}!`, 'success');
    loadPage('dashboard');
}

function handleRegister() {
    const username = document.getElementById('registerUsername')?.value;
    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;
    const confirmPassword = document.getElementById('registerPasswordConfirm')?.value;
    
    if (!username || !email || !password || !confirmPassword) {
        showFlashMessage('Please fill out all fields', 'danger');
        return;
    }
    
    if (password !== confirmPassword) {
        showFlashMessage('Passwords do not match', 'danger');
        return;
    }
    
    // In a real app, this would call an API
    // For now, we'll simulate a successful registration
    const user = {
        id: 1,
        username: username,
        email: email
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    showUserNav(user);
    
    // Close modal if open
    const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    if (registerModal) registerModal.hide();
    
    showFlashMessage(`Welcome, ${username}! Your account has been created.`, 'success');
    loadPage('dashboard');
}

function logout() {
    localStorage.removeItem('user');
    showGuestNav();
    showFlashMessage('You have been logged out', 'info');
    loadPage('home');
} 