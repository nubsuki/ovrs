document.querySelector('.img__btn').addEventListener('click', function() {
    document.querySelector('.cont').classList.toggle('s--signup');
});

// Register Function
function register() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    // Validate required fields
    const requiredFields = {
        'Username': document.getElementById('reg-username').value,
        'Email': document.getElementById('reg-email').value,
        'Password': document.getElementById('reg-password').value,
    };

    // Check all required fields first
    let isValid = true;
    for (const [field, value] of Object.entries(requiredFields)) {
        if (!value || value.trim() === '') {
            alert(`Please enter ${field}`);
            isValid = false;
            return;
        }
    }

    fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    })
        .then(response => response.json())
        .then(data => {
            const messageElement = document.getElementById('register-message');
            messageElement.innerText = data.message;
            messageElement.style.color = data.message === 'User registered successfully' ? 'green' : 'red';

            if (data.message === 'User registered successfully') {
                // Clear registration fields
                document.getElementById('reg-username').value = '';
                document.getElementById('reg-email').value = '';
                document.getElementById('reg-password').value = '';
                
                // Switch to login page
                document.querySelector('.cont').classList.remove('s--signup');
            }
        })
        .catch(error => console.error('Error:', error));
}

// Login Function
function login() {
    const usernameOrEmail = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({ username: usernameOrEmail, password })
    })
        .then(response => response.json())
        .then(data => {
            const messageElement = document.getElementById('login-message');
            messageElement.innerText = data.message;
            messageElement.style.color = data.message === 'Login Successful' ? 'green' : 'red';

            if (data.message === 'Login Successful') {
                window.location.href = 'index.html';
            }
        })
        .catch(error => console.error('Error:', error));
}