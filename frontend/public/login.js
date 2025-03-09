document.querySelector('.img__btn').addEventListener('click', function() {
    document.querySelector('.cont').classList.toggle('s--signup');
});

// Register Function
function register() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

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
        body: JSON.stringify({ username: usernameOrEmail, password })
    })
        .then(response => response.json())
        .then(data => {
            const messageElement = document.getElementById('login-message');
            messageElement.innerText = data.message;
            messageElement.style.color = data.message === 'Login successful!' ? 'green' : 'red';

            if (data.message === 'Login Successful') {
                // Store the session token in localStorage
                localStorage.setItem('sessionToken', data.sessionToken);
                console.log('Session Token:', data.sessionToken);

                // Redirect to a protected page or update the UI
                window.location.href = 'index.html'; // Example redirect
            }

        })
        .catch(error => console.error('Error:', error));
}