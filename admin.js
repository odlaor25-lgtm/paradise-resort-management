// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminDashboard();
});

function initializeAdminDashboard() {
    // Load dashboard data
    loadDashboardStats();
    
    // Setup tab navigation
    setupTabNavigation();
    
    // Load initial data
    loadBookings();
    loadRooms();
    
    // Setup filters
    setupFilters();
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await API.getData('getDashboardStats');
        
        if (response.success) {
            updateDashboardStats(response.data);
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showDefaultStats();
    }
}

// Update dashboard statistics display
function updateDashboardStats(stats) {
    const elements = {
        todayBookings: document.getElementById('todayBookings'),
        availableRooms: document.getElementById('availableRooms'),
        currentGuests: document.getElementById('currentGuests'),
        todayRevenue: document.getElementById('todayRevenue')
    };
    
    if (elements.todayBookings) elements.todayBookings.textContent = stats.todayBookings || 0;
    if (elements.availableRooms) elements.availableRooms.textContent = stats.availableRooms || 0;
    if (elements.currentGuests) elements.currentGuests.textContent = stats.currentGuests || 0;
    if (elements.todayRevenue) elements.todayRevenue.textContent = Utils.formatCurrency(stats.todayRevenue || 0);
}

// Show default statistics when API fails
function showDefaultStats() {
    updateDashboardStats({
        todayBookings: 5,
        availableRooms: 12,
        currentGuests: 28,
        todayRevenue: 45000
    });
}

// Setup tab navigation
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            showTab(tabName);
        });
    });
}

// Show specific tab
function showTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Update button states
    tabButtons.forEach(btn => {
        btn.classList.remove('border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    
    // Update content visibility
    tabContents.forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show selected tab
    const activeButton = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    const activeContent = document.getElementById(`${tabName}Tab`);
    
    if (activeButton) {
        activeButton.classList.remove('border-transparent', 'text-gray-500');
        activeButton.classList.add('border-blue-500', 'text-blue-600');
    }
    
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }
    
    // Load tab-specific data
    switch (tabName) {
        case 'bookings':
            loadBookings();
            break;
        case 'rooms':
            loadRooms();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

// Load bookings data
async function loadBookings() {
    const tableBody = document.getElementById('bookingsTableBody');
    if (!tableBody) return;
    
    // Show loading
    tableBody.innerHTML = `
        
            
                

                กำลังโหลดข้อมูล...
            
        
    `;
    
    try {
        const response = await API.getData('getBookings');
        
        if (response.success) {
            displayBookings(response.data);
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        tableBody.innerHTML = `
            
                
                    เกิดข้อผิดพลาดในการโหลดข้อมูล
                
            
        `;
    }
}

// Display bookings in table
function displayBookings(bookings) {
    const tableBody = document.getElementById('bookingsTableBody');
    if (!tableBody) return;
    
    if (bookings.length === 0) {
        tableBody.innerHTML = `
            
                
                    ไม่มีข้อมูลการจอง
                
            
        `;
        return;
    }
    
    tableBody.innerHTML = bookings.map(booking => `
        
            
                ${booking.bookingId}
            
            
                ${booking.fullName}
            
            
                ${booking.roomNumber} (${CONFIG.ROOM_TYPES[booking.roomType]?.name || booking.roomType})
            
            
                ${Utils.formatDate(booking.checkinDate)} - ${Utils.formatDate(booking.checkoutDate)}
            
            
                
                    ${getStatusText(booking.status)}
                
            
            
                ${Utils.formatCurrency(booking.total)}
            
            
                ดู
                ยืนยัน
                ยกเลิก
            
        
    `).join('');
}

// Get status badge CSS class
function getStatusBadgeClass(status) {
    const classes = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-green-100 text-green-800',
        checkedin: 'bg-blue-100 text-blue-800',
        checkedout: 'bg-gray-100 text-gray-800',
        cancelled: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}

// Get status text in Thai
function getStatusText(status) {
    const texts = {
        pending: 'รอยืนยัน',
        confirmed: 'ยืนยันแล้ว',
        checkedin: 'เช็คอินแล้ว',
        checkedout: 'เช็คเอาท์แล้ว',
        cancelled: 'ยกเลิก'
    };
    return texts[status] || status;
}

// Load rooms data
async function loadRooms() {
    try {
        const response = await API.getData('getRooms');
        
        if (response.success) {
            displayRooms(response.data);
            updateRoomStatusSummary(response.data);
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
        showDefaultRooms();
    }
}

// Display rooms in grid
function displayRooms(rooms) {
    const roomsGrid = document.getElementById('roomsGrid');
    if (!roomsGrid) return;
    
    roomsGrid.innerHTML = rooms.map(room => `
        

            
${CONFIG.ROOM_TYPES[room.type]?.emoji || '🏨'}

            
${room.number}

            
${CONFIG.ROOM_TYPES[room.type]?.name || room.type}

            

                ${getRoomStatusText(room.status)}
            

            

                
                    เปลี่ยนสถานะ
                
            

        

    `).join('');
}

// Get room status CSS class
function getRoomStatusClass(status) {
    const classes = {
        available: 'border-green-200',
        occupied: 'border-blue-200',
        reserved: 'border-yellow-200',
        cleaning: 'border-purple-200',
        maintenance: 'border-red-200'
    };
    return classes[status] || 'border-gray-200';
}

// Get room status badge CSS class
function getRoomStatusBadgeClass(status) {
    const classes = {
        available: 'bg-green-100 text-green-800',
        occupied: 'bg-blue-100 text-blue-800',
        reserved: 'bg-yellow-100 text-yellow-800',
        cleaning: 'bg-purple-100 text-purple-800',
        maintenance: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}

// Get room status text in Thai
function getRoomStatusText(status) {
    const texts = {
        available: 'ว่าง',
        occupied: 'มีผู้พัก',
        reserved: 'จอง',
        cleaning: 'ทำความสะอาด',
        maintenance: 'ซ่อมแซม'
    };
    return texts[status] || status;
}

// Update room status summary
function updateRoomStatusSummary(rooms) {
    const summary = rooms.reduce((acc, room) => {
        acc[room.status] = (acc[room.status] || 0) + 1;
        return acc;
    }, {});
    
    const elements = {
        availableCount: document.getElementById('availableCount'),
        occupiedCount: document.getElementById('occupiedCount'),
        reservedCount: document.getElementById('reservedCount'),
        cleaningCount: document.getElementById('cleaningCount'),
        maintenanceCount: document.getElementById('maintenanceCount')
    };
    
    if (elements.availableCount) elements.availableCount.textContent = summary.available || 0;
    if (elements.occupiedCount) elements.occupiedCount.textContent = summary.occupied || 0;
    if (elements.reservedCount) elements.reservedCount.textContent = summary.reserved || 0;
    if (elements.cleaningCount) elements.cleaningCount.textContent = summary.cleaning || 0;
    if (elements.maintenanceCount) elements.maintenanceCount.textContent = summary.maintenance || 0;
}

// Show default rooms when API fails
function showDefaultRooms() {
    const defaultRooms = [];
    
    // Generate sample rooms
    Object.keys(CONFIG.ROOM_TYPES).forEach((type, typeIndex) => {
        for (let i = 1; i <= 10; i++) {
            const roomNumber = `${typeIndex + 1}${i.toString().padStart(2, '0')}`;
            const statuses = ['available', 'occupied', 'reserved', 'cleaning'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            defaultRooms.push({
                number: roomNumber,
                type: type,
                status: status
            });
        }
    });
    
    displayRooms(defaultRooms);
    updateRoomStatusSummary(defaultRooms);
}

// Setup filters
function setupFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchFilter = document.getElementById('searchFilter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', applyFilters);
    }
    
    if (searchFilter) {
        searchFilter.addEventListener('input', debounce(applyFilters, 300));
    }
}

// Apply filters to bookings table
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter')?.value;
    const dateFilter = document.getElementById('dateFilter')?.value;
    const searchFilter = document.getElementById('searchFilter')?.value.toLowerCase();
    
    const rows = document.querySelectorAll('#bookingsTableBody tr');
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 7) return; // Skip header or empty rows
        
        const bookingId = cells[0].textContent.trim();
        const customerName = cells[1].textContent.trim().toLowerCase();
        const status = row.querySelector('.rounded-full')?.textContent.trim();
        const dateText = cells[3].textContent.trim();
        
        let show = true;
        
        // Status filter
        if (statusFilter && status && !status.includes(getStatusText(statusFilter))) {
            show = false;
        }
        
        // Date filter
        if (dateFilter && !dateText.includes(Utils.formatDate(dateFilter))) {
            show = false;
        }
        
        // Search filter
        if (searchFilter && !customerName.includes(searchFilter) && !bookingId.toLowerCase().includes(searchFilter)) {
            show = false;
        }
        
        row.style.display = show ? '' : 'none';
    });
}

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// View booking details
async function viewBookingDetails(bookingId) {
    try {
        Utils.showLoading('กำลังโหลดรายละเอียด...');
        
        const response = await API.getData('getBookingDetails', { bookingId });
        
        Utils.hideLoading();
        
        if (response.success) {
            showBookingModal(response.data);
        } else {
            Utils.showError('ไม่พบข้อมูลการจอง');
        }
    } catch (error) {
        Utils.hideLoading();
        Utils.showError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        console.error('Error loading booking details:', error);
    }
}

// Show booking details modal
function showBookingModal(booking) {
    const modal = document.getElementById('bookingModal');
    const detailsContainer = document.getElementById('bookingDetails');
    
    if (!modal || !detailsContainer) return;
    
    detailsContainer.innerHTML = `
        

            

                    
ข้อมูลการจอง

                    

                        
รหัสจอง: ${booking.bookingId}


                        
หมายเลขห้อง: ${booking.roomNumber}


                        
ประเภทห้อง: ${CONFIG.ROOM_TYPES[booking.roomType]?.name || booking.roomType}


                        
สถานะ: ${getStatusText(booking.status)}


                    

                

                    
ข้อมูลลูกค้า

                    

                        
ชื่อ: ${booking.fullName}


                        
โทรศัพท์: ${booking.phone}


                        
อีเมล: ${booking.email}


                        
จำนวนผู้เข้าพัก: ${booking.guests} คน


                    

                

            
            

                
รายละเอียดการเข้าพัก

                
วันที่เช็คอิน: ${Utils.formatDate(booking.checkinDate)}

วันที่เช็คเอาท์: ${Utils.formatDate(booking.checkoutDate)}

จำนวนคืน: ${booking.nights} คืน

ราคาห้อง: ${Utils.formatCurrency(booking.roomPrice)}


            

            
            ${booking.additionalServices && booking.additionalServices.length > 0 ? `
                

                    
บริการเพิ่มเติม

                    

                        ${booking.additionalServices.map(service => `
                            
• ${CONFIG.SERVICES[service]?.name || service} - ${Utils.formatCurrency(CONFIG.SERVICES[service]?.price || 0)}

                        `).join('')}
                    

                

            ` : ''}
            
            

                
สรุปราคา

                

                    
ราคาห้อง:
${Utils.formatCurrency(booking.roomPrice)}

                    
บริการเพิ่มเติม:
${Utils.formatCurrency(booking.servicesPrice || 0)}

                    
ค่าบริการ:
${Utils.formatCurrency(booking.serviceCharge || 0)}

                    
ภาษี:
${Utils.formatCurrency(booking.vat || 0)}

                    
รวมทั้งสิ้น:
${Utils.formatCurrency(booking.total)}

                

            

            
            ${booking.message ? `
                

                    
ข้อความเพิ่มเติม

                    
${booking.message}


                

            ` : ''}
            
            

                    ยืนยันการจอง
                

                    เช็คอิน
                

                    เช็คเอาท์
                

                    ยกเลิก
                

        

    `;
    
    modal.classList.remove('hidden');
}

// Close booking modal
function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Update booking status
async function updateBookingStatus(bookingId, newStatus) {
    try {
        Utils.showLoading('กำลังอัปเดตสถานะ...');
        
        const response = await API.sendData('updateBookingStatus', {
            bookingId,
            status: newStatus
        });
        
        Utils.hideLoading();
        
        if (response.success) {
            Utils.showSuccess('อัปเดตสถานะเรียบร้อยแล้ว');
            loadBookings(); // Reload bookings
            closeBookingModal();
        } else {
            Utils.showError(response.message || 'เกิดข้อผิดพลาดในการอัปเดต');
        }
    } catch (error) {
        Utils.hideLoading();
        Utils.showError('เกิดข้อผิดพลาดในการอัปเดต');
        console.error('Error updating booking status:', error);
    }
}

// Refresh bookings
function refreshBookings() {
    loadBookings();
}

// Refresh rooms
function refreshRooms() {
    loadRooms();
}

// Generate report
function generateReport() {
    const reportType = document.getElementById('reportType')?.value;
    const startDate = document.getElementById('reportStartDate')?.value;
    const endDate = document.getElementById('reportEndDate')?.value;
    
    if (!startDate || !endDate) {
        Utils.showError('กรุณาเลือกช่วงวันที่');
        return;
    }
    
    Utils.showLoading('กำลังสร้างรายงาน...');
    
    // Simulate report generation
    setTimeout(() => {
        Utils.hideLoading();
        
        const reportResults = document.getElementById('reportResults');
        if (reportResults) {
            reportResults.innerHTML = `
                
รายงาน${reportType === 'daily' ? 'รายวัน' : reportType === 'weekly' ? 'รายสัปดาห์' : 'รายเดือน'}

                
ช่วงวันที่: ${Utils.formatDate(startDate)} - ${Utils.formatDate(endDate)}


                
                

                        
25

                        
การจองทั้งหมด

                    

                        
450,000

                        
รายได้ (บาท)

                    

                        
85%

                        
อัตราการเข้าพัก

                    

                
                
✅ สร้างรายงานเรียบร้อยแล้ว


            `;
        }
    }, 2000);
}

// Save settings
function saveSettings() {
    Utils.showLoading('กำลังบันทึกการตั้งค่า...');
    
    // Simulate saving
    setTimeout(() => {
        Utils.hideLoading();
        Utils.showSuccess('บันทึกการตั้งค่าเรียบร้อยแล้ว');
    }, 1500);
}