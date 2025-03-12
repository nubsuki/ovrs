// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    fetchBookings();
    setupOrderSearch();
    fetchCancelledBookings();
});

function logout() {
    fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        credentials: 'include' // Include cookies in the request
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            window.location.href = 'login.html'; // Redirect to the login page
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Logout failed. Please try again.');
        });
}

// Validate session and check if user is admin
document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:8080/api/auth/validate-session', {
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Session valid') {
                if (data.role !== 'ADMIN') {
                    window.location.href = 'index.html'; // Redirect non-admin users
                }
            } else {
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.href = 'login.html';
        });
});

function searchUser() {
    const email = document.getElementById('userEmail').value;
    const searchResult = document.getElementById('searchResult');
    const roleUpdateForm = document.getElementById('roleUpdateForm');
    const roleSelect = document.getElementById('roleSelect');
    const messageElement = document.getElementById('updateMessage');

    if (!email) {
        messageElement.textContent = 'Please enter an email address';
        messageElement.style.color = 'red';
        return;
    }

    fetch('http://localhost:8080/api/auth/search-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            email: email
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'User found') {
            document.getElementById('resultUsername').textContent = data.username;
            document.getElementById('resultEmail').textContent = data.email;
            document.getElementById('resultRole').textContent = data.role;

            // Clear existing options
            roleSelect.innerHTML = '';
            
            if (data.availableRoles && Array.isArray(data.availableRoles)) {
                data.availableRoles.forEach(role => {
                    const option = document.createElement('option');
                    option.value = role;
                    option.textContent = role;
                    roleSelect.appendChild(option);
                });
            }
            
            searchResult.style.display = 'block';
            roleUpdateForm.style.display = 'block';
            messageElement.textContent = '';
        } else {
            messageElement.textContent = 'User not found';
            messageElement.style.color = 'red';
            searchResult.style.display = 'none';
            roleUpdateForm.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        messageElement.textContent = 'An error occurred while searching for the user';
        messageElement.style.color = 'red';
        searchResult.style.display = 'none';
        roleUpdateForm.style.display = 'none';
    });
}

function updateUserRole() {
    const email = document.getElementById('userEmail').value;
    const role = document.getElementById('roleSelect').value;
    const messageElement = document.getElementById('updateMessage');

    if (!email) {
        messageElement.textContent = 'Please enter an email address';
        messageElement.style.color = 'red';
        return;
    }

    fetch('http://localhost:8080/api/auth/update-role', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            email: email,
            role: role
        })
    })
        .then(response => response.json())
        .then(data => {
            messageElement.textContent = data.message;
            messageElement.style.color = data.message.includes('successfully') ? 'green' : 'red';
            if (data.message.includes('successfully')) {
                document.getElementById('userEmail').value = '';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            messageElement.textContent = 'An error occurred while updating the role';
            messageElement.style.color = 'red';
        });
}

let searchTimeout;

function handleEmailSearch(event) {
    const searchTerm = event.target.value;
    const suggestionsDiv = document.getElementById('emailSuggestions');
    
    clearTimeout(searchTimeout);
    
    if (searchTerm.length < 2) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    searchTimeout = setTimeout(() => {
        fetch('http://localhost:8080/api/auth/search-emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                searchTerm: searchTerm
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.users && data.users.length > 0) {
                suggestionsDiv.innerHTML = '';
                data.users.forEach(user => {
                    const div = document.createElement('div');
                    div.className = 'suggestion-item';
                    const highlightedEmail = highlightMatch(user.email, searchTerm);
                    div.innerHTML = `
                        <div class="email">${highlightedEmail}</div>
                        <div class="username">${user.username}</div>
                    `;
                    div.onclick = () => selectEmail(user.email);
                    suggestionsDiv.appendChild(div);
                });
                suggestionsDiv.style.display = 'block';
            } else {
                suggestionsDiv.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            suggestionsDiv.style.display = 'none';
        });
    }, 300);
}

function highlightMatch(text, searchTerm) {
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function selectEmail(email) {
    document.getElementById('userEmail').value = email;
    document.getElementById('emailSuggestions').style.display = 'none';
    searchUser();
}

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    const suggestionsDiv = document.getElementById('emailSuggestions');
    const searchInput = document.getElementById('userEmail');
    if (!suggestionsDiv.contains(e.target) && e.target !== searchInput) {
        suggestionsDiv.style.display = 'none';
    }
});

function deleteUser() {
    const email = document.getElementById('resultEmail').textContent;
    
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        fetch('http://localhost:8080/api/auth/delete-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                email: email
            })
        })
        .then(response => response.json())
        .then(data => {
            const messageElement = document.getElementById('updateMessage');
            messageElement.textContent = data.message;
            messageElement.style.color = data.message.includes('successfully') ? 'green' : 'red';
            
            if (data.message.includes('successfully')) {
                document.getElementById('searchResult').style.display = 'none';
                document.getElementById('roleUpdateForm').style.display = 'none';
                document.getElementById('userEmail').value = '';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const messageElement = document.getElementById('updateMessage');
            messageElement.textContent = 'An error occurred while deleting the user';
            messageElement.style.color = 'red';
        });
    }
}

function setupOrderSearch() {
    const searchInput = document.getElementById('orderSearchInput');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.getElementById('bookingTableBody').getElementsByTagName('tr');
        
        for (let row of rows) {
            const orderIdCell = row.cells[0];
            const orderId = orderIdCell.textContent.toLowerCase();
            
            if (orderId.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

function fetchBookings() {
    fetch('http://localhost:8080/api/bookings/all', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Booking data:', data);
        const tableBody = document.getElementById('bookingTableBody');
        tableBody.innerHTML = ''; // Clear existing rows

        data.bookings.forEach(booking => {
            const row = document.createElement('tr');
            
            // Format date
            const bookingDate = new Date(booking.bookingDate).toLocaleDateString();
            
            row.innerHTML = `
                <td data-th="Booking ID">${booking.orderId}</td>
                <td data-th="Booking Date">${bookingDate}</td>
                <td data-th="Customer Name">${booking.customerName}</td>
                <td data-th="Email">${booking.userEmail || booking.email || 'N/A'}</td>
                <td data-th="Distance">${booking.distance} km</td>
                <td data-th="Time">${booking.time} hr</td>
                <td data-th="Phone Number">${booking.phoneNumber}</td>
                <td data-th="Pickup Location">${booking.pickupLocation}</td>
                <td data-th="Pickup Time">${booking.pickupTime}</td>
                <td data-th="Vehicle">${booking.vehicleName}</td>
                <td data-th="Total Cost">$${booking.totalCost}</td>
                <td data-th="cancel">
                    <button onclick="cancelBooking('${booking.orderId}')" class="cancel-btn">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error fetching bookings:', error);
    });
}

function cancelBooking(orderId) {
    // First check if user is admin
    fetch('http://localhost:8080/api/auth/validate-session', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        const isAdmin = data.role === 'ADMIN';
        let confirmMessage = 'Are you sure you want to cancel this booking?';
        let endpoint = `/api/bookings/cancel/${orderId}`;

        if (isAdmin) {
            confirmMessage = 'Are you sure you want to cancel this booking? (Admin action)';
            endpoint = `/api/bookings/admin/cancel/${orderId}`;
        }

        if (confirm(confirmMessage)) {
            fetch(`http://localhost:8080${endpoint}`, {
                method: 'POST',
                credentials: 'include'
            })
            .then(async response => {
                const text = await response.text();
                try {
                    return JSON.parse(text);
                } catch (e) {
                    throw new Error(text);
                }
            })
            .then(data => {
                alert('Booking cancelled successfully');
                fetchBookings();
            })
            .catch(error => {
                console.error('Error:', error);
                alert(error.message || 'An error occurred while cancelling the booking');
            });
        }
    })
    .catch(error => {
        console.error('Error checking user role:', error);
        alert('Error checking user permissions');
    });
}

function fetchCancelledBookings() {
    fetch('http://localhost:8080/api/bookings/cancelled', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Cancelled booking data:', data);
        const tableBody = document.getElementById('cancelledBookingTableBody');
        tableBody.innerHTML = ''; // Clear existing rows

        data.bookings.forEach(booking => {
            const row = document.createElement('tr');
            
            // Format dates
            const bookingDate = new Date(booking.bookingDate).toLocaleDateString();
            const cancelledAt = new Date(booking.cancelledAt).toLocaleString();
            
            row.innerHTML = `
                <td data-th="OrderId">${booking.orderId}</td>
                <td data-th="Booking Date">${bookingDate}</td>
                <td data-th="Customer Name">${booking.customerName}</td>
                <td data-th="Email">${booking.userEmail}</td>
                <td data-th="Distance">${booking.distance} km</td>
                <td data-th="Time">${booking.time} hr</td>
                <td data-th="Phone Number">${booking.phoneNumber}</td>
                <td data-th="Pickup Location">${booking.pickupLocation}</td>
                <td data-th="Pickup Time">${booking.pickupTime}</td>
                <td data-th="Vehicle">${booking.vehicleName}</td>
                <td data-th="Total Cost">$${booking.totalCost}</td>
                <td data-th="Cancelled At">${cancelledAt}</td>
            `;
            
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error fetching cancelled bookings:', error);
    });
}
document.getElementById('cancelledOrderSearchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#cancelledBookingTableBody tr');
    
    rows.forEach(row => {
        const orderId = row.querySelector('td[data-th="OrderId"]').textContent.toLowerCase();
        row.style.display = orderId.includes(searchTerm) ? '' : 'none';
    });
});