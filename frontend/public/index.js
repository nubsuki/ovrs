
document.addEventListener('DOMContentLoaded', () => {
    const sessionToken = localStorage.getItem('sessionToken');

    if (!sessionToken) {
        window.location.href = 'login.html'; // Redirect to login if no session token
        return;
    }

    fetch(`http://localhost:8080/api/auth/validate-session?sessionToken=${sessionToken}`)
        .then(response => response.json())
        .then(data => {
            if (data.message !== 'Session valid') {
                localStorage.removeItem('sessionToken'); // Clear invalid session token
                window.location.href = 'login.html'; // Redirect to login
            } else {
                console.log('User:', data.username, 'Role:', data.role);
                // Update the UI with the user's details
            }
        })
        .catch(error => console.error('Error:', error));
});

function logout() {
    const sessionToken = localStorage.getItem('sessionToken');

    fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            localStorage.removeItem('sessionToken'); // Clear the session token
            window.location.href = 'login.html'; // Redirect to the login page
        })
        .catch(error => console.error('Error:', error));
}