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
    fetchVehicles();
    fetchDrivers();
    fetchVehicleTypes();
    fetchPendingBookings();
    fetchTotalRevenue();
    fetchTotalBookings();
    fetchTotalVehicles();

    //search functionality for pending bookings
    const pendingOrderSearch = document.getElementById('pendingOrderSearch');
    pendingOrderSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#pendingBookingTableBody tr');
        
        rows.forEach(row => {
            const orderId = row.cells[0].textContent.toLowerCase();
            row.style.display = orderId.includes(searchTerm) ? '' : 'none';
        });
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

function fetchTotalRevenue() {
    fetch('http://localhost:8080/api/bookings/total-revenue', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        const revenueElement = document.getElementById('Revenue');
        revenueElement.textContent = `Total Revenue: $${data.totalRevenue.toFixed(2)}`;
    })
    .catch(error => {
        console.error('Error fetching revenue:', error);
        const revenueElement = document.getElementById('Revenue');
        revenueElement.textContent = 'Total Revenue: Error loading';
    });
}
function fetchTotalBookings() {
    fetch('http://localhost:8080/api/bookings/all', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        const bookingsElement = document.getElementById('Bookings');
        const totalBookings = data.bookings.length;
        bookingsElement.textContent = `Total Bookings: ${totalBookings}`;
    })
    .catch(error => {
        console.error('Error fetching bookings:', error);
        const bookingsElement = document.getElementById('Bookings');
        bookingsElement.textContent = 'Total Bookings: Error loading';
    });
}
function fetchTotalVehicles() {
    fetch('http://localhost:8080/api/vehicles', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        const vehiclesElement = document.getElementById('Vehicles');
        const totalVehicles = data.vehicles.length;
        vehiclesElement.textContent = `Total Vehicles: ${totalVehicles}`;
    })
    .catch(error => {
        console.error('Error fetching vehicles:', error);
        const vehiclesElement = document.getElementById('Vehicles');
        vehiclesElement.textContent = 'Total Vehicles: Error loading';
    });
}

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

function fetchPendingBookings() {
    fetch('http://localhost:8080/api/bookings/pending', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        const tableBody = document.getElementById('pendingBookingTableBody');
        tableBody.innerHTML = '';

        data.bookings.forEach(booking => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${booking.orderId}</td>
                <td>${new Date(booking.bookingDate).toLocaleDateString()}</td>
                <td>${booking.customerName}</td>
                <td>${booking.distance} km</td>
                <td>${booking.time} hr</td>
                <td>${booking.phoneNumber}</td>
                <td>${booking.pickupLocation}</td>
                <td>${booking.pickupTime}</td>
                <td>${booking.vehicleName}</td>
                <td>$${booking.totalCost.toFixed(2)}</td>
                <td>
                    <button onclick="assignBooking('${booking.orderId}')" class="assign-btn">
                        <i class="fas fa-check"></i> Assign
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => console.error('Error fetching pending bookings:', error));
}

// Function to assign booking
function assignBooking(orderId) {
    if (!confirm('Are you sure you want to assign this booking?')) {
        return;
    }

    fetch(`http://localhost:8080/api/bookings/assign/${orderId}`, {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Booking assigned successfully') {
            alert('Booking assigned successfully');
            fetchPendingBookings(); // Refresh the pending bookings table
            fetchBookings(); // Refresh the main bookings table
        } else {
            alert(data.message || 'Failed to assign booking');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to assign booking');
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

            // Get status icon based on booking status
            const getStatusIcon = (status) => {
                switch (status.toUpperCase()) {
                    case 'PENDING':
                        return '<i class="fas fa-clock" title="Pending" style="color: #ffc107;"></i>';
                    case 'APPROVED':
                        return '<i class="fas fa-check-circle" title="Approved" style="color:rgb(188, 230, 198);"></i>';
                    case 'COMPLETED':
                        return '<i class="fas fa-check-double" title="Completed" style="color: #198754;"></i>';
                    default:
                        return '<i class="fas fa-question-circle" title="Unknown" style="color: #6c757d;"></i>';
                }
            };
            
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
                <td data-th="cancel"> ${getStatusIcon(booking.status)}
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

function fetchVehicleTypes() {
    fetch('http://localhost:8080/api/vehicles/types', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        const typeSelect = document.getElementById('vehicleType');
        typeSelect.innerHTML = '<option value="">Select Type</option>';
        
        if (data.types && Array.isArray(data.types)) {
            data.types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                typeSelect.appendChild(option);
            });
        }
    })
    .catch(error => console.error('Error fetching vehicle types:', error));
}

function handleDriverSearch(event) {
    const searchTerm = event.target.value;
    const suggestionsDiv = document.getElementById('driverSuggestions');
    
    clearTimeout(searchTimeout);
    
    if (searchTerm.length < 2) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    searchTimeout = setTimeout(() => {
        fetch('http://localhost:8080/api/auth/search-drivers', {
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
            if (data.drivers && data.drivers.length > 0) {
                suggestionsDiv.innerHTML = '';
                data.drivers.forEach(driver => {
                    const div = document.createElement('div');
                    div.className = 'suggestion-item';
                    const highlightedEmail = highlightMatch(driver.email, searchTerm);
                    div.innerHTML = `
                        <div class="email">${highlightedEmail}</div>
                        <div class="username">${driver.username}</div>
                    `;
                    div.onclick = () => selectDriver(driver.email);
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

function selectDriver(email) {
    document.getElementById('driverEmail').value = email;
    document.getElementById('driverSuggestions').style.display = 'none';
}


function fetchVehicles() {
    fetch('http://localhost:8080/api/vehicles', {
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch vehicles');
        }
        return response.json();
    })
    .then(data => {
        const tableBody = document.getElementById('vehicleTableBody');
        tableBody.innerHTML = '';

        if (data.vehicles && Array.isArray(data.vehicles)) {
            data.vehicles.forEach(vehicle => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td data-th="ID">${vehicle.id}</td>
                    <td data-th="Name">${vehicle.name}</td>
                    <td data-th="Type">${vehicle.type}</td>
                    <td data-th="Price/km">$${vehicle.distancePrice}</td>
                    <td data-th="Price/hr">$${vehicle.timePrice}</td>
                    <td data-th="Driver">${vehicle.driverEmail || 'Not assigned'}</td>
                    <td data-th="Action">
                        <button onclick="deleteVehicle(${vehicle.id})" class="delete-btn">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching vehicles:', error);
        alert('Failed to fetch vehicles. Please try again.');
    });
}

function addVehicle() {
    const name = document.getElementById('vehicleName').value;
    const type = document.getElementById('vehicleType').value;
    const distancePrice = document.getElementById('distancePrice').value;
    const timePrice = document.getElementById('timePrice').value;
    const driverEmail = document.getElementById('driverEmail').value;

    if (!name || !type || !distancePrice || !timePrice || !driverEmail) {
        alert('Please fill in all fields');
        return;
    }

    const vehicle = {
        name: name,
        type: type,
        distancePrice: parseFloat(distancePrice),
        timePrice: parseFloat(timePrice),
        driverEmail: driverEmail
    };

    fetch('http://localhost:8080/api/vehicles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(vehicle)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add vehicle');
        }
        return response.json();
    })
    .then(() => {
        // Clear form
        document.getElementById('vehicleName').value = '';
        document.getElementById('vehicleType').value = '';
        document.getElementById('distancePrice').value = '';
        document.getElementById('timePrice').value = '';
        document.getElementById('driverEmail').value = '';
        
        // Refresh vehicle list
        fetchVehicles();
        alert('Vehicle added successfully');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to add vehicle');
    });
}

function fetchDrivers() {
    fetch('http://localhost:8080/api/auth/drivers', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        const driverSelect = document.getElementById('driverEmail');
        driverSelect.innerHTML = '<option value="">Select Driver</option>';
        
        if (data.drivers && Array.isArray(data.drivers)) {
            data.drivers.forEach(driver => {
                const option = document.createElement('option');
                option.value = driver.email;
                option.textContent = `${driver.email} (${driver.username})`;
                driverSelect.appendChild(option);
            });
        }
    })
    .catch(error => console.error('Error fetching drivers:', error));
}

function deleteVehicle(id) {
    if (!confirm('Are you sure you want to delete this vehicle?')) {
        return;
    }

    fetch(`http://localhost:8080/api/vehicles/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete vehicle');
        }
        fetchVehicles();
        alert('Vehicle deleted successfully');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to delete vehicle');
    });
}

function cancelBooking(orderId) {
    // First checks if user is admin
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