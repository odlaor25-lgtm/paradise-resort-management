// Rooms Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeRoomsPage();
});

function initializeRoomsPage() {
    // Setup room filtering
    setupRoomFiltering();
    
    // Load room availability
    loadRoomAvailability();
    
    // Setup mobile menu
    setupMobileMenu();
}

// Setup room filtering functionality
function setupRoomFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const roomCategories = document.querySelectorAll('.room-category');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            
            // Update active button
            filterButtons.forEach(btn => {
                btn.classList.remove('active', 'bg-white', 'text-blue-600');
                btn.classList.add('bg-white/20', 'text-white');
            });
            
            this.classList.remove('bg-white/20', 'text-white');
            this.classList.add('active', 'bg-white', 'text-blue-600');
            
            // Filter rooms
            filterRooms(filter);
        });
    });
}

// Filter rooms by category
function filterRooms(category) {
    const roomCategories = document.querySelectorAll('.room-category');
    
    roomCategories.forEach(roomCategory => {
        const categoryType = roomCategory.getAttribute('data-category');
        
        if (category === 'all' || categoryType === category) {
            roomCategory.style.display = 'block';
            // Add fade-in animation
            roomCategory.style.opacity = '0';
            setTimeout(() => {
                roomCategory.style.opacity = '1';
                roomCategory.style.transition = 'opacity 0.3s ease-in-out';
            }, 100);
        } else {
            roomCategory.style.display = 'none';
        }
    });
    
    // Update URL hash
    window.location.hash = category === 'all' ? '' : category;
}

// Load room availability from API
async function loadRoomAvailability() {
    try {
        const response = await API.getData('getRoomAvailability');
        
        if (response.success) {
            updateRoomAvailabilityDisplay(response.data);
        }
    } catch (error) {
        console.error('Error loading room availability:', error);
        // Show default availability
        showDefaultAvailability();
    }
}

// Update room availability display
function updateRoomAvailabilityDisplay(availability) {
    Object.keys(CONFIG.ROOM_TYPES).forEach(roomType => {
        const availableCount = availability[roomType] || 0;
        const roomCards = document.querySelectorAll(`[data-room-type="${roomType}"]`);
        
        roomCards.forEach(card => {
            // Add availability badge
            addAvailabilityBadge(card, availableCount);
            
            // Update booking button state
            updateBookingButton(card, availableCount);
        });
    });
}

// Add availability badge to room card
function addAvailabilityBadge(card, availableCount) {
    // Remove existing badge
    const existingBadge = card.querySelector('.availability-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    // Create new badge
    const badge = document.createElement('div');
    badge.className = `availability-badge absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${
        availableCount > 5 ? 'bg-green-500 text-white' :
        availableCount > 0 ? 'bg-yellow-500 text-white' :
        'bg-red-500 text-white'
    }`;
    
    badge.textContent = availableCount > 0 ? `เหลือ ${availableCount} ห้อง` : 'เต็ม';
    
    // Add to card (make card relative if not already)
    card.style.position = 'relative';
    card.appendChild(badge);
}

// Update booking button state
function updateBookingButton(card, availableCount) {
    const bookingButton = card.querySelector('a[href*="booking"]');
    
    if (bookingButton) {
        if (availableCount === 0) {
            bookingButton.classList.add('opacity-50', 'cursor-not-allowed');
            bookingButton.textContent = 'เต็ม';
            bookingButton.onclick = (e) => {
                e.preventDefault();
                Utils.showError('ห้องประเภทนี้เต็มแล้ว');
            };
        } else {
            bookingButton.classList.remove('opacity-50', 'cursor-not-allowed');
            bookingButton.textContent = 'จองห้องนี้';
            bookingButton.onclick = null;
        }
    }
}

// Show default availability when API fails
function showDefaultAvailability() {
    const defaultAvailability = {
        standard: 8,
        deluxe: 5,
        suite: 3
    };
    
    updateRoomAvailabilityDisplay(defaultAvailability);
}

// Setup mobile menu
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Room comparison functionality
function compareRooms() {
    const comparisonData = [
        {
            feature: 'ขนาดห้อง',
            standard: '25 ตร.ม.',
            deluxe: '35 ตร.ม.',
            suite: '50 ตร.ม.'
        },
        {
            feature: 'จำนวนผู้เข้าพัก',
            standard: '2 คน',
            deluxe: '3 คน',
            suite: '4 คน'
        },
        {
            feature: 'วิว',
            standard: 'วิวสวน',
            deluxe: 'วิวทะเลสาบ',
            suite: 'วิวทะเลสาบพิเศษ'
        },
        {
            feature: 'ระเบียง',
            standard: '❌',
            deluxe: '✅',
            suite: '✅ ขนาดใหญ่'
        },
        {
            feature: 'อ่างอาบน้ำ',
            standard: '❌',
            deluxe: '✅',
            suite: '✅ จากุซซี่'
        },
        {
            feature: 'มินิบาร์',
            standard: '❌',
            deluxe: '❌',
            suite: '✅ ฟรี'
        }
    ];
    
    // Create comparison modal
    createComparisonModal(comparisonData);
}

// Create comparison modal
function createComparisonModal(data) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.id = 'comparisonModal';
    
    modal.innerHTML = `
        

            
เปรียบเทียบห้องพัก

                    
                

            
            

                
                        ${data.map(row => `
                            
                        `).join('')}
                        
คุณสมบัติ	🛏️ STANDARD	🏨 DELUXE	👑 SUITE
${row.feature}	${row.standard}	${row.deluxe}	${row.suite}
ราคา/คืน	2,500 บาท	3,500 บาท	5,000 บาท
            

            
            

                
                    เลือกห้องและจอง
                
            

        

    `;
    
    document.body.appendChild(modal);
}

// Close comparison modal
function closeComparisonModal() {
    const modal = document.getElementById('comparisonModal');
    if (modal) {
        modal.remove();
    }
}

// Initialize room filtering based on URL hash
function initializeFilterFromHash() {
    const hash = window.location.hash.substring(1);
    if (hash && ['standard', 'deluxe', 'suite'].includes(hash)) {
        filterRooms(hash);
        
        // Update active button
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            const filter = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
            if (filter === hash) {
                btn.click();
            }
        });
    }
}

// Initialize filter from hash on page load
window.addEventListener('load', initializeFilterFromHash);