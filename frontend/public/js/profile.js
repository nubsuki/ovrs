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

//validate-session
document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:8080/api/auth/validate-session', {
        credentials: 'include' // Include cookies in the request
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Session valid') {
                console.log('User:', data.username, 'Role:', data.role);
                // Show/hide dashboard button based on role
                const dashboardButton = document.querySelector('.profile-header button');
                const availabilityButton = document.querySelector('.availability-btn');

                if (data.role === 'ADMIN') {
                    dashboardButton.style.display = 'block';
                    dashboardButton.onclick = () => window.location.href = 'dashboard.html';
                } else if (data.role === 'DRIVER') {
                    availabilityButton.style.display = 'block';
                    checkDriverAvailability();
                } else {
                    dashboardButton.style.display = 'none';
                    availabilityButton.style.display = 'none';
                }
                loadUserInfo();
                loadOrderHistory();
            } else {
                window.location.href = 'login.html'; // Redirect to login page
            }
            const tabs = document.querySelectorAll('.tab-btn');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    const tabContents = document.querySelectorAll('.tab-content');
                    tabContents.forEach(content => {
                        content.style.display = 'none';
                    });

                    const targetTab = document.getElementById(tab.dataset.tab);
                    if (targetTab) {
                        targetTab.style.display = 'block';
                        if (tab.dataset.tab === 'assigned-orders') {
                            loadAssignedOrders();
                        }
                    }
                });
            });
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

        const getStatusIcon = (status) => {
            switch (status.toUpperCase()) {
                case 'PENDING':
                    return '<i class="fas fa-clock"></i>';
                case 'COMPLETED':
                    return '<i class="fas fa-check-circle"></i>';
                default:
                    return '<i class="fas fa-question-circle"></i>';
            }
        };

        bookings.forEach(booking => {
            const pickupDateTime = new Date(booking.bookingDate + 'T' + booking.pickupTime);
            const canCancel = new Date() < new Date(pickupDateTime - 3600000) && booking.status.toUpperCase() !== 'COMPLETED'; // 1 hour in milliseconds

            const orderCard = `
                <div class="order-card">
                    <div class="order-header">
                        <h3>OrderID #${booking.orderId}</h3>
                        <span class="status-badge ${booking.status.toLowerCase()}">
                        ${getStatusIcon(booking.status)} ${booking.status}
                        </span>
                        <span class="order-date">${new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                    <div class="order-details">
                        <p><i class="fa-solid fa-car"></i> Vehicle Name: ${booking.vehicleName}</p>
                        <p><i class="fa-solid fa-user"></i> Name: ${booking.customerName}</p>
                        <p><i class="fa-solid fa-phone"></i> Contact: ${booking.phoneNumber}</p>
                        <p><i class="fas fa-map-marker-alt"></i> Pick up location: ${booking.pickupLocation}</p>
                        <p><i class="fa-solid fa-clock"></i> Time: ${booking.pickupTime}</p>
                         <p><i class="fa-solid fa-hand-holding-dollar"></i> Price: $${booking.totalCost.toFixed(2)}</p>
                ${canCancel ? `<button class="cancel-btn" onclick="cancelBooking('${booking.orderId}')">
                    <i class="fas fa-times"></i> Cancel Booking
                        </button>` : ''}
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

async function cancelBooking(orderId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/bookings/cancel/${orderId}`, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            alert('Booking cancelled successfully');
            loadOrderHistory(); // Refresh the order list
        } else {
            const text = await response.text();
            alert(text || 'Failed to cancel booking');
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking');
    }
}


function checkDriverAvailability() {
    fetch('http://localhost:8080/api/vehicles/driver-availability', {
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            const availabilityBtn = document.querySelector('.availability-btn');
            if (data.available) {
                availabilityBtn.innerHTML = '<i class="fas fa-toggle-on"></i> Available';
                availabilityBtn.classList.add('available');
            } else {
                availabilityBtn.innerHTML = '<i class="fas fa-toggle-off"></i> Not Available';
                availabilityBtn.classList.remove('available');
            }
        })
        .catch(error => console.error('Error checking availability:', error));
}

function toggleAvailability() {
    fetch('http://localhost:8080/api/vehicles/toggle-availability', {
        method: 'POST',
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            const availabilityBtn = document.querySelector('.availability-btn');
            if (data.available) {
                availabilityBtn.innerHTML = '<i class="fas fa-toggle-on"></i> Available';
                availabilityBtn.classList.add('available');
            } else {
                availabilityBtn.innerHTML = '<i class="fas fa-toggle-off"></i> Not Available';
                availabilityBtn.classList.remove('available');
            }
        })
        .catch(error => {
            console.error('Error toggling availability:', error);
            alert('Failed to update availability status');
        });
}

async function loadAssignedOrders() {
    try {
        const response = await fetch('http://localhost:8080/api/bookings/driver-assignments', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch assigned orders');
        }

        const bookings = await response.json();
        const orderList = document.getElementById('assigned-bookings-list');
        orderList.innerHTML = ''; // Clear existing orders

        bookings.forEach(booking => {
            const orderCard = `
                <div class="order-card">
                    <div class="order-header">
                        <h3>OrderID #${booking.orderId}</h3>
                        <span class="status-badge approved">
                            <i class="fas fa-check-circle"></i> Approved
                        </span>
                        <span class="order-date">${new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                    <div class="order-details">
                        <p><i class="fa-solid fa-car"></i> Vehicle Name: ${booking.vehicleName}</p>
                        <p><i class="fa-solid fa-user"></i> Name: ${booking.customerName}</p>
                        <p><i class="fa-solid fa-phone"></i> Contact: ${booking.phoneNumber}</p>
                        <p><i class="fas fa-map-marker-alt"></i> Pick up location: ${booking.pickupLocation}</p>
                        <p><i class="fa-solid fa-clock"></i> Time: ${booking.pickupTime}</p>
                        <p><i class="fa-solid fa-hand-holding-dollar"></i> Price: $${booking.totalCost.toFixed(2)}</p>
                        <button class="complete-btn" onclick="completeBooking('${booking.orderId}')">
                            <i class="fas fa-check"></i> Complete Trip
                        </button>
                    </div>
                </div>
            `;
            orderList.innerHTML += orderCard;
        });

        if (bookings.length === 0) {
            orderList.innerHTML = '<div class="no-orders">No assigned orders found</div>';
        }
    } catch (error) {
        console.error('Error loading assigned orders:', error);
    }
}

async function completeBooking(orderId) {
    if (!confirm('Are you sure you want to mark this trip as completed?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/bookings/complete/${orderId}`, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            alert('Trip marked as completed successfully');
            loadAssignedOrders(); // Refresh the assigned orders list
        } else {
            const text = await response.text();
            alert(text || 'Failed to complete the trip');
        }
    } catch (error) {
        console.error('Error completing booking:', error);
        alert('Failed to complete the trip');
    }
}