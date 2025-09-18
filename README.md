# 🌴 Paradise Resort Website

เว็บไซต์สำหรับ **รีสอร์ท** รองรับ:
- หน้าแรก (index.html)
- ระบบจองห้องพัก (booking.html)
- ข้อมูลห้องพัก (rooms.html)
- ระบบติดต่อ (contact.html)
- Dashboard ผู้ดูแล (admin.html)
- ระบบรายงานพร้อมกราฟ (reports.html)

---

## 📂 โครงสร้างไฟล์

```
paradise-resort/
├── index.html
├── booking.html
├── contact.html
├── rooms.html
├── admin.html
├── reports.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── main.js
│       ├── booking.js
│       ├── rooms.js
│       ├── contact.js
│       ├── admin.js
│       ├── reports.js
│       └── google-drive-config.js
└── google-apps-script/
    └── Code.gs
```

---

## 🚀 วิธีใช้งาน

### 1. เปิดเว็บบนเครื่อง (Development)
- ติดตั้ง [VSCode](https://code.visualstudio.com/) + ส่วนขยาย **Live Server**
- คลิกขวาที่ `index.html` → เลือก **Open with Live Server**

### 2. Deploy ขึ้น GitHub Pages (Production)
1. สร้าง repo บน GitHub
2. อัปโหลดไฟล์ทั้งหมด (`paradise-resort/`)
3. ไปที่ **Settings → Pages**  
   เลือก branch `main` และ root `/`  
   กด Save → จะได้ URL เช่น  
   ```
   https://username.github.io/paradise-resort/
   ```

---

## 📊 การเชื่อมต่อ Google Sheets

### 1. สร้าง Google Spreadsheet
- ชื่อ Sheet: `Bookings` (สำหรับการจอง)
- ชื่อ Sheet: `Settings` (สำหรับตั้งค่า service charge, VAT)

### 2. เปิด Google Apps Script
- เข้าไปที่ **Extensions → Apps Script**
- คัดลอกโค้ดจาก `google-apps-script/Code.gs` ไปวาง
- กด Deploy → New Deployment → เลือก **Web App**
- Access: `Anyone with link`

### 3. นำ Web App URL มาใส่ในไฟล์
`assets/js/google-drive-config.js`
```javascript
const GOOGLE_APPS_SCRIPT_URL = "YOUR_DEPLOYED_WEBAPP_URL";
```

---

## ⚙️ คำแนะนำสำหรับ Tailwind CSS

ใน Production ไม่ควรใช้
```html
<script src="https://cdn.tailwindcss.com"></script>
```

ให้ใช้ไฟล์ที่ build แล้วแทน:
```html
<link rel="stylesheet" href="assets/css/styles.css">
```

---

## 👨‍💻 ผู้พัฒนา
- ระบบตัวอย่างโดย **Paradise Resort Project**
- คุณสามารถนำไปปรับใช้กับรีสอร์ทของคุณได้ทันที
