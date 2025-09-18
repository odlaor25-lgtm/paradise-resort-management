/**
 * Paradise Resort Management System
 * Google Apps Script Backend
 * Complete CRUD Operations with Email Integration
 */

// Configuration
const CONFIG = {
  SPREADSHEET_ID: '1cD0psRdm293TODMDWB4IY88h-PTs2E2nyB6ba_7s_MA',
  SHEETS: {
    BOOKINGS: 'Bookings',
    ROOMS: 'Rooms',
    CUSTOMERS: 'Customers',
    SETTINGS: 'Settings'
  },
  EMAIL: {
    FROM: 'odlaor25@gmail.com',
    SUBJECT_PREFIX: '[Paradise Resort]'
  },
  ROOM_TYPES: {
    standard: { name: 'Standard Room', price: 2500, capacity: 2, size: 25 },
    deluxe: { name: 'Deluxe Room', price: 3500, capacity: 3, size: 35 },
    suite: { name: 'Suite Room', price: 5000, capacity: 4, size: 50 }
  },
  SERVICES: {
    breakfast: { name: 'อาหารเช้า', price: 300 },
    airport: { name: 'รับส่งสนามบิน', price: 800 },
    spa: { name: 'แพ็คเกจสปา', price: 1500 },
    tour: { name: 'ทัวร์เกาะ', price: 2000 }
  }
};

/**
 * Main entry point for web app
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    switch (action) {
      case 'getRoomAvailability':
        return createResponse(getRoomAvailability());
      case 'getRecentBookingsCount':
        return createResponse(getRecentBookingsCount());
      case 'getDashboardStats':
        return createResponse(getDashboardStats());
      case 'getBookings':
        return createResponse(getBookings());
      case 'getBookingDetails':
        return createResponse(getBookingDetails(e.parameter.bookingId));
      case 'getRooms':
        return createResponse(getRooms());
      case 'getReportsData':
        return createResponse(getReportsData());
      case 'generateReport':
        return createResponse(generateReport(e.parameter));
      case 'getTopCustomers':
        return createResponse(getTopCustomers());
      default:
        return createResponse({ message: 'Invalid action' }, false);
    }
  } catch (error) {
    console.error('doGet Error:', error);
    return createResponse({ message: error.toString() }, false);
  }
}

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch (action) {
      case 'createBooking':
        return createResponse(createBooking(data.data));
      case 'updateBookingStatus':
        return createResponse(updateBookingStatus(data.data));
      case 'updateRoomStatus':
        return createResponse(updateRoomStatus(data.data));
      case 'sendEmail':
        return createResponse(sendEmail(data.data));
      default:
        return createResponse({ message: 'Invalid action' }, false);
    }
  } catch (error) {
    console.error('doPost Error:', error);
    return createResponse({ message: error.toString() }, false);
  }
}

/**
 * Create standardized response
 */
function createResponse(data, success = true) {
  const response = {
    success: success,
    data: success ? data : null,
    message: success ? 'Success' : (data.message || 'Error occurred'),
    timestamp: new Date().toISOString()
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

/**
 * Handle OPTIONS requests for CORS
 */
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

/**
 * Get or create spreadsheet
 */
function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  } catch (error) {
    console.error('Spreadsheet not found, creating new one...');
    const ss = SpreadsheetApp.create('Paradise Resort Data');
    console.log('New spreadsheet created with ID:', ss.getId());
    initializeSheets(ss);
    return ss;
  }
}

/**
 * Initialize sheets with headers
 */
function initializeSheets(spreadsheet) {
  // Bookings Sheet
  const bookingsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.BOOKINGS) || 
                       spreadsheet.insertSheet(CONFIG.SHEETS.BOOKINGS);
  if (bookingsSheet.getLastRow() === 0) {
    bookingsSheet.getRange(1, 1, 1, 20).setValues([[
      'Booking ID', 'Full Name', 'Phone', 'Email', 'Check-in Date', 'Check-out Date',
      'Room Type', 'Room Number', 'Guests', 'Nights', 'Room Price', 'Services Price',
      'Service Charge', 'VAT', 'Total', 'Additional Services', 'Message', 'Status',
      'Created At', 'Updated At'
    ]]);
  }
  
  // Rooms Sheet
  const roomsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.ROOMS) || 
                    spreadsheet.insertSheet(CONFIG.SHEETS.ROOMS);
  if (roomsSheet.getLastRow() === 0) {
    roomsSheet.getRange(1, 1, 1, 6).setValues([[
      'Room Number', 'Room Type', 'Status', 'Current Guest', 'Check-in Date', 'Check-out Date'
    ]]);
    
    // Initialize sample rooms
    initializeSampleRooms(roomsSheet);
  }
  
  // Customers Sheet
  const customersSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.CUSTOMERS) || 
                        spreadsheet.insertSheet(CONFIG.SHEETS.CUSTOMERS);
  if (customersSheet.getLastRow() === 0) {
    customersSheet.getRange(1, 1, 1, 8).setValues([[
      'Customer ID', 'Full Name', 'Phone', 'Email', 'Total Bookings', 'Total Spent',
      'Last Visit', 'Created At'
    ]]);
  }
  
  // Settings Sheet
  const settingsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.SETTINGS) || 
                       spreadsheet.insertSheet(CONFIG.SHEETS.SETTINGS);
  if (settingsSheet.getLastRow() === 0) {
    settingsSheet.getRange(1, 1, 1, 3).setValues([['Setting', 'Value', 'Updated At']]);
  }
}

/**
 * Initialize sample rooms
 */
function initializeSampleRooms(sheet) {
  const rooms = [];
  
  // Standard rooms (101-110)
  for (let i = 1; i <= 10; i++) {
    rooms.push([`1${i.toString().padStart(2, '0')}`, 'standard', 'available', '', '', '']);
  }
  
  // Deluxe rooms (201-210)
  for (let i = 1; i <= 10; i++) {
    rooms.push([`2${i.toString().padStart(2, '0')}`, 'deluxe', 'available', '', '', '']);
  }
  
  // Suite rooms (301-310)
  for (let i = 1; i <= 10; i++) {
    rooms.push([`3${i.toString().padStart(2, '0')}`, 'suite', 'available', '', '', '']);
  }
  
  if (rooms.length > 0) {
    sheet.getRange(2, 1, rooms.length, 6).setValues(rooms);
  }
}

/**
 * Create new booking
 */
function createBooking(bookingData) {
  try {
    const spreadsheet = getSpreadsheet();
    const bookingsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.BOOKINGS);
    const roomsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.ROOMS);
    
    // Generate booking ID if not provided
    if (!bookingData.bookingId) {
      bookingData.bookingId = generateBookingId();
    }
    
    // Find available room
    const roomNumber = findAvailableRoom(roomsSheet, bookingData.roomType, bookingData.checkinDate, bookingData.checkoutDate);
    if (!roomNumber) {
      throw new Error('ไม่มีห้องว่างในช่วงวันที่ที่เลือก');
    }
    
    bookingData.roomNumber = roomNumber;
    
    // Prepare booking data
    const now = new Date().toISOString();
    const rowData = [
      bookingData.bookingId,
      bookingData.fullName,
      bookingData.phone,
      bookingData.email,
      bookingData.checkinDate,
      bookingData.checkoutDate,
      bookingData.roomType,
      bookingData.roomNumber,
      bookingData.guests,
      bookingData.nights,
      bookingData.roomPrice,
      bookingData.servicesPrice || 0,
      bookingData.serviceCharge || 0,
      bookingData.vat || 0,
      bookingData.total,
      JSON.stringify(bookingData.additionalServices || []),
      bookingData.message || '',
      bookingData.status || 'pending',
      now,
      now
    ];
    
    // Add booking to sheet
    bookingsSheet.appendRow(rowData);
    
    // Update room status
    updateRoomStatusInSheet(roomsSheet, roomNumber, 'reserved', bookingData.fullName, bookingData.checkinDate, bookingData.checkoutDate);
    
    // Update customer data
    updateCustomerData(spreadsheet, bookingData);
    
    // Send confirmation email
    try {
      sendBookingConfirmationEmail(bookingData);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the booking if email fails
    }
    
    return {
      bookingId: bookingData.bookingId,
      roomNumber: bookingData.roomNumber,
      message: 'การจองสำเร็จแล้ว'
    };
    
  } catch (error) {
    console.error('Create booking error:', error);
    throw error;
  }
}

/**
 * Find available room
 */
function findAvailableRoom(roomsSheet, roomType, checkinDate, checkoutDate) {
  const data = roomsSheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const roomNumber = row[0];
    const type = row[1];
    const status = row[2];
    const currentCheckin = row[4];
    const currentCheckout = row[5];
    
    if (type === roomType && (status === 'available' || isRoomAvailableForDates(status, currentCheckin, currentCheckout, checkinDate, checkoutDate))) {
      return roomNumber;
    }
  }
  
  return null;
}

/**
 * Check if room is available for specific dates
 */
function isRoomAvailableForDates(status, currentCheckin, currentCheckout, newCheckin, newCheckout) {
  if (status === 'available') return true;
  if (status === 'maintenance' || status === 'cleaning') return false;
  
  if (!currentCheckin || !currentCheckout) return true;
  
  const currentCheckinDate = new Date(currentCheckin);
  const currentCheckoutDate = new Date(currentCheckout);
  const newCheckinDate = new Date(newCheckin);
  const newCheckoutDate = new Date(newCheckout);
  
  // Check if dates don't overlap
  return (newCheckoutDate <= currentCheckinDate) || (newCheckinDate >= currentCheckoutDate);
}

/**
 * Update room status in sheet
 */
function updateRoomStatusInSheet(sheet, roomNumber, status, guestName = '', checkinDate = '', checkoutDate = '') {
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === roomNumber) {
      sheet.getRange(i + 1, 3).setValue(status); // Status
      sheet.getRange(i + 1, 4).setValue(guestName); // Current Guest
      sheet.getRange(i + 1, 5).setValue(checkinDate); // Check-in Date
      sheet.getRange(i + 1, 6).setValue(checkoutDate); // Check-out Date
      break;
    }
  }
}

/**
 * Update customer data
 */
function updateCustomerData(spreadsheet, bookingData) {
  const customersSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.CUSTOMERS);
  const data = customersSheet.getDataRange().getValues();
  
  let customerFound = false;
  
  // Look for existing customer
  for (let i = 1; i < data.length; i++) {
    if (data[i][3] === bookingData.email) { // Email column
      // Update existing customer
      const currentBookings = data[i][4] || 0;
      const currentSpent = data[i][5] || 0;
      
      customersSheet.getRange(i + 1, 5).setValue(currentBookings + 1); // Total Bookings
      customersSheet.getRange(i + 1, 6).setValue(currentSpent + bookingData.total); // Total Spent
      customersSheet.getRange(i + 1, 7).setValue(new Date().toISOString()); // Last Visit
      
      customerFound = true;
      break;
    }
  }
  
  // Add new customer if not found
  if (!customerFound) {
    const customerId = 'CUST' + Date.now().toString().slice(-6);
    const now = new Date().toISOString();
    
    customersSheet.appendRow([
      customerId,
      bookingData.fullName,
      bookingData.phone,
      bookingData.email,
      1, // Total Bookings
      bookingData.total, // Total Spent
      now, // Last Visit
      now // Created At
    ]);
  }
}

/**
 * Send booking confirmation email
 */
function sendBookingConfirmationEmail(bookingData) {
  const subject = `${CONFIG.EMAIL.SUBJECT_PREFIX} ยืนยันการจอง - ${bookingData.bookingId}`;
  
  const htmlBody = `
    

      

        
🏖️ Paradise Resort

        
ยืนยันการจองห้องพัก


      

      
      

        
สวัสดีคุณ ${bookingData.fullName}

        
ขอบคุณที่เลือกใช้บริการ Paradise Resort เราได้รับการจองของคุณเรียบร้อยแล้ว


        
        

          
รายละเอียดการจอง

          
รหัสการจอง:	${bookingData.bookingId}
หมายเลขห้อง:	${bookingData.roomNumber}
ประเภทห้อง:	${CONFIG.ROOM_TYPES[bookingData.roomType]?.name || bookingData.roomType}
วันที่เข้าพัก:	${formatThaiDate(bookingData.checkinDate)}
วันที่ออก:	${formatThaiDate(bookingData.checkoutDate)}
จำนวนคืน:	${bookingData.nights} คืน
จำนวนผู้เข้าพัก:	${bookingData.guests} คน

        

        
        

          
สรุปค่าใช้จ่าย

          
            ${bookingData.servicesPrice > 0 ? `
            
            ` : ''}
            
ค่าห้องพัก:	${formatCurrency(bookingData.roomPrice)}
บริการเพิ่มเติม:	${formatCurrency(bookingData.servicesPrice)}
ค่าบริการ:	${formatCurrency(bookingData.serviceCharge || 0)}
ภาษี:	${formatCurrency(bookingData.vat || 0)}
รวมทั้งสิ้น:	${formatCurrency(bookingData.total)}

        

        
        

          

            ✅ การจองของคุณอยู่ในสถานะ "รอยืนยัน" เราจะติดต่อกลับภายใน 24 ชั่วโมง
          


        

        
        

          
หากมีคำถามเพิ่มเติม กรุณาติดต่อ:


          
📞 02-123-4567


          
📧 ${CONFIG.EMAIL.FROM}


        

      

      
      

        
© 2024 Paradise Resort. All rights reserved.


      

    

  `;
  
  MailApp.sendEmail({
    to: bookingData.email,
    subject: subject,
    htmlBody: htmlBody
  });
  
  // Send copy to resort
  MailApp.sendEmail({
    to: CONFIG.EMAIL.FROM,
    subject: `[New Booking] ${bookingData.bookingId} - ${bookingData.fullName}`,
    htmlBody: htmlBody
  });
}

/**
 * Get room availability
 */
function getRoomAvailability() {
  try {
    const spreadsheet = getSpreadsheet();
    const roomsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.ROOMS);
    const data = roomsSheet.getDataRange().getValues();
    
    const availability = {
      standard: 0,
      deluxe: 0,
      suite: 0
    };
    
    for (let i = 1; i < data.length; i++) {
      const roomType = data[i][1];
      const status = data[i][2];
      
      if (status === 'available' && availability.hasOwnProperty(roomType)) {
        availability[roomType]++;
      }
    }
    
    return availability;
  } catch (error) {
    console.error('Get room availability error:', error);
    return { standard: 0, deluxe: 0, suite: 0 };
  }
}

/**
 * Get recent bookings count
 */
function getRecentBookingsCount() {
  try {
    const spreadsheet = getSpreadsheet();
    const bookingsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.BOOKINGS);
    const data = bookingsSheet.getDataRange().getValues();
    
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    let count = 0;
    for (let i = 1; i < data.length; i++) {
      const createdAt = new Date(data[i][18]); // Created At column
      if (createdAt >= thirtyDaysAgo) {
        count++;
      }
    }
    
    return { count: count };
  } catch (error) {
    console.error('Get recent bookings count error:', error);
    return { count: 0 };
  }
}

/**
 * Get dashboard statistics
 */
function getDashboardStats() {
  try {
    const spreadsheet = getSpreadsheet();
    const bookingsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.BOOKINGS);
    const roomsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.ROOMS);
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Get bookings data
    const bookingsData = bookingsSheet.getDataRange().getValues();
    let todayBookings = 0;
    let todayRevenue = 0;
    let currentGuests = 0;
    
    for (let i = 1; i < bookingsData.length; i++) {
      const createdAt = new Date(bookingsData[i][18]).toISOString().split('T')[0];
      const checkinDate = bookingsData[i][4];
      const checkoutDate = bookingsData[i][5];
      const status = bookingsData[i][17];
      const total = bookingsData[i][14] || 0;
      
      // Today's bookings
      if (createdAt === todayStr) {
        todayBookings++;
        todayRevenue += parseFloat(total);
      }
      
      // Current guests
      if (status === 'checkedin' && checkinDate <= todayStr && checkoutDate > todayStr) {
        currentGuests += parseInt(bookingsData[i][8]) || 0; // Guests count
      }
    }
    
    // Get available rooms
    const roomsData = roomsSheet.getDataRange().getValues();
    let availableRooms = 0;
    
    for (let i = 1; i < roomsData.length; i++) {
      if (roomsData[i][2] === 'available') {
        availableRooms++;
      }
    }
    
    return {
      todayBookings,
      availableRooms,
      currentGuests,
      todayRevenue
    };
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return {
      todayBookings: 0,
      availableRooms: 0,
      currentGuests: 0,
      todayRevenue: 0
    };
  }
}

/**
 * Get all bookings
 */
function getBookings() {
  try {
    const spreadsheet = getSpreadsheet();
    const bookingsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.BOOKINGS);
    const data = bookingsSheet.getDataRange().getValues();
    
    if (data.length <= 1) return [];
    
    const bookings = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      bookings.push({
        bookingId: row[0],
        fullName: row[1],
        phone: row[2],
        email: row[3],
        checkinDate: row[4],
        checkoutDate: row[5],
        roomType: row[6],
        roomNumber: row[7],
        guests: row[8],
        nights: row[9],
        roomPrice: row[10],
        servicesPrice: row[11],
        serviceCharge: row[12],
        vat: row[13],
        total: row[14],
        additionalServices: JSON.parse(row[15] || '[]'),
        message: row[16],
        status: row[17],
        createdAt: row[18],
        updatedAt: row[19]
      });
    }
    
    // Sort by creation date (newest first)
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return bookings;
  } catch (error) {
    console.error('Get bookings error:', error);
    return [];
  }
}

/**
 * Get booking details
 */
function getBookingDetails(bookingId) {
  try {
    const bookings = getBookings();
    const booking = bookings.find(b => b.bookingId === bookingId);
    
    if (!booking) {
      throw new Error('ไม่พบข้อมูลการจอง');
    }
    
    return booking;
  } catch (error) {
    console.error('Get booking details error:', error);
    throw error;
  }
}

/**
 * Update booking status
 */
function updateBookingStatus(data) {
  try {
    const { bookingId, status } = data;
    const spreadsheet = getSpreadsheet();
    const bookingsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.BOOKINGS);
    const bookingsData = bookingsSheet.getDataRange().getValues();
    
    for (let i = 1; i < bookingsData.length; i++) {
      if (bookingsData[i][0] === bookingId) {
        // Update status and timestamp
        bookingsSheet.getRange(i + 1, 18).setValue(status); // Status column
        bookingsSheet.getRange(i + 1, 20).setValue(new Date().toISOString()); // Updated At column
        
        // Update room status based on booking status
        const roomNumber = bookingsData[i][7];
        const roomsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.ROOMS);
        
        let roomStatus = 'available';
        if (status === 'confirmed' || status === 'pending') {
          roomStatus = 'reserved';
        } else if (status === 'checkedin') {
          roomStatus = 'occupied';
        } else if (status === 'cancelled') {
          roomStatus = 'available';
        }
        
        updateRoomStatusInSheet(roomsSheet, roomNumber, roomStatus);
        
        return { message: 'อัปเดตสถานะเรียบร้อยแล้ว' };
      }
    }
    
    throw new Error('ไม่พบการจอง');
  } catch (error) {
    console.error('Update booking status error:', error);
    throw error;
  }
}

/**
 * Get rooms data
 */
function getRooms() {
  try {
    const spreadsheet = getSpreadsheet();
    const roomsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.ROOMS);
    const data = roomsSheet.getDataRange().getValues();
    
    if (data.length <= 1) return [];
    
    const rooms = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      rooms.push({
        number: row[0],
        type: row[1],
        status: row[2],
        currentGuest: row[3],
        checkinDate: row[4],
        checkoutDate: row[5]
      });
    }
    
    return rooms;
  } catch (error) {
    console.error('Get rooms error:', error);
    return [];
  }
}

/**
 * Get reports data
 */
function getReportsData() {
  try {
    const spreadsheet = getSpreadsheet();
    const bookingsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.BOOKINGS);
    const data = bookingsSheet.getDataRange().getValues();
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    let monthlyRevenue = 0;
    let totalBookings = 0;
    let occupiedRooms = 0;
    let newCustomers = 0;
    
    for (let i = 1; i < data.length; i++) {
      const createdAt = new Date(data[i][18]);
      const total = parseFloat(data[i][14]) || 0;
      const status = data[i][17];
      
      if (createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear) {
        monthlyRevenue += total;
        totalBookings++;
        
        if (status === 'checkedin') {
          occupiedRooms++;
        }
      }
    }
    
    // Calculate occupancy rate (assuming 30 total rooms)
    const totalRooms = 30;
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);
    
    // Get new customers count (simplified)
    const customersSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.CUSTOMERS);
    const customersData = customersSheet.getDataRange().getValues();
    
    for (let i = 1; i < customersData.length; i++) {
      const createdAt = new Date(customersData[i][7]);
      if (createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear) {
        newCustomers++;
      }
    }
    
    return {
      monthlyRevenue,
      occupancyRate,
      newCustomers,
      averageRating: 4.8, // Static for now
      revenueProgress: Math.min(Math.round((monthlyRevenue / 500000) * 100), 100)
    };
  } catch (error) {
    console.error('Get reports data error:', error);
    return {
      monthlyRevenue: 0,
      occupancyRate: 0,
      newCustomers: 0,
      averageRating: 4.8,
      revenueProgress: 0
    };
  }
}

/**
 * Generate report
 */
function generateReport(params) {
  try {
    const { type, period, startDate, endDate } = params;
    
    // This is a simplified version - you can expand based on requirements
    const spreadsheet = getSpreadsheet();
    const bookingsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.BOOKINGS);
    const data = bookingsSheet.getDataRange().getValues();
    
    const reportData = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let i = 1; i < data.length; i++) {
      const createdAt = new Date(data[i][18]);
      
      if (createdAt >= start && createdAt <= end) {
        reportData.push({
          bookingId: data[i][0],
          customerName: data[i][1],
          roomNumber: data[i][7],
          checkinDate: data[i][4],
          total: data[i][14],
          status: data[i][17]
        });
      }
    }
    
    return reportData;
  } catch (error) {
    console.error('Generate report error:', error);
    return [];
  }
}

/**
 * Get top customers
 */
function getTopCustomers() {
  try {
    const spreadsheet = getSpreadsheet();
    const customersSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.CUSTOMERS);
    const data = customersSheet.getDataRange().getValues();
    
    if (data.length <= 1) return [];
    
    const customers = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      customers.push({
        name: row[1],
        bookingCount: row[4] || 0,
        totalSpent: row[5] || 0,
        lastVisit: row[6]
      });
    }
    
    // Sort by total spent (descending)
    customers.sort((a, b) => b.totalSpent - a.totalSpent);
    
    // Return top 10
    return customers.slice(0, 10);
  } catch (error) {
    console.error('Get top customers error:', error);
    return [];
  }
}

/**
 * Utility Functions
 */

function generateBookingId() {
  const prefix = 'PR';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${prefix}${timestamp}${random}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('th-TH').format(amount) + ' บาท';
}

function formatThaiDate(dateString) {
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  const date = new Date(dateString);
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543; // Convert to Buddhist Era
  
  return `${day} ${month} ${year}`;
}

/**
 * Test function - can be removed in production
 */
function testFunction() {
  console.log('Paradise Resort Backend is working!');
  return 'Test successful';
}