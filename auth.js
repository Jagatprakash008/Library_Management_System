// For GUVI - auth.js

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const enteredUsername = document.getElementById('username').value;
    const enteredPassword = document.getElementById('password').value;

    const storedUser = JSON.parse(localStorage.getItem('user')); // Single user object

    const errorMsg = document.getElementById('error-msg');

    if (storedUser &&
        enteredUsername === storedUser.username &&
        enteredPassword === storedUser.password) {
        // Login successful
        errorMsg.style.color = 'green';
        errorMsg.textContent = 'Login successful!';
        window.location.href = 'dashboard.html'; // Redirect to home/dashboard
    } else {
        // Login failed
        errorMsg.style.color = 'red';
        errorMsg.textContent = 'Invalid username or password';
    }
});
