# Astrology API Documentation

## Base URL
```
http://localhost:5001
```

---

## Authentication Endpoints

### 1. Signup - Create New Account
```
POST /api/auth/signup
```

Create a new user account for authentication.

**Request Body:**
```json
{
  "name": "Alan",
  "email": "alan@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Signup successful",
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "_id": "user_id",
      "name": "Alan",
      "email": "alan@example.com"
    }
  }
}
```

**Errors:**
- 409: Email already registered

---

### 2. Signin - Login
```
POST /api/auth/signin
```

Login with existing credentials.

**Request Body:**
```json
{
  "email": "alan@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Signin successful",
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "_id": "user_id",
      "name": "Alan",
      "email": "alan@example.com"
    }
  }
}
```

**Errors:**
- 401: Invalid credentials

---

### 3. Forgot Password
```
POST /api/auth/forgot-password
```

Generate password reset token.

**Request Body:**
```json
{
  "email": "alan@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset token sent to email",
  "data": null
}
```

---

### 4. Reset Password
```
POST /api/auth/reset-password/:token
```

Reset password using token.

**Params:**
- token: Reset token

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": null
}
```

---

## Profile Endpoints

All profile endpoints require authentication.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

### 5. Create Profile
```
POST /api/profile/create
```

Create user profile with birth details for astrology calculations.

**Request Body:**
```json
{
  "name": "John",
  "gender": "male",
  "dateOfBirth": "1995-06-15",
  "timeOfBirth": "14:30",
  "city": "Chennai",
  "state": "Tamil Nadu",
  "country": "India",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "timezone": "+5.5"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "userId": "user_id",
    "personalInfo": {
      "name": "John",
      "gender": "male",
      "dateOfBirth": "1995-06-15T00:00:00.000Z",
      "timeOfBirth": "14:30",
      "placeOfBirth": {
        "city": "Chennai",
        "state": "Tamil Nadu",
        "country": "India",
        "coordinates": {
          "latitude": 13.0827,
          "longitude": 80.2707
        }
      }
    },
    "timezone": "+5.5",
    "isDeleted": false
  }
}
```

**Errors:**
- 409: Profile already exists. Use update endpoint.

---

### 6. Get Profile
```
GET /api/profile/:userId
```

Get user profile by user ID.

**Params:**
- userId: (optional) User ID, defaults to logged in user

**Response (200):**
```json
{
  "success": true,
  "data": { ...profile object... }
}
```

**Errors:**
- 404: Profile not found
- 403: Insufficient access

---

### 7. Update Profile
```
PATCH /api/profile/:userId
```

Update user profile.

**Params:**
- userId: (optional) User ID, defaults to logged in user

**Request Body:**
```json
{
  "name": "New Name"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ...updated profile... }
}
```

---

### 8. Delete Profile (Soft Delete)
```
DELETE /api/profile/:userId
```

Soft delete user profile.

**Params:**
- userId: (optional) User ID, defaults to logged in user

**Response (200):**
```json
{
  "success": true,
  "message": "Profile deleted successfully"
}
```

---

## Birth Chart Endpoints

All birth chart endpoints require authentication.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

### 9. Generate Birth Chart
```
POST /api/birth-chart/generate
```

Generate and save birth chart for user.

**Request Body:**
```json
{
  "chartName": "My Birth Chart"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Birth chart generated successfully",
  "data": {
    "userId": "user_id",
    "profileId": "profile_id",
    "chartName": "My Birth Chart",
    "chartData": { ... },
    "chartImage": "...",
    "generatedAt": "2026-04-11T..."
  }
}
```

**Errors:**
- 404: Please create your profile first

---

### 10. Get User Charts
```
GET /api/birth-chart/user/:userId
```

Get all birth charts for a user.

**Params:**
- userId: (optional) User ID, defaults to logged in user

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [ ...charts... ]
}
```

---

### 11. Get Chart by ID
```
GET /api/birth-chart/:chartId
```

Get specific birth chart.

**Response (200):**
```json
{
  "success": true,
  "data": { ...chart object... }
}
```

---

### 12. Rename Chart
```
PATCH /api/birth-chart/:chartId
```

Rename a birth chart.

**Request Body:**
```json
{
  "chartName": "Updated Chart Name"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Chart renamed",
  "data": { ...chart object... }
}
```

---

### 13. Delete Chart
```
DELETE /api/birth-chart/:chartId
```

Delete a birth chart (soft delete).

**Response (200):**
```json
{
  "success": true,
  "message": "Chart deleted successfully"
}
```

---

## Dosha Endpoints

### 14. Get Dosha Types
```
GET /api/dosha/types
```

Get list of all available dosha types.

**Response (200):**
```json
{
  "success": true,
  "data": ["manglik", "kalsarp", "sadesati", "pitradosh", "nadi"]
}
```

---

### 15. Check Dosha
```
POST /api/dosha/check
```

Check specific dosha by calling external Vedic Astro API.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "doshaType": "manglik"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Dosha report generated successfully",
  "data": {
    "id": "dosha_id",
    "doshaType": "manglik",
    "isPresent": true,
    "severity": "high",
    "summary": "...",
    "remedies": [...],
    "cachedAt": "2026-04-11T..."
  }
}
```

---

### 16. Search Doshas
```
GET /api/dosha/search
```

Search doshas with filters and pagination.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- type: Filter by dosha type (manglik, kalsarp, sadesati, pitradosh, nadi)
- severity: Filter by severity (low, medium, high)
- isPresent: Filter by presence (true/false)
- page: Page number (default: 1)
- limit: Items per page (default: 10)
- sort: Sort field (default: -createdAt)
- search: Search by profile name

**Example:**
```
GET /api/dosha/search?type=manglik&severity=high&page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "total": 5,
  "page": 1,
  "limit": 10,
  "data": [ ...dosha reports... ]
}
```

---

### 17. Get Dosha Report
```
GET /api/dosha/:doshaId/report
```

Get detailed dosha report by ID.

**Response (200):**
```json
{
  "success": true,
  "data": { ...report object... }
}
```

---

### 18. Delete Dosha Report
```
DELETE /api/dosha/:doshaId
```

Delete a dosha report.

**Response (200):**
```json
{
  "success": true,
  "message": "Dosha report deleted"
}
```

---

## Health Check

### 19. Health Check
```
GET /api/health
```

Check if API is running.

**Response (200):**
```json
{
  "success": true,
  "message": "Astrology API is running",
  "timestamp": "2026-04-11T13:42:54.284Z"
}
```

---

## API Summary Table

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|--------------|
| 1 | POST | /api/auth/signup | No | Create new account |
| 2 | POST | /api/auth/signin | No | Login |
| 3 | POST | /api/auth/forgot-password | No | Request password reset |
| 4 | POST | /api/auth/reset-password/:token | No | Reset password |
| 5 | POST | /api/profile/create | Yes | Create profile |
| 6 | GET | /api/profile/:userId | Yes | Get profile |
| 7 | PATCH | /api/profile/:userId | Yes | Update profile |
| 8 | DELETE | /api/profile/:userId | Yes | Delete profile |
| 9 | POST | /api/birth-chart/generate | Yes | Generate chart |
| 10 | GET | /api/birth-chart/user/:userId | Yes | Get user charts |
| 11 | GET | /api/birth-chart/:chartId | Yes | Get chart by ID |
| 12 | PATCH | /api/birth-chart/:chartId | Yes | Rename chart |
| 13 | DELETE | /api/birth-chart/:chartId | Yes | Delete chart |
| 14 | GET | /api/dosha/types | No | Get dosha types |
| 15 | POST | /api/dosha/check | Yes | Check dosha |
| 16 | GET | /api/dosha/search | Yes | Search doshas |
| 17 | GET | /api/dosha/:doshaId/report | Yes | Get report |
| 18 | DELETE | /api/dosha/:doshaId | Yes | Delete report |
| 19 | GET | /api/health | No | Health check |

Yes = Authentication Required  
No = Public Endpoint

---

## Testing Notes

1. Copy token from signup/signin response
2. Add to all protected routes as: Authorization: Bearer <TOKEN>
3. Use raw JSON body in Postman
4. Server runs on port 5001

---

*Generated for SDSE Capstone Project*
