// Main JavaScript for Paradise Resort
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    // Mobile menu functionality
    setupMobileMenu();
    
    // Smooth scrolling for navigation links
    setupSmoothScrolling();
    
    // Initialize animations
    setupAnimations();
    
    // Load initial data
    loadInitialData();
}

// Mobile Menu Setup
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Smooth Scrolling Setup
function setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Animation Setup
function setupAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);
    
    // Observe all sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Load Initial Data
async function loadInitialData() {
    try {
        // Load room availability
        await loadRoomAvailability();
        
        // Load recent bookings count
        await loadRecentBookingsCount();
        
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

// Load Room Availability
async function loadRoomAvailability() {
    try {
        const response = await API.getData('getRoomAvailability');
        
        if (response.success) {
            updateRoomAvailabilityDisplay(response.data);
        }
    } catch (error) {
        console.error('Error loading room availability:', error);
    }
}

// Update Room Availability Display
function updateRoomAvailabilityDisplay(availability) {
    // Update room cards with availability status
    const roomCards = document.querySelectorAll('[data-room-type]');
    
    roomCards.forEach(card => {
        const roomType = card.getAttribute('data-room-type');
        const availableCount = availability[roomType] || 0;
        
        // Add availability indicator
        const availabilityBadge = card.querySelector('.availability-badge');
        if (availabilityBadge) {
            availabilityBadge.textContent = `เหลือ ${availableCount} ห้อง`;
            availabilityBadge.className = `availability-badge px-2 py-1 rounded-full text-xs font-semibold ${
                availableCount > 5 ? 'bg-green-100 text-green-800' :
                availableCount > 0 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
            }`;
        }
    });
}

// Load Recent Bookings Count
async function loadRecentBookingsCount() {
    try {
        const response = await API.getData('getRecentBookingsCount');
        
        if (response.success) {
            updateBookingsCounter(response.data.count);
        }
    } catch (error) {
        console.error('Error loading recent bookings:', error);
    }
}

// Update Bookings Counter
function updateBookingsCounter(count) {
    const counter = document.getElementById('bookingsCounter');
    if (counter) {
        counter.textContent = count;
    }
}

// Contact Form Handler
function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // Show loading
    Utils.showLoading('กำลังส่งข้อความ...');
    
    // Send email (this would typically go through your backend)
    setTimeout(() => {
        Utils.hideLoading();
        Utils.showSuccess('ส่งข้อความเรียบร้อยแล้ว เราจะติดต่อกลับโดยเร็ว');
        event.target.reset();
    }, 2000);
}

// Newsletter Subscription
function subscribeNewsletter(email) {
    if (!email) {
        Utils.showError('กรุณากรอกอีเมล');
        return;
    }
    
    Utils.showLoading('กำลังสมัครสมาชิก...');
    
    // Simulate API call
    setTimeout(() => {
        Utils.hideLoading();
        Utils.showSuccess('สมัครรับข่าวสารเรียบร้อยแล้ว');
    }, 1500);
}

// Scroll to Top Function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add scroll to top button
function addScrollToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'fixed bottom-6 right-6 bg-blue-600 text-white w-12 h-12 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 hidden';
    button.onclick = scrollToTop;
    button.id = 'scrollToTopBtn';
    
    document.body.appendChild(button);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            button.classList.remove('hidden');
        } else {
            button.classList.add('hidden');
        }
    });
}

// Initialize scroll to top button
addScrollToTopButton();

// Utility function to format Thai date
function formatThaiDate(date) {
    const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    const d = new Date(date);
    const day = d.getDate();
    const month = thaiMonths[d.getMonth()];
    const year = d.getFullYear() + 543; // Convert to Buddhist Era
    
    return `${day} ${month} ${year}`;
}

// Export functions for use in other files
window.ParadiseResort = {
    Utils,
    API,
    CONFIG,
    formatThaiDate,
    handleContactForm,
    subscribeNewsletter
};