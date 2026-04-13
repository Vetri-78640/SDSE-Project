# Astrology Backend - SOLID Principles Report

## Project Overview
This is a Node.js TypeScript backend for an Astrology API with RBAC (Role-Based Access Control).

---

## SOLID Principles Implementation

### 1. Single Responsibility Principle (S)
| File | Status | Notes |
|------|--------|-------|
| AstroService | ✅ | Only makes API calls |
| birthChartService | ✅ | Each method does one thing |
| doshaService | ✅ | Separate methods for date, severity, format |
| profileService | ✅ | Delegates to Mongoose |
| BaseController | ✅ | Response handling only |
| BaseService | ✅ | Logging only |

### 2. Open/Closed Principle (O)
| File | Status | Notes |
|------|--------|-------|
| AstroService | ✅ | Uses DOSHA_ENDPOINT_MAP - add new dosha without code changes |
| Controllers | ✅ | Use interfaces/validators |
| Validators | ✅ | Joi schemas - easy to extend |

### 3. Liskov Substitution Principle (L)
| File | Status | Notes |
|------|--------|-------|
| All Controllers | ✅ | Extend BaseController |
| All Services | ✅ | Extend BaseService |
| Models | ✅ | Implement interfaces |

### 4. Interface Segregation Principle (I)
| File | Status | Notes |
|------|--------|-------|
| IAstroService | ✅ | Only required methods |
| IUser | ✅ | Public fields only |
| IDoshaReport | ✅ | Public fields only |

### 5. Dependency Inversion Principle (D)
| File | Status | Notes |
|------|--------|-------|
| Controllers | ✅ | Depend on interfaces not concrete |
| Services | ✅ | Config via environment variables |

---

## OOP Encapsulation Implementation

### Protected Data (Not exposed to API):

#### UserModel
- IUser (public): name, email, role, createdAt, updatedAt
- IUserInternal (private): password, resetPasswordToken, resetPasswordExpires
- toJSON() hook filters sensitive fields

#### DoshaReportModel
- IDoshaReport (public): doshaType, isPresent, severity, summary, remedies
- IDoshaReportInternal (private): inputParams, apiResponse
- toJSON() hook filters sensitive fields

---

## Project Structure

```
src/
├── config/           # Database & API configs
├── controllers/      # HTTP request/response (extends BaseController)
├── core/            # Abstract BaseController, BaseService
├── middleware/     # Auth, validation, error handling
├── models/          # Mongoose schemas with interfaces
├── routes/         # Express routes
├── services/        # Business logic (extends BaseService)
├── types/           # TypeScript types
├── utils/            # Helper functions
└── validators/      # Joi validation schemas
```

---

## API Endpoints

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | /api/auth/signup | No | Create account |
| 2 | POST | /api/auth/signin | No | Login |
| 3 | POST | /api/auth/forgot-password | No | Reset request |
| 4 | POST | /api/auth/reset-password/:token | No | Reset password |
| 5 | POST | /api/profile/create | Yes | Create profile |
| 6 | GET | /api/profile/:userId | Yes | Get profile |
| 7 | PATCH | /api/profile/:userId | Yes | Update profile |
| 8 | DELETE | /api/profile/:userId | Yes | Delete profile |
| 9 | POST | /api/birth-chart/generate | Yes | Generate chart |
| 10 | GET | /api/birth-chart/user/:userId | Yes | Get charts |
| 11 | GET | /api/birth-chart/:chartId | Yes | Get chart |
| 12 | PATCH | /api/birth-chart/:chartId | Yes | Rename chart |
| 13 | DELETE | /api/birth-chart/:chartId | Yes | Delete chart |
| 14 | GET | /api/dosha/types | No | Get dosha types |
| 15 | POST | /api/dosha/check | Yes | Check dosha |
| 16 | GET | /api/dosha/search | Yes | Search doshas |
| 17 | GET | /api/dosha/:doshaId/report | Yes | Get report |
| 18 | DELETE | /api/dosha/:doshaId | Yes | Delete report |
| 19 | GET | /api/health | No | Health check |

---

## Dependencies

- express - Web framework
- mongoose - MongoDB ORM
- jsonwebtoken - JWT auth
- bcryptjs - Password hashing
- joi - Input validation
- axios - HTTP client for external API
- helmet - Security headers
- cors - Cross-origin requests
- express-rate-limit - Rate limiting

---

## Database

- MongoDB (NoSQL)
- Collections: users, userprofiles, birthcharts, doshareports

---

## Security Features

1. JWT Authentication
2. Role-Based Access Control (user/admin)
3. Password hashing with bcrypt
4. Input validation with Joi
5. Helmet security headers
6. Rate limiting
7. CORS configuration

---

*Generated for SDSE Capstone Project*
