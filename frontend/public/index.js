// TOGGLE HAMBURGER & COLLAPSE NAV
$('.nav-toggle').on('click', function() {
    $(this).toggleClass('open');
    $('.menu-left').toggleClass('collapse');
});
// REMOVE X & COLLAPSE NAV ON ON CLICK
$('.menu-left a').on('click', function() {
    $('.nav-toggle').removeClass('open');
    $('.menu-left').removeClass('collapse');
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


let selectedVehicle = '';
let bookingDetails = {};

function selectVehicle(vehicle) {
    selectedVehicle = vehicle;
    document.querySelectorAll('.vehicle').forEach(v => v.style.borderColor = '#ccc');
    event.currentTarget.style.borderColor = '#28a745';
    
    // Show and populate the car dropdown when a vehicle type is selected
    selectVehicleType(vehicle);
}

function toggleDistanceTime() {
    const distanceOrTime = document.getElementById('distanceOrTime').value;
    document.getElementById('distance').style.display = distanceOrTime === 'distance' ? 'block' : 'none';
    document.getElementById('time').style.display = distanceOrTime === 'time' ? 'block' : 'none';
}

function nextStep(step) {
    if (step === 2) {
        if (!selectedCar) {
            alert('Please select a car from the dropdown menu first');
            return;
        }
        // Pass the selected car's details to the booking form
        bookingDetails.vehicleName = selectedCar.name;
        bookingDetails.distancePrice = selectedCar.distancePrice;
        bookingDetails.timePrice = selectedCar.timePrice;
    }

    if (step === 3) {
        // Validate required fields
        const requiredFields = {
            'Name': document.getElementById('customerName').value,
            'Phone Number': document.getElementById('phoneNumber').value,
            'Booking Date': document.getElementById('bookingDate').value,
            'Pickup Time': document.getElementById('pickupTime').value,
            'Pickup Location': document.getElementById('pickupLocation').value
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

        // Validate distance or time
        const distanceOrTime = document.getElementById('distanceOrTime').value;
        const distance = document.getElementById('distance').value;
        const time = document.getElementById('time').value;

        if (distanceOrTime === 'distance' && (!distance || distance <= 0)) {
            alert('Please enter a valid distance');
            return;
        }
        if (distanceOrTime === 'time' && (!time || time <= 0)) {
            alert('Please enter a valid time');
            return;
        }


        // Populate confirmation details
        bookingDetails = {
            vehicle: selectedCar.name,
            name: document.getElementById('customerName').value,
            phone: document.getElementById('phoneNumber').value,
            date: document.getElementById('bookingDate').value,
            pickupTime: document.getElementById('pickupTime').value,
            pickup: document.getElementById('pickupLocation').value,
            distanceOrTime: document.getElementById('distanceOrTime').value,
            distance: document.getElementById('distance').value,
            time: document.getElementById('time').value,
            distancePrice: selectedCar.distancePrice,
            timePrice: selectedCar.timePrice
        };
    }

    // Only change the active step if we haven't returned early due to validation
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');

    // Update confirmation page
    if (step === 3) {
        document.getElementById('confirmVehicle').innerText = bookingDetails.vehicle;
        document.getElementById('confirmName').innerText = bookingDetails.name;
        document.getElementById('confirmPhone').innerText = bookingDetails.phone;
        document.getElementById('confirmDate').innerText = bookingDetails.date;
        document.getElementById('confirmPickup').innerText = bookingDetails.pickup;
        document.getElementById('confirmDistanceTime').innerText = bookingDetails.distanceOrTime === 'distance' ?
            `${bookingDetails.distance} km` : `${bookingDetails.time} hours`;
        document.getElementById('confirmCost').innerText = calculateCost();
    }
}

function prevStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
}

function calculateCost() {
    if (!selectedCar) {
        return '0.00';
    }
    
    const distanceOrTime = bookingDetails.distanceOrTime === 'distance' ?
        parseFloat(bookingDetails.distance) : parseFloat(bookingDetails.time);
    
    const price = bookingDetails.distanceOrTime === 'distance' ?
        selectedCar.distancePrice : selectedCar.timePrice;
    
    return (price * distanceOrTime).toFixed(2);
}

function submitBooking() {
    // Validate that a car is selected
    if (!selectedCar) {
        alert('Please select a car before proceeding');
        return;
    }

    const booking = {
        customerName: bookingDetails.name,
        phoneNumber: bookingDetails.phone,
        bookingDate: bookingDetails.date,
        pickupTime: bookingDetails.pickupTime,
        pickupLocation: bookingDetails.pickup,
        vehicleName: selectedCar.name,
        distance: bookingDetails.distanceOrTime === 'distance' ? parseFloat(bookingDetails.distance) : 0,
        time: bookingDetails.distanceOrTime === 'time' ? parseFloat(bookingDetails.time) : 0,
        totalCost: parseFloat(calculateCost()),
        distancePrice: selectedCar.distancePrice,
        timePrice: selectedCar.timePrice
    };

    // Validate all required fields
    const requiredFields = ['customerName', 'phoneNumber', 'bookingDate', 'pickupTime', 'pickupLocation', 'vehicleName'];
    for (const field of requiredFields) {
        if (!booking[field]) {
            alert(`Please fill in all required fields (${field} is missing)`);
            return;
        }
    }

    fetch('http://localhost:8080/api/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(booking)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('orderId').innerText = data.orderId;
            nextStep(4);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to submit booking. Please try again.');
        });
}

let selectedVehicleType = '';
let selectedCar = null;

// Fetch cars by type from the backend
function selectVehicleType(type) {
    selectedVehicleType = type;
    fetch(`http://localhost:8080/api/vehicles/by-type?type=${type}`)
        .then(response => response.json())
        .then(data => {
            const dropdown = document.getElementById('car-dropdown');
            dropdown.innerHTML = ''; // Clear previous options
            

            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- Select a car --';
            defaultOption.selected = true;
            dropdown.appendChild(defaultOption);

            // Add car options
            data.forEach(car => {
                const option = document.createElement('option');
                option.value = car.id;
                option.textContent = `${car.name} ($${car.distancePrice}/km, $${car.timePrice}/hr)`;
                dropdown.appendChild(option);
            });
            document.getElementById('car-selection').style.display = 'block';
            
            // Reset selectedCar when changing vehicle type
            selectedCar = null;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to fetch cars. Please try again.');
        });
}

// Handle car selection
function selectCar() {
    const carId = document.getElementById('car-dropdown').value;
    if (!carId) {
        selectedCar = null;
        return;
    }

    fetch(`http://localhost:8080/api/vehicles/${carId}`)
        .then(response => response.json())
        .then(data => {
            selectedCar = data;
            console.log('Selected Car:', selectedCar);
        })
        .catch(error => {
            console.error('Error:', error);
            selectedCar = null;
            alert('Failed to fetch car details. Please try selecting again.');
        });
}