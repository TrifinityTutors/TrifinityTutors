# Tutor Profile & Verification System - Implementation Guide

## 📋 Overview
Complete tutor profile management system with CV upload, profile editing, and admin verification workflow.

## ✨ Features Implemented

### 1. **Tutor Profile Page** (`/tutor-profile`)
**Location:** `frontend/src/pages/TutorProfile.jsx`

Features:
- 📝 Edit profile information (name, subject, experience, phone, locality, hourly rate)
- 📄 CV upload and management
- 💬 Bio, qualifications, and teaching methodology sections
- 🛡️ Verification status display with badges
- ✅ Request verification button
- 🔄 Profile refresh and save functionality

### 2. **Backend Tutor Model Updates**
**Location:** `backend/models/Tutor.js`

New Fields Added:
```javascript
- bio: String
- qualifications: String
- teachingMethodology: String
- hourlyRate: Number
- cvFile: String (file path)
- cvFileName: String
- cvUploadedAt: Date
- verificationStatus: String (unverified, pending, verified, rejected)
- verifiedAt: Date
- verificationNotes: String
- verifiedBy: String (admin ID)
```

### 3. **Backend API Endpoints**
**Location:** `backend/routes/tutorRoutes.js`

New Endpoints:

#### Profile Management
- **GET** `/api/tutors/profile/:tutorId`
  - Fetch tutor profile
  
- **PUT** `/api/tutors/profile/:tutorId`
  - Update profile (name, bio, qualifications, etc.)
  - Payload: `{ name, bio, qualifications, teachingMethodology, hourlyRate, phone, locality, subject, experience }`

#### CV Upload
- **POST** `/api/tutors/upload-cv/:tutorId`
  - Upload CV file (supports PDF, DOC, DOCX, JPG, PNG)
  - Max file size: 5MB
  - Sets verification status to "pending" on successful upload
  - Returns: `{ cvFile, cvFileName, verificationStatus }`

- **GET** `/api/tutors/download-cv/:tutorId`
  - Download tutor's CV file

#### Verification
- **POST** `/api/tutors/request-verification/:tutorId`
  - Submit profile for verification
  - Requires CV to be uploaded
  - Payload: `{ bio, qualifications, teachingMethodology }`

- **GET** `/api/tutors/verifications/pending`
  - Admin endpoint: Get all pending verifications
  - Returns pending tutors with their details

- **PUT** `/api/tutors/verify/:tutorId`
  - Admin endpoint: Approve or reject verification
  - Payload: `{ verificationStatus: "verified" | "rejected", verificationNotes }`

### 4. **File Upload Configuration**
**Location:** `backend/middleware/fileUpload.js`

Features:
- Multer configuration for file uploads
- Automatic directory creation (`/uploads`)
- File size limit: 5MB
- Allowed types: PDF, DOC, DOCX, JPG, PNG
- Unique filename generation with timestamp

### 5. **Admin Verification Panel** (`/admin/verifications`)
**Location:** `frontend/src/admin/pages/Verifications.jsx`

Features:
- 📋 View all tutor verification requests
- 🔍 Filter by status (pending, verified, rejected, all)
- 📄 Download and view CV documents
- ✅ Approve/Reject with notes
- 📊 Status counters
- 🎯 Modal-based review interface

### 6. **Verification Badges**
Status indicators showing:
- ✓ Verified (green)
- ⏳ Pending Review (yellow)
- ✗ Rejected (red)
- ⭕ Unverified (gray)

## 🚀 Installation & Setup

### Step 1: Install Multer
```bash
cd backend
npm install multer
```

### Step 2: Update Server Configuration
The server is already configured to serve uploads:
```javascript
// server.js
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
```

### Step 3: Start the Application
```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📱 User Flow

### For Tutors:
1. **Login** → Go to Profile (👤 Profile in navbar)
2. **Edit Profile** → Update information and save
3. **Upload CV** → Select and upload CV file
4. **Request Verification** → Click "Request Verification" button
5. **Wait for Admin** → Status shows "Pending Review"
6. **Get Verified** → Status becomes "Verified" ✓

### For Admins:
1. **Login** → Admin Panel
2. **Navigate** → Verifications menu
3. **Review** → Click tutors to review CV and details
4. **Approve/Reject** → Add notes and submit decision
5. **View Status** → Filter by verification status

## 🔒 Verification Status Flow

```
Unverified
    ↓
User uploads CV → Pending
    ↓ (Admin reviews)
├─→ Verified ✓ (Profile visible with badge)
└─→ Rejected ✗ (Can re-upload and reapply)
```

## 📁 File Structure

**New/Modified Files:**

Backend:
```
backend/
├── models/
│   └── Tutor.js (UPDATED - added CV & verification fields)
├── routes/
│   └── tutorRoutes.js (UPDATED - added 8 new endpoints)
├── middleware/
│   └── fileUpload.js (NEW - multer configuration)
├── server.js (UPDATED - static uploads serving)
└── uploads/ (CREATED AUTOMATICALLY on first upload)
```

Frontend:
```
frontend/
├── src/
│   ├── pages/
│   │   ├── TutorProfile.jsx (NEW)
│   │   └── TutorProfile.css (NEW)
│   ├── admin/
│   │   ├── pages/
│   │   │   └── Verifications.jsx (NEW)
│   │   ├── components/
│   │   │   └── Sidebar.jsx (UPDATED - added verifications link)
│   │   └── styles/
│   │       └── AdminVerifications.css (NEW)
│   ├── components/
│   │   └── Navbar.jsx (UPDATED - added profile link)
│   └── App.jsx (UPDATED - added routes)
```

## 🎨 UI Components

### Tutor Profile Page
- Professional header with photo placeholder
- Edit mode for profile fields
- Separate CV upload section
- Verification status card
- Form validation

### Admin Verification Panel
- Grid layout with tutor cards
- Filter buttons for status
- Modal review interface
- CV download link
- Approve/Reject with notes

## 🔐 Security Features

- File type validation (only documents/images)
- File size limit (5MB)
- Authorization checks on admin endpoints
- Secure file download with proper MIME types

## 📊 Database Schema

### Tutor Model Updates
```javascript
{
  // Existing fields
  name, email, password, subject, locality, experience, phone,
  status, googleId, photo, profileComplete,
  
  // NEW FIELDS
  bio: String,
  qualifications: String,
  teachingMethodology: String,
  hourlyRate: Number,
  cvFile: String,
  cvFileName: String,
  cvUploadedAt: Date,
  verificationStatus: enum['unverified', 'pending', 'verified', 'rejected'],
  verifiedAt: Date,
  verificationNotes: String,
  verifiedBy: String,
  
  timestamps: true
}
```

## ⚙️ Configuration

### File Upload Limits
- Max file size: 5MB
- Allowed formats: PDF, DOC, DOCX, JPG, PNG

### Upload Directory
- Path: `backend/uploads/`
- Served at: `http://localhost:5000/uploads/`

## 🧪 Testing the Feature

### Test Scenario 1: Upload CV
1. Login as tutor
2. Go to Profile
3. Select a PDF file and upload
4. Verify status changes to "Pending Review"
5. Check `/uploads` folder for the file

### Test Scenario 2: Request Verification
1. Upload CV (if not done)
2. Fill profile details
3. Click "Request Verification"
4. Verify admin can see it in Verifications page

### Test Scenario 3: Admin Approval
1. Login as admin
2. Go to Verifications
3. Review tutor details
4. Click "Review" button
5. Add notes and approve/reject
6. Verify status updates

## 🐛 Troubleshooting

### Issue: Multer not found
**Solution:** Run `npm install multer` in backend folder

### Issue: Uploads folder not created
**Solution:** It will be created automatically on first upload. Ensure backend has write permissions.

### Issue: File upload fails
**Solution:** Check file size (<5MB) and type (PDF, DOC, DOCX, JPG, PNG)

### Issue: CV not downloading
**Solution:** Ensure file path is correct in database and file exists in `/uploads`

## 📈 Future Enhancements

1. **Email Notifications**
   - Notify tutors when verification status changes
   - Notify admins of new verification requests

2. **Profile Completion Score**
   - Show percentage of profile completion
   - Suggest what's missing

3. **Bulk Verification**
   - Admin can approve/reject multiple tutors at once

4. **Verification History**
   - Track all verification attempts and decisions
   - Show reasons for rejection

5. **Certificate Upload**
   - Support multiple certificate uploads
   - Display verified certifications on profile

6. **Background Check Integration**
   - Connect to background check services
   - Auto-verify based on results

## 📞 Support

For any issues or questions, check the console logs:
- Backend logs show file upload details
- Frontend console shows API responses
- Admin verification modal shows current status

---

**Status:** ✅ Ready for Testing
**Next Step:** Install multer and run the application
