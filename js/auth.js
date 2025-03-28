// Handle login submission
function handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    // In a real app, this would send a request to a server
    // For static demo purposes, we'll use localStorage
    
    // Check if user exists (simplified)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Store logged in user
        localStorage.setItem('user', JSON.stringify({
            username: user.username,
            email: user.email
        }));
        
        // Close login modal
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        loginModal.hide();
        
        // Update navigation
        showUserNav(user);
        
        // Show success message
        showFlashMessage(`Welcome back, ${username}!`, 'success');
        
        // Load dashboard
        loadPage('dashboard');
    } else {
        showFlashMessage('Invalid username or password', 'danger');
    }
}

// Handle register submission
function handleRegister() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validate form
    if (password !== confirmPassword) {
        showFlashMessage('Passwords do not match', 'danger');
        return;
    }
    
    if (password.length < 8) {
        showFlashMessage('Password must be at least 8 characters long', 'danger');
        return;
    }
    
    // In a real app, this would send a request to a server
    // For static demo purposes, we'll use localStorage
    
    // Check if username already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(u => u.username === username)) {
        showFlashMessage('Username already exists', 'danger');
        return;
    }
    
    // Add new user
    users.push({
        username,
        email,
        password // Note: In a real app, never store plain text passwords!
    });
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Store logged in user
    localStorage.setItem('user', JSON.stringify({
        username,
        email
    }));
    
    // Close register modal
    const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    registerModal.hide();
    
    // Update navigation
    showUserNav({username, email});
    
    // Show success message
    showFlashMessage('Registration successful! Welcome to NBA Playoffs Bracket Challenge', 'success');
    
    // Load dashboard
    loadPage('dashboard');
}

// Handle logout
function logout() {
    // Remove user from localStorage
    localStorage.removeItem('user');
    
    // Update navigation
    showGuestNav();
    
    // Show message
    showFlashMessage('You have been logged out', 'info');
    
    // Redirect to home
    loadPage('home');
} 