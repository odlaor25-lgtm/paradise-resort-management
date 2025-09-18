// Booking System JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeBookingForm();
});

function initializeBookingForm() {
    // Set minimum date to today
    setMinimumDates();
    
    // Setup form event listeners
    setupFormEventListeners();
    
    // Initialize price calculation
    calculateTotalPrice();
}

// Set minimum dates for check-in and check-out
function setMinimumDates() {
    const today = new Date().toISOString().split('T')[0];
    const checkinInput = document.getElementById('checkinDate');
    const checkoutInput = document.getElementById('checkoutDate');
    
    if (checkinInput) {
        checkinInput.min = today;
        checkinInput.addEventListener('change', function() {
            const checkinDate = new Date(this.value);
            const nextDay = new Date(checkinDate);
            nextDay.setDate(nextDay.getDate() + 1);
            
            if (checkoutInput) {
                checkoutInput.min = nextDay.toISOString().split('T')[0];
                
                // If checkout is before new minimum, update it
                if (checkoutInput.value && new Date(checkoutInput.value) <= checkinDate) {
                    checkoutInput.value = nextDay.toISOString().split('T')[0];
                }
            }
            
            calculateTotalPrice();
        });
    }
    
    if (checkoutInput) {
        checkoutInput.addEventListener('change', calculateTotalPrice);
    }
}

// Setup form event listeners
function setupFormEventListeners() {
    const form = document.getElementById('bookingForm');
    const roomTypeSelect = document.getElementById('roomType');
    const guestsSelect = document.getElementById('guests');
    const serviceCheckboxes = document.querySelectorAll('input[name="additionalServices"]');
    
    // Room type change
    if (roomTypeSelect) {
        roomTypeSelect.addEventListener('change', calculateTotalPrice);
    }
    
    // Guests change
    if (guestsSelect) {
        guestsSelect.addEventListener('change', calculateTotalPrice);
    }
    
    // Additional services change
    serviceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculateTotalPrice);
    });
    
    // Form submission
    if (form) {
        form.addEventListener('submit', handleBookingSubmission);
    }
}

// Calculate total price
function calculateTotalPrice() {
    const checkinDate = document.getElementById('checkinDate')?.value;
    const checkoutDate = document.getElementById('checkoutDate')?.value;
    const roomType = document.getElementById('roomType')?.value;
    const guests = parseInt(document.getElementById('guests')?.value) || 0;
    
    if (!checkinDate || !checkoutDate || !roomType) {
        resetPriceDisplay();
        return;
    }
    
    const nights = Utils.calculateNights(checkinDate, checkoutDate);
    if (nights <= 0) {
        resetPriceDisplay();
        return;
    }
    
    // Room price calculation
    const roomPrice = CONFIG.ROOM_TYPES[roomType]?.price || 0;
    const totalRoomPrice = roomPrice * nights;
    
    // Additional services calculation
    let servicesPrice = 0;
    const serviceCheckboxes = document.querySelectorAll('input[name="additionalServices"]:checked');
    
    serviceCheckboxes.forEach(checkbox => {
        const serviceType = checkbox.value;
        const servicePrice = CONFIG.SERVICES[serviceType]?.price || 0;
        
        if (serviceType === 'breakfast') {
            // Breakfast is per person per night
            servicesPrice += servicePrice * guests * nights;
        } else {
            // Other services are one-time charges
            servicesPrice += servicePrice;
        }
    });
    
    // Calculate subtotal
    const subtotal = totalRoomPrice + servicesPrice;
    
    // Calculate service charge and VAT
    const serviceCharge = subtotal * CONFIG.SERVICE_CHARGE_RATE;
    const vat = (subtotal + serviceCharge) * CONFIG.VAT_RATE;
    
    // Calculate total
    const total = subtotal + serviceCharge + vat;
    
    // Update display
    updatePriceDisplay(nights, totalRoomPrice, servicesPrice, serviceCharge, vat, total);
}

// Update price display
function updatePriceDisplay(nights, roomPrice, servicesPrice, serviceCharge, vat, total) {
    const nightCountEl = document.getElementById('nightCount');
    const roomPriceEl = document.getElementById('roomPrice');
    const servicesPriceEl = document.getElementById('servicesPrice');
    const serviceChargeEl = document.getElementById('serviceCharge');
    const vatEl = document.getElementById('vat');
    const totalPriceEl = document.getElementById('totalPrice');
    
    if (nightCountEl) nightCountEl.textContent = nights;
    if (roomPriceEl) roomPriceEl.textContent = Utils.formatCurrency(roomPrice);
    if (servicesPriceEl) servicesPriceEl.textContent = Utils.formatCurrency(servicesPrice);
    if (serviceChargeEl) serviceChargeEl.textContent = Utils.formatCurrency(serviceCharge);
    if (vatEl) vatEl.textContent = Utils.formatCurrency(vat);
    if (totalPriceEl) totalPriceEl.textContent = Utils.formatCurrency(total);
}

// Reset price display
function resetPriceDisplay() {
    updatePriceDisplay(0, 0, 0, 0, 0, 0);
}

// Handle booking form submission
async function handleBookingSubmission(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateBookingForm()) {
        return;
    }
    
    // Show loading
    Utils.showLoading('กำลังส่งคำขอจอง...');
    
    try {
        // Collect form data
        const bookingData = collectBookingData();
        
        // Generate booking ID and room number
        bookingData.bookingId = Utils.generateBookingId();
        bookingData.roomNumber = Utils.generateRoomNumber(bookingData.roomType);
        bookingData.status = 'pending';
        bookingData.createdAt = new Date().toISOString();
        
        // Send booking data to Google Sheets
        const response = await API.sendData('createBooking', bookingData);
        
        if (response.success) {
            // Hide loading
            Utils.hideLoading();
            
            // Show success modal
            showSuccessModal(bookingData.bookingId, bookingData.roomNumber);
            
            // Reset form
            document.getElementById('bookingForm').reset();
            resetPriceDisplay();
            
        } else {
            throw new Error(response.message || 'เกิดข้อผิดพลาดในการจอง');
        }
        
    } catch (error) {
        Utils.hideLoading();
        Utils.showError('เกิดข้อผิดพลาด: ' + error.message);
        console.error('Booking error:', error);
    }
}

// Validate booking form
function validateBookingForm() {
    const requiredFields = [
        'fullName', 'phone', 'email', 'checkinDate', 
        'checkoutDate', 'roomType', 'guests'
    ];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            Utils.showError(`กรุณากรอก${field?.previousElementSibling?.textContent || fieldId}`);
            field?.focus();
            return false;
        }
    }
    
    // Validate email format
    const email = document.getElementById('email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Utils.showError('รูปแบบอีเมลไม่ถูกต้อง');
        document.getElementById('email').focus();
        return false;
    }
    
    // Validate phone format
    const phone = document.getElementById('phone').value;
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/[-\s]/g, ''))) {
        Utils.showError('รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง');
        document.getElementById('phone').focus();
        return false;
    }
    
    // Validate dates
    const checkinDate = new Date(document.getElementById('checkinDate').value);
    const checkoutDate = new Date(document.getElementById('checkoutDate').value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkinDate < today) {
        Utils.showError('วันที่เช็คอินต้องไม่เป็นวันที่ผ่านมาแล้ว');
        return false;
    }
    
    if (checkoutDate <= checkinDate) {
        Utils.showError('วันที่เช็คเอาท์ต้องหลังจากวันที่เช็คอิน');
        return false;
    }
    
    return true;
}

// Collect booking data from form
function collectBookingData() {
    const formData = new FormData(document.getElementById('bookingForm'));
    const data = Object.fromEntries(formData);
    
    // Collect additional services
    const additionalServices = [];
    const serviceCheckboxes = document.querySelectorAll('input[name="additionalServices"]:checked');
    serviceCheckboxes.forEach(checkbox => {
        additionalServices.push(checkbox.value);
    });
    
    // Calculate pricing
    const nights = Utils.calculateNights(data.checkinDate, data.checkoutDate);
    const roomPrice = CONFIG.ROOM_TYPES[data.roomType]?.price || 0;
    const totalRoomPrice = roomPrice * nights;
    
    let servicesPrice = 0;
    additionalServices.forEach(service => {
        const servicePrice = CONFIG.SERVICES[service]?.price || 0;
        if (service === 'breakfast') {
            servicesPrice += servicePrice * parseInt(data.guests) * nights;
        } else {
            servicesPrice += servicePrice;
        }
    });
    
    const subtotal = totalRoomPrice + servicesPrice;
    const serviceCharge = subtotal * CONFIG.SERVICE_CHARGE_RATE;
    const vat = (subtotal + serviceCharge) * CONFIG.VAT_RATE;
    const total = subtotal + serviceCharge + vat;
    
    return {
        ...data,
        additionalServices,
        nights,
        roomPrice: totalRoomPrice,
        servicesPrice,
        serviceCharge,
        vat,
        total
    };
}

// Show success modal
function showSuccessModal(bookingId, roomNumber) {
    const modal = document.getElementById('successModal');
    const bookingIdDisplay = document.getElementById('bookingIdDisplay');
    const roomNumberDisplay = document.getElementById('roomNumberDisplay');
    
    if (modal && bookingIdDisplay && roomNumberDisplay) {
        bookingIdDisplay.textContent = bookingId;
        roomNumberDisplay.textContent = roomNumber;
        modal.classList.remove('hidden');
    }
}

// Close success modal
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}