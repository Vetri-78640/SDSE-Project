# Deepa's Vision — Vedic Astrology Platform

> A full-stack Vedic astrology platform for birth chart generation, dosha detection, and personalized astrology reports — built with Next.js, Node.js, and the VedicAstro API.

---

## 🌐 Live Demo

> _Coming soon — deploy links will be added here_

---

## Screenshots

<img width="1800" height="1036" alt="image" src="https://github.com/user-attachments/assets/d7ebc034-8e46-461e-8be3-a1241dca94ae" />

---

## 📌 Table of Contents

- [About the Project](#about-the-project)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Folder Structure](#folder-structure)
- [API Reference](#api-reference)
- [Database Models](#database-models)
- [CRUD Operations](#crud-operations)
- [External API Integration](#external-api-integration)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 📖 About the Project

**Deepa's Vision** is a modern Vedic astrology web application inspired by platforms like AstroSage and AstroTalk. It allows users to:

- Create and manage their personal astrology profile
- Generate their Vedic birth chart (Kundli) using real astronomical data
- Detect planetary doshas such as Mangal Dosh, Kaal Sarp Dosh, and Sade Sati
- Save and revisit their charts and dosha reports at any time

The platform follows a clean **client–server separation** where all sensitive API calls (VedicAstro API key) are handled exclusively on the backend.

---

## ✨ Core Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **User Profile** | Create and manage personal birth details (name, DOB, TOB, birthplace, gender) |
| 2 | **Birth Chart Generation** | Generate Vedic Kundli (natal chart) via VedicAstro API, stored per user |
| 3 | **Dosha Detection** | Check Mangal Dosh, Kaal Sarp Dosh, Sade Sati with detailed reports |
| 4 | **Saved Charts & Reports** | View, rename, and delete previously generated charts and dosha reports |

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 14+ (App Router) | React framework with SSR/SSG support |
| [TypeScript](https://www.typescriptlang.org/) | 5+ | Type safety across the frontend |
| [Tailwind CSS](https://tailwindcss.com/) | 3+ | Utility-first styling |
| [Axios](https://axios-http.com/) | Latest | HTTP client for API calls |
| [React Hook Form](https://react-hook-form.com/) | Latest | Form state management + validation |
| [Zod](https://zod.dev/) | Latest | Schema-based client-side validation |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Node.js](https://nodejs.org/) | 18+ | JavaScript runtime |
| [Express.js](https://expressjs.com/) | 4+ | REST API framework |
| [MongoDB](https://www.mongodb.com/) | 6+ | NoSQL database |
| [Mongoose](https://mongoosejs.com/) | 7+ | MongoDB ODM / schema modeling |
| [JWT](https://jwt.io/) | Latest | Stateless authentication tokens |
| [bcryptjs](https://www.npmjs.com/package/bcryptjs) | Latest | Password hashing |
| [Joi](https://joi.dev/) | Latest | Server-side request validation |
| [dotenv](https://www.npmjs.com/package/dotenv) | Latest | Environment variable management |
| [cors](https://www.npmjs.com/package/cors) | Latest | Cross-origin resource sharing |
| [node-cache](https://www.npmjs.com/package/node-cache) | Latest | In-memory dosha result caching |

### External API

| Service | Purpose |
|---------|---------|
| [VedicAstro API](https://api.vedicastroapi.com/) | Birth chart generation + dosha detection |

---

## 🏗 Architecture Overview

```
Browser (Next.js)
       │
       │  HTTPS (Axios)
       ▼
Express REST API  ──────────►  MongoDB
       │                       (Profiles, Charts, Reports)
       │  Internal Server Call
       ▼
VedicAstro External API
(API key never exposed to client)
```

**Key Principle:** The frontend never directly calls VedicAstro. Every external call is proxied through the Express backend, keeping the API key secure.

**Caching Strategy:** Dosha reports are cached in MongoDB with a 24-hour TTL. If the same user requests the same dosha within 24 hours, the stored result is returned — no unnecessary external API call is made.

---

## 📁 Folder Structure

### Backend (`/backend`)

```
backend/
└── src/
    ├── config/
    │   ├── db.js                  # MongoDB connection setup
    │   └── astroApi.js            # VedicAstro base URL + API key config
    │
    ├── controllers/
    │   ├── authController.js      # Register, login, password reset
    │   ├── profileController.js   # Create, read, update profile
    │   ├── chartController.js     # Generate, save, delete charts
    │   └── doshaController.js     # Fetch and cache dosha reports
    │
    ├── services/
    │   ├── astroService.js        # All VedicAstro API calls (single responsibility)
    │   └── cacheService.js        # Cache wrapper (node-cache or Redis)
    │
    ├── models/
    │   ├── UserModel.js
    │   ├── ProfileModel.js
    │   ├── ChartModel.js
    │   └── DoshaReportModel.js
    │
    ├── routes/
    │   ├── authRoutes.js
    │   ├── profileRoutes.js
    │   ├── chartRoutes.js
    │   └── doshaRoutes.js
    │
    ├── middleware/
    │   ├── authMiddleware.js      # JWT verification
    │   └── validateRequest.js    # Joi-based input validation
    │
    ├── utils/
    │   ├── generateToken.js       # JWT signing utility
    │   └── formatBirthData.js     # Converts form input → API query format
    │
    └── app.js
```

### Frontend (`/frontend`)

```
frontend/
├── app/
│   ├── auth/page.tsx              # Login / Register
│   ├── profile/
│   │   ├── page.tsx               # View profile
│   │   └── edit/page.tsx          # Edit birth details
│   ├── chart/
│   │   ├── page.tsx               # Generate chart form
│   │   └── [id]/page.tsx          # View individual chart
│   ├── dosha/
│   │   ├── page.tsx               # Dosha search + filter
│   │   └── [type]/page.tsx        # Individual dosha report
│   ├── saved/page.tsx             # All saved charts and reports
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── charts/
│   │   ├── KundliWheel.tsx        # Visual Kundli chart render
│   │   └── ChartTable.tsx         # Planetary position table
│   ├── dosha/
│   │   ├── DoshaCard.tsx          # Single dosha result card
│   │   └── DoshaFilter.tsx        # Filter/search doshas
│   ├── profile/
│   │   └── ProfileForm.tsx        # Birth detail form
│   └── shared/
│       ├── Navbar.tsx
│       └── Loader.tsx
│
├── hooks/
│   ├── useProfile.ts              # Profile data + mutations
│   ├── useChart.ts                # Chart generation + state
│   └── useDosha.ts                # Dosha fetching + filtering
│
├── services/
│   ├── profileService.ts          # Axios calls → /api/profile
│   ├── chartService.ts            # Axios calls → /api/chart
│   └── doshaService.ts            # Axios calls → /api/dosha
│
└── utils/
    └── axiosInstance.ts           # Axios base config + interceptors
```

---

## 🔌 API Reference

### Auth Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login + receive JWT | ❌ |
| POST | `/api/auth/forgot-password` | Send reset email | ❌ |
| POST | `/api/auth/reset-password/:token` | Reset password | ❌ |

### Profile Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/profile` | Create user profile | ✅ |
| GET | `/api/profile` | Get current user profile | ✅ |
| PUT | `/api/profile` | Update birth details | ✅ |

### Chart Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/chart/generate` | Generate + save birth chart | ✅ |
| GET | `/api/chart/saved` | Get all saved charts (paginated) | ✅ |
| GET | `/api/chart/:id` | Get single chart by ID | ✅ |
| PUT | `/api/chart/:id` | Rename a chart | ✅ |
| DELETE | `/api/chart/:id` | Delete a saved chart | ✅ |

### Dosha Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/dosha/:type` | Fetch dosha report (cached 24h) | ✅ |
| GET | `/api/dosha` | List all doshas with filter/search | ✅ |

> **Supported `type` values:** `manglik`, `kaalsarp`, `sadesati`

**Query Parameters (Dosha & Chart):**
```
?dob=21/04/1995&tob=11:40&lat=11&lon=77&tz=5.5
```

**Pagination Parameters:**
```
?page=1&limit=10&sort=createdAt&order=desc
```

---

## 🗄 Database Models

### `UserModel`
```js
{
  email: String,          // unique
  passwordHash: String,
  role: String,           // "user" | "admin"
  isDeleted: Boolean,     // soft delete flag
  deletedAt: Date,
  createdAt, updatedAt
}
```

### `ProfileModel`
```js
{
  userId: ObjectId,       // ref → User
  name: String,
  dob: String,            // "21/04/1995"
  tob: String,            // "11:40"
  lat: Number,
  lon: Number,
  timezone: Number,       // e.g. 5.5 for IST
  gender: String,
  birthplace: String,
  createdAt, updatedAt
}
```

### `ChartModel`
```js
{
  userId: ObjectId,
  profileId: ObjectId,
  chartType: String,      // "natal" | "navamsa"
  label: String,          // user-given name
  apiResponse: Object,    // raw VedicAstro JSON
  createdAt
}
```

### `DoshaReportModel`
```js
{
  userId: ObjectId,
  doshaType: String,      // "manglik" | "kaalsarp" | "sadesati"
  inputParams: Object,    // { dob, tob, lat, lon }
  apiResponse: Object,    // cached raw result
  fetchedAt: Date         // used for 24h cache expiry
}
```

---

## ✅ CRUD Operations

| Operation | Feature | Endpoint |
|-----------|---------|----------|
| **CREATE** | Save user profile | `POST /api/profile` |
| **CREATE** | Generate + save chart | `POST /api/chart/generate` |
| **READ** | View profile | `GET /api/profile` |
| **READ** | Fetch dosha report | `GET /api/dosha/:type` |
| **UPDATE** | Edit birth details | `PUT /api/profile` |
| **UPDATE** | Rename saved chart | `PUT /api/chart/:id` |
| **DELETE** | Delete saved chart | `DELETE /api/chart/:id` |
| **DELETE** | Delete account (soft) | `DELETE /api/user/account` |

---

## 🌐 External API Integration

This project uses the [VedicAstro API](https://api.vedicastroapi.com/) for all astronomical calculations.

**Example — Manglik Dosh:**
```
GET https://api.vedicastroapi.com/v3-json/dosha/manglik-dosh
  ?dob=21/04/1995
  &tob=11:40
  &lat=11
  &lon=77
  &tz=5.5
  &api_key=YOUR_KEY
  &lang=en
```

**Security Rule:** The `api_key` is stored in `.env` on the backend only. It is never sent to or from the browser.

---

## 🔐 Environment Variables

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/astroverse
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
VEDIC_API_KEY=your_vedicastro_api_key_here
CLIENT_URL=http://localhost:3000
```

### Frontend `.env`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v18+`
- MongoDB running locally or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) URI
- A VedicAstro API key from [vedicastroapi.com](https://vedicastroapi.com)

---

### 1. Clone the Repository

```bash
git clone https://github.com/vedant-valid/SDSE-Project.git

```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGO_URI, JWT_SECRET, and VEDIC_API_KEY
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
```

### 4. Open in Browser

```
Frontend → http://localhost:3000
Backend  → http://localhost:5000
```

---

## 📜 Scripts

### Backend
```bash
npm run dev       # Start with nodemon (hot reload)
npm start         # Production start
npm run lint      # ESLint check
```

### Frontend
```bash
npm run dev       # Next.js dev server
npm run build     # Production build
npm start         # Start production server
npm run lint      # ESLint check
```

---

## 🗺 Roadmap

- [x] Auth (Register, Login, Forgot/Reset Password)
- [x] User Profile — Create & Update
- [x] Birth Chart Generation (VedicAstro API)
- [x] Dosha Detection with DB caching
- [x] Saved Charts & Reports
- [ ] Navamsa / D9 Chart Support
- [ ] Kundli Matching (Compatibility)
- [ ] Horoscope by Zodiac Sign
- [ ] PDF Export of Reports
- [ ] Push Notifications for Daily Horoscope
- [ ] Admin Dashboard

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add: your feature description'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow the existing code style and add comments where necessary.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---
