# API Testing Guide

Base URL: `http://localhost:5001`

## 1. Authentication

### POST /api/auth/signup
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
Response: Returns token and user data

### POST /api/auth/signin
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
Response: Returns token

**Save the token for other requests!**

---

## 2. Profile (Requires Auth)

Add header: `Authorization: Bearer <token>`

### POST /api/profile/create
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

### GET /api/profile/:userId
### PATCH /api/profile/:userId
```json
{
  "name": "New Name"
}
```
### DELETE /api/profile/:userId

---

## 3. Birth Chart (Requires Auth)

### POST /api/birth-chart/generate
```json
{
  "chartName": "My Chart"
}
```

### GET /api/birth-chart/user/:userId
### GET /api/birth-chart/:chartId
### PATCH /api/birth-chart/:chartId
```json
{
  "chartName": "Updated Name"
}
```
### DELETE /api/birth-chart/:chartId

---

## 4. Dosha (Requires Auth)

### GET /api/dosha/types

### POST /api/dosha/check
```json
{
  "doshaType": "manglik"
}
```

### GET /api/dosha/search?type=manglik&severity=high&page=1&limit=10

### GET /api/dosha/:doshaId/report

### DELETE /api/dosha/:doshaId

---

## Postman Setup

1. Download Postman
2. Create collection "AstrologyAPI"
3. Add requests above
4. For auth required: use Postman variables

```
{{baseUrl}} = http://localhost:5001
{{token}} = (save signup/signin response token)
```

In headers for protected routes:
```
Authorization: Bearer {{token}}
```
