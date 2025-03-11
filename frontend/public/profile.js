
//validate-session
document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:8080/api/auth/validate-session', {
        credentials: 'include' // Include cookies in the request
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Session valid') {
                console.log('User:', data.username, 'Role:', data.role);
                // Update the UI to show the user is logged in
            } else {
                window.location.href = 'login.html'; // Redirect to login page
            }
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.href = 'login.html'; // Redirect to login page
        });
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

document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadOrderHistory();
});

async function loadUserInfo() {
    try {
        const response = await fetch('http://localhost:8080/api/bookings/user-info', {
            credentials: 'include'  // Include cookies for session token
        });
        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }
        const data = await response.json();
        
        // Update the profile info
        document.querySelector('.profile-info h2').textContent = data.username;
        document.querySelector('.profile-info p').textContent = `Orders: ${data.orderCount}`;
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

async function loadOrderHistory() {
    try {
        const response = await fetch('http://localhost:8080/api/bookings/user-history', {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Failed to fetch order history');
        }
        const bookings = await response.json();
        
        const orderList = document.querySelector('.order-list');
        orderList.innerHTML = ''; // Clear existing orders
        
        bookings.forEach(booking => {
            const orderCard = `
                <div class="order-card">
                    <div class="order-header">
                        <h3>OrderID #${booking.orderId}</h3>
                        <span class="order-date">${new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                    <div class="order-details">
                        <p><i class="fa-solid fa-car"></i> Vehicle Name: ${booking.vehicleName}</p>
                        <p><i class="fa-solid fa-user"></i> Name: ${booking.customerName}</p>
                        <p><i class="fa-solid fa-phone"></i> Contact: ${booking.phoneNumber}</p>
                        <p><i class="fas fa-map-marker-alt"></i> Pick up location: ${booking.pickupLocation}</p>
                        <p><i class="fa-solid fa-clock"></i> Time: ${booking.pickupTime}</p>
                        <p><i class="fa-solid fa-hand-holding-dollar"></i> Price: $${booking.totalCost.toFixed(2)}</p>
                    </div>
                </div>
            `;
            orderList.innerHTML += orderCard;
        });

        if (bookings.length === 0) {
            orderList.innerHTML = '<div class="no-orders">No orders found</div>';
        }
    } catch (error) {
        console.error('Error loading order history:', error);
    }
}

