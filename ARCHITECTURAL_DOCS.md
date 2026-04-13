# Astrology API Architectural & OOP Documentation

This document outlines the architectural patterns and Object-Oriented Programming (OOP) principles implemented in the Astrology API project.

## 🏗️ Architecture Overview

The project follows a **Layered Architecture** (N-Tier/A Multi-Tier) to ensure separation of concerns, maintainability, and scalability.

1.  **Route Layer (`/routes`):** Defines API endpoints and maps them to controllers.
2.  **Middleware Layer (`/middleware`):** Handles cross-cutting concerns (Auth, Validation, Errors).
3.  **Controller Layer (`/controllers`):** Manages HTTP request/response logic and delegates to services.
4.  **Service Layer (`/services`):** Encapsulates business logic and external API integrations.
5.  **Model Layer (`/models`):** Defines data schemas and provides data access.
6.  **Utility Layer (`/utils`):** Stateless helper functions.

---

## 🧩 OOP Principles Applied

### 1. Abstraction (Abstract Classes & Interfaces)
We use abstraction to define blueprints and contracts, hiding implementation details from the caller.

*   **`BaseController` (Abstract Class):**
    *   **What:** Located in `src/core/BaseController.ts`.
    *   **Why:** Provides common response methods (`ok`, `created`, `fail`) and an `asyncHandler` wrapper. This ensures a consistent response structure across the entire API and prevents code duplication.
*   **`BaseService` (Abstract Class):**
    *   **What:** Located in `src/core/BaseService.ts`.
    *   **Why:** Standardizes logging and error handling for all services.
*   **`IAstroService` & `ICacheService` (Interfaces):**
    *   **What:** Located in `src/services/interfaces/`.
    *   **Why:** Defines the contract for external services. By depending on interfaces rather than concrete implementations (Dependency Inversion), we can easily swap out the VedicAstro API or Redis client in the future without touching the controller logic.

### 2. Inheritance
Inheritance allows us to reuse code and create specialized versions of base classes.

*   **Controller Inheritance:**
    *   `AuthController`, `DoshaController`, `ProfileController`, `BirthChartController`, and `UserController` all extend `BaseController`.
    *   **Benefit:** They automatically inherit standardized response handling and error-catching mechanisms.
*   **Service Inheritance:**
    *   `AstroService`, `CacheService`, `DoshaService`, and `BirthChartService` extend `BaseService`.
    *   **Benefit:** They share a common logging context (using `serviceName`).

### 3. Encapsulation
Encapsulation is used to protect the internal state of objects and restrict access to specific methods.

*   **Private/Protected Access Modifiers:**
    *   `BaseController` and `BaseService` use `protected` members to allow child classes access while hiding them from external modules.
    *   `DoshaController` uses `private async resolveDoshaRequest(...)` to hide internal dispatching logic from the route layer.
    *   `ProfileController` uses `private canAccessUser(...)` to centralize authorization logic within the class.
*   **Class-Based Services:**
    *   Services like `AstroService` encapsulate the `axios` client instance, ensuring that API configurations (base URL, timeouts, keys) are not exposed globally.

### 4. Polymorphism
Polymorphism is achieved through interface implementation.

*   **Example:** `AstroService` implements `IAstroService`.
*   **Why:** The `DoshaController` uses `IAstroService` methods. If we decide to use a different astrology provider tomorrow, we simply create a new service class that implements `IAstroService`, and the controller remains unchanged.

---

### 5. Data Encapsulation - Protecting Sensitive Fields

In TypeScript interfaces, all properties are public by default. However, we implement proper encapsulation through separate interfaces and Mongoose hooks.

**User Model Encapsulation:**

*   **IUser** (Public Interface): Fields exposed to API responses
    *   `_id, name, email, role, createdAt, updatedAt`
    
*   **IUserInternal** (Private Interface): Backend-only with additional sensitive fields
    *   All of IUser PLUS: `password, resetPasswordToken, resetPasswordExpires`

*   **toJSON() Hook**: Automatically removes sensitive data before any response
    ```typescript
    userSchema.methods.toJSON = function () {
      const obj = this.toObject();
      delete obj.password;
      delete obj.resetPasswordToken;
      delete obj.resetPasswordExpires;
      return obj;
    };
    ```

*   **Why:** This ensures sensitive data is NEVER accidentally returned in API responses, even if a developer forgets to filter fields in the controller.

---

## 🗺️ Mapping Code to UML Diagram (Access Modifiers)

To ensure strict compliance with the project's System Design requirements, the codebase is aligned with the UML class diagram's visibility rules.

### 1. Entity Visibility (Models)
While TypeScript interfaces for Mongoose documents are primarily public, we apply the `#` (Protected) and `-` (Private) conceptual rules as follows:
*   **`User` Model:** `password` and `createdAt` are treated as protected (`#`). Access is restricted through authorized controller methods.
*   **`Profile` Model:** Sensitive details like `timeOfBirth` and `birthPlace` are logically protected (`#`), encapsulated within the `personalInfo` object.
*   **`DoshaReport` Model:** `inputParams` is protected (`#`), while `apiResponse` is public (`+`) for frontend consumption.

### 2. Service Visibility
*   **`AstroService` (UML: `AstroService`):**
    *   `+fetchBirthChart()`, `+fetchManglikDosh()`, `+fetchOtherdosha()` are public.
    *   `#callEndpoint()` is protected, encapsulated within the base class logic.
*   **`CacheService` (UML: `cacheService`):**
    *   `+get()`, `+set()` are public.
    *   `-invalidate()` is private, ensuring cache removal logic is internal to the service.

### 3. Controller Visibility
All primary entry points (`register`, `login`, `createProfile`, `generateChart`, etc.) are public (`+`) as they correspond to API endpoints. Internal helper methods (like `signToken` or `buildChartParamsFromProfile`) are marked as `private` or `protected`.

---

## 🛠️ Key Components & Implementation Details

### 🔄 Data Flow Example (Check Dosha)
1.  **Route:** `POST /api/dosha/check` calls `doshaController.checkDosha`.
2.  **Controller:** Validates the request, fetches the user profile, and calls `this.resolveDoshaRequest`.
3.  **Service:** `AstroService` checks the Redis cache (via `CacheService`). If empty, it calls the external API, caches the result, and returns data.
4.  **Controller:** Saves the report to MongoDB and returns a formatted JSON response using `this.created()`.

### 🛡️ Security Implementation
*   **Encapsulation of Secrets:** JWT secrets and API keys are strictly loaded via `dotenv` and encapsulated within specific config/service files.
*   **RBAC (Role-Based Access Control):** Implemented via `roleMiddleware`, utilizing the `role` property on the `User` class/model.

### 🚀 Performance Strategy
*   **Caching Strategy:** The `CacheService` implements a consistent interface for Redis, used primarily by the `AstroService` to store expensive API responses for 30 days.

---

## ✅ Summary of Recent Changes

| Feature | Pattern Used | Why? |
| :--- | :--- | :--- |
| **Forgot/Reset Password** | Encapsulation | Kept crypto logic inside `AstroController` to protect user security. |
| **Geocoding Helper** | Static Utility | Stateless function used to convert locations to coordinates for API calls. |
| **Pitra/Nadi Dosh** | Method Abstraction | Added specific methods to `AstroService` to follow the `IAstroService` contract. |
| **Redis URL Fix** | Config Management | Fixed a connection string typo to ensure the `CacheService` can initialize properly. |
| **Token Type Fix** | Strong Typing | Ensured `req.params.token` is treated as a string to satisfy Node.js `crypto` requirements. |
| **Express User Fix** | Type Augmentation | Extended the Express `Request` interface globally to include the `user` property, ensuring type safety throughout the controllers. |
| **UML Alignment** | Visibility & Naming | Renamed services/methods and set access modifiers to match the UML Class Diagram. |

---

## 🛠️ Advanced TypeScript Features

### Global Type Augmentation
To handle the custom `user` object attached by the `authMiddleware`, we use TypeScript's **Module Augmentation**.

*   **File:** `src/types/express/index.d.ts`
*   **Implementation:**
    ```typescript
    declare module "express" {
      export interface Request {
        user?: AuthPayload;
      }
    }
    ```
*   **Why:** This allows us to access `req.user` in any controller without manual casting, providing compile-time safety and autocompletion. We also configured `ts-node` in `tsconfig.json` with `"files": true` to ensure these declarations are loaded during development.
