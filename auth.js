document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Hardcoded credentials (replace with database check in real app)
    const validUsers = [
        { username: "admin", password: "admin123", role: "librarian" },
        { username: "user", password: "user123", role: "member" }
    ];
    
    const user = validUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Save user session (in real app, use JWT/localStorage securely)
        sessionStorage.setItem('loggedIn', 'true');
        sessionStorage.setItem('userRole', user.role);
        
        // Redirect to main page
        window.location.href = "index.html";
    } else {
        document.getElementById('error-msg').textContent = "Invalid username or password!";
    }
});
