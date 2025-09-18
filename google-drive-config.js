// Google Apps Script Configuration
const CONFIG = {
    // Google Apps Script Web App URL
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycby37TAZkYTKxN0nm3IDCavF7pCVpEmiw8IHVNIu1zDjhBHSDe5QZfsbCh2t6Yuk3-B_/exec',
    
    // Google Sheets ID
    SPREADSHEET_ID: '1cD0psRdm293TODMDWB4IY88h-PTs2E2nyB6ba_7s_MA',
    
    // Sheet Names
    SHEETS: {
        BOOKINGS: 'Bookings',
        ROOMS: 'Rooms',
        CUSTOMERS: 'Customers',
        SETTINGS: 'Settings'
    },
    
    // Contact Email
    CONTACT_EMAIL: 'odlaor25@gmail.com',
    
    // Resort Information
    RESORT: {
        NAME: 'Paradise Resort',
        PHONE: '02-123-4567',
        EMAIL: 'odlaor25@gmail.com',
        ADDRESS: '123 Paradise Beach, Thailand 12345'
    },
    
    // Room Types and Prices
    ROOM_TYPES: {
        standard: {
            name: 'Standard Room',
            price: 2500,
            capacity: 2,
            size: 25,
            emoji: '🛏️'
        },
        deluxe: {
            name: 'Deluxe Room',
            price: 3500,
            capacity: 3,
            size: 35,
            emoji: '🏨'
        },
        suite: {
            name: 'Suite Room',
            price: 5000,
            capacity: 4,
            size: 50,
            emoji: '👑'
        }
    },
    
    // Additional Services
    SERVICES: {
        breakfast: {
            name: 'อาหารเช้า',
            price: 300,
            emoji: '🍳'
        },
        airport: {
            name: 'รับส่งสนามบิน',
            price: 800,
            emoji: '✈️'
        },
        spa: {
            name: 'แพ็คเกจสปา',
            price: 1500,
            emoji: '💆‍♀️'
        },
        tour: {
            name: 'ทัวร์เกาะ',
            price: 2000,
            emoji: '🚢'
        }
    },
    
    // Tax and Service Rates
    SERVICE_CHARGE_RATE: 0.10, // 10%
    VAT_RATE: 0.07 // 7%
};

// Utility Functions
const Utils = {
    // Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('th-TH').format(amount) + ' บาท';
    },
    
    // Format date
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // Generate booking ID
    generateBookingId: () => {
        const prefix = 'PR';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        return `${prefix}${timestamp}${random}`;
    },
    
    // Generate room number
    generateRoomNumber: (roomType) => {
        const typePrefix = {
            'standard': '1',
            'deluxe': '2',
            'suite': '3'
        };
        const floor = typePrefix[roomType] || '1';
        const room = Math.floor(Math.random() * 20) + 1;
        return `${floor}${room.toString().padStart(2, '0')}`;
    },
    
    // Calculate nights between dates
    calculateNights: (checkin, checkout) => {
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    },
    
    // Show loading
    showLoading: (message = 'กำลังประมวลผล...') => {
        const modal = document.getElementById('loadingModal');
        if (modal) {
            modal.querySelector('p').textContent = message;
            modal.classList.remove('hidden');
        }
    },
    
    // Hide loading
    hideLoading: () => {
        const modal = document.getElementById('loadingModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },
    
    // Show success message
    showSuccess: (message) => {
        alert('✅ ' + message);
    },
    
    // Show error message
    showError: (message) => {
        alert('❌ ' + message);
    }
};

// API Functions
const API = {
    // Send data to Google Apps Script
    sendData: async (action, data) => {
        try {
            const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: action,
                    data: data
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // Get data from Google Apps Script
    getData: async (action, params = {}) => {
        try {
            const url = new URL(CONFIG.APPS_SCRIPT_URL);
            url.searchParams.append('action', action);
            
            Object.keys(params).forEach(key => {
                url.searchParams.append(key, params[key]);
            });
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};