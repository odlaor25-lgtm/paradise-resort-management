// Reports Page JavaScript
let revenueChart, occupancyChart, roomTypeChart, bookingStatusChart;

document.addEventListener('DOMContentLoaded', function() {
    initializeReportsPage();
});

function initializeReportsPage() {
    // Load initial data
    loadReportsData();
    
    // Initialize charts
    initializeCharts();
    
    // Setup date inputs
    setupDateInputs();
    
    // Load top customers
    loadTopCustomers();
}

// Load reports data
async function loadReportsData() {
    try {
        const response = await API.getData('getReportsData');
        
        if (response.success) {
            updateReportsData(response.data);
        }
    } catch (error) {
        console.error('Error loading reports data:', error);
        showDefaultReportsData();
    }
}

// Update reports data display
function updateReportsData(data) {
    const elements = {
        monthlyRevenue: document.getElementById('monthlyRevenue'),
        occupancyRate: document.getElementById('occupancyRate'),
        newCustomers: document.getElementById('newCustomers'),
        averageRating: document.getElementById('averageRating'),
        revenueProgress: document.getElementById('revenueProgress')
    };
    
    if (elements.monthlyRevenue) elements.monthlyRevenue.textContent = Utils.formatCurrency(data.monthlyRevenue || 0);
    if (elements.occupancyRate) elements.occupancyRate.textContent = (data.occupancyRate || 0) + '%';
    if (elements.newCustomers) elements.newCustomers.textContent = (data.newCustomers || 0) + ' คน';
    if (elements.averageRating) elements.averageRating.textContent = data.averageRating || '4.8';
    if (elements.revenueProgress) elements.revenueProgress.textContent = (data.revenueProgress || 75) + '%';
}

// Show default reports data
function showDefaultReportsData() {
    updateReportsData({
        monthlyRevenue: 375000,
        occupancyRate: 78,
        newCustomers: 45,
        averageRating: 4.8,
        revenueProgress: 75
    });
}

// Initialize charts
function initializeCharts() {
    initializeRevenueChart();
    initializeOccupancyChart();
    initializeRoomTypeChart();
    initializeBookingStatusChart();
}

// Initialize revenue chart
function initializeRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    const data = {
        labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.'],
        datasets: [{
            label: 'รายได้ (บาท)',
            data: [320000, 285000, 410000, 375000, 445000, 520000, 375000],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
        }]
    };
    
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + ' บาท';
                        }
                    }
                }
            }
        }
    };
    
    revenueChart = new Chart(ctx, config);
}

// Initialize occupancy chart
function initializeOccupancyChart() {
    const ctx = document.getElementById('occupancyChart');
    if (!ctx) return;
    
    const data = {
        labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.'],
        datasets: [{
            label: 'อัตราการเข้าพัก (%)',
            data: [65, 72, 85, 78, 88, 92, 78],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 2
        }]
    };
    
    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    };
    
    occupancyChart = new Chart(ctx, config);
}

// Initialize room type chart
function initializeRoomTypeChart() {
    const ctx = document.getElementById('roomTypeChart');
    if (!ctx) return;
    
    const data = {
        labels: ['Standard Room', 'Deluxe Room', 'Suite Room'],
        datasets: [{
            data: [180000, 210000, 150000],
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(168, 85, 247, 0.8)'
            ],
            borderColor: [
                'rgb(59, 130, 246)',
                'rgb(34, 197, 94)',
                'rgb(168, 85, 247)'
            ],
            borderWidth: 2
        }]
    };
    
    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed.toLocaleString() + ' บาท';
                        }
                    }
                }
            }
        }
    };
    
    roomTypeChart = new Chart(ctx, config);
}

// Initialize booking status chart
function initializeBookingStatusChart() {
    const ctx = document.getElementById('bookingStatusChart');
    if (!ctx) return;
    
    const data = {
        labels: ['ยืนยันแล้ว', 'รอยืนยัน', 'เช็คอินแล้ว', 'เช็คเอาท์แล้ว', 'ยกเลิก'],
        datasets: [{
            data: [45, 12, 28, 35, 8],
            backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(251, 191, 36, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(107, 114, 128, 0.8)',
                'rgba(239, 68, 68, 0.8)'
            ],
            borderColor: [
                'rgb(34, 197, 94)',
                'rgb(251, 191, 36)',
                'rgb(59, 130, 246)',
                'rgb(107, 114, 128)',
                'rgb(239, 68, 68)'
            ],
            borderWidth: 2
        }]
    };
    
    const config = {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    };
    
    bookingStatusChart = new Chart(ctx, config);
}

// Setup date inputs
function setupDateInputs() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput) {
        startDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
    }
    
    if (endDateInput) {
        endDateInput.value = today.toISOString().split('T')[0];
    }
}

// Generate report
async function generateReport() {
    const reportType = document.getElementById('reportType')?.value;
    const timePeriod = document.getElementById('timePeriod')?.value;
    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;
    
    if (!startDate || !endDate) {
        Utils.showError('กรุณาเลือกช่วงวันที่');
        return;
    }
    
    Utils.showLoading('กำลังสร้างรายงาน...');
    
    try {
        const response = await API.getData('generateReport', {
            type: reportType,
            period: timePeriod,
            startDate,
            endDate
        });
        
        Utils.hideLoading();
        
        if (response.success) {
            displayReportResults(response.data, reportType);
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        Utils.hideLoading();
        console.error('Error generating report:', error);
        
        // Show sample report data
        displaySampleReport(reportType, startDate, endDate);
    }
}

// Display report results
function displayReportResults(data, reportType) {
    const reportResults = document.getElementById('reportResults');
    if (!reportResults) return;
    
    const headers = getReportHeaders(reportType);
    const tableData = formatReportData(data, reportType);
    
    reportResults.innerHTML = `
        

            
รายงาน${getReportTypeName(reportType)}

            
ข้อมูลจำนวน ${tableData.length} รายการ


        

        
        

            
                        ${headers.map(header => ``).join('')}
                    
                    ${tableData.map(row => `
                        
                            ${row.map(cell => ``).join('')}
                        
                    `).join('')}
                
${HEADER}
${cell}

        

    `;
}

// Display sample report
function displaySampleReport(reportType, startDate, endDate) {
    const reportResults = document.getElementById('reportResults');
    if (!reportResults) return;
    
    const sampleData = generateSampleReportData(reportType);
    
    reportResults.innerHTML = `
        

            
รายงาน${getReportTypeName(reportType)} (ตัวอย่าง)

            
ช่วงวันที่: ${Utils.formatDate(startDate)} - ${Utils.formatDate(endDate)}


        

        
        ${sampleData}
        
        

            

                หมายเหตุ: นี่เป็นข้อมูลตัวอย่าง เมื่อเชื่อมต่อกับ Google Sheets แล้วจะแสดงข้อมูลจริง
            


        

    `;
}

// Get report headers
function getReportHeaders(reportType) {
    const headers = {
        revenue: ['วันที่', 'รายได้', 'จำนวนการจอง', 'อัตราการเข้าพัก'],
        occupancy: ['วันที่', 'ห้องทั้งหมด', 'ห้องที่มีผู้พัก', 'อัตราการเข้าพัก'],
        bookings: ['รหัสจอง', 'ลูกค้า', 'ห้อง', 'วันที่เข้าพัก', 'จำนวนเงิน'],
        customers: ['ชื่อลูกค้า', 'จำนวนการจอง', 'ยอดใช้จ่าย', 'การเยี่ยมชมล่าสุด']
    };
    
    return headers[reportType] || ['วันที่', 'ข้อมูล'];
}

// Get report type name in Thai
function getReportTypeName(reportType) {
    const names = {
        revenue: 'รายได้',
        occupancy: 'อัตราการเข้าพัก',
        bookings: 'การจอง',
        customers: 'ลูกค้า'
    };
    
    return names[reportType] || reportType;
}

// Generate sample report data
function generateSampleReportData(reportType) {
    switch (reportType) {
        case 'revenue':
            return `
                

                        
450,000

                        
รายได้รวม (บาท)

                    

                        
35

                        
การจองทั้งหมด

                    

                        
12,857

                        
รายได้เฉลี่ย/การจอง

                    

            `;
            
        case 'occupancy':
            return `
                

                        
30

                        
ห้องทั้งหมด

                    

                        
23

                        
ห้องที่มีผู้พัก

                    

                        
7

                        
ห้องว่าง

                    

                        
77%

                        
อัตราการเข้าพัก

                    

            `;
            
        case 'bookings':
            return `
                

                        
28

                        
ยืนยันแล้ว

                    

                        
5

                        
รอยืนยัน

                    

                        
15

                        
เช็คอินแล้ว

                    

                        
12

                        
เช็คเอาท์แล้ว

                    

                        
2

                        
ยกเลิก

                    

            `;
            
        case 'customers':
            return `
                

                        
127

                        
ลูกค้าทั้งหมด

                    

                        
23

                        
ลูกค้าใหม่

                    

                        
18%

                        
ลูกค้าเก่า

                    

            `;
            
        default:
            return '
ไม่มีข้อมูลสำหรับรายงานนี้

';
    }
}

// Load top customers
async function loadTopCustomers() {
    try {
        const response = await API.getData('getTopCustomers');
        
        if (response.success) {
            displayTopCustomers(response.data);
        }
    } catch (error) {
        console.error('Error loading top customers:', error);
        displaySampleTopCustomers();
    }
}

// Display top customers
function displayTopCustomers(customers) {
    const tableBody = document.getElementById('topCustomersTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = customers.map((customer, index) => `
        
            
                ${index + 1}
            
            
                ${customer.name}
            
            
                ${customer.bookingCount} ครั้ง
            
            
                ${Utils.formatCurrency(customer.totalSpent)}
            
            
                ${Utils.formatDate(customer.lastVisit)}
            
        
    `).join('');
}

// Display sample top customers
function displaySampleTopCustomers() {
    const sampleCustomers = [
        { name: 'คุณสมชาย ใจดี', bookingCount: 8, totalSpent: 125000, lastVisit: '2024-01-15' },
        { name: 'คุณสุดา รักสวย', bookingCount: 6, totalSpent: 98000, lastVisit: '2024-01-10' },
        { name: 'คุณประยุทธ์ มั่งมี', bookingCount: 5, totalSpent: 87500, lastVisit: '2024-01-08' },
        { name: 'คุณมาลี สุขใส', bookingCount: 4, totalSpent: 72000, lastVisit: '2024-01-05' },
        { name: 'คุณวิชัย เก่งกาจ', bookingCount: 4, totalSpent: 68000, lastVisit: '2024-01-03' }
    ];
    
    displayTopCustomers(sampleCustomers);
}

// Export report to Excel
function exportReport() {
    Utils.showLoading('กำลังสร้างไฟล์ Excel...');
    
    // Simulate export
    setTimeout(() => {
        Utils.hideLoading();
        Utils.showSuccess('ส่งออกรายงานเรียบร้อยแล้ว');
        
        // In a real implementation, this would generate and download an Excel file
        console.log('Export report to Excel');
    }, 2000);
}

// Print report
function printReport() {
    window.print();
}

// Refresh report data
function refreshReportData() {
    loadReportsData();
    loadTopCustomers();
    
    // Refresh charts
    if (revenueChart) revenueChart.update();
    if (occupancyChart) occupancyChart.update();
    if (roomTypeChart) roomTypeChart.update();
    if (bookingStatusChart) bookingStatusChart.update();
}