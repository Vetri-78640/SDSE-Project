# Deepa's Vision — Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Warm Spiritual–themed Vedic astrology frontend (Next.js 16 + React 19 + Tailwind v4) wired to the existing Express backend, covering auth, profile, birth chart, dosha reports, and admin.

**Architecture:** Next.js App Router with a Zustand auth store; token kept in localStorage and mirrored to a JS-readable cookie for middleware route-guards; Axios instance with a request interceptor that injects the Bearer token. All pages except `/` and `/auth/*` require a valid session; `/admin` further requires `role === "admin"`.

**Tech Stack:** Next.js 16.2.2, React 19, Tailwind CSS v4, Zustand 5, Axios 1.14, Zod 4, Lucide-React, class-variance-authority, clsx, tailwind-merge. TypeScript strict mode. Path alias `@/*` → project root.

---

## File Map

| File | Responsibility |
|---|---|
| `Backend/astrology-api/src/validators/profileValidators.ts` | Make lat/lon optional |
| `Backend/astrology-api/src/controllers/profileController.ts` | Auto-geocode when lat/lon absent |
| `Frontend/astrology-app/app/globals.css` | Warm Spiritual color tokens + Tailwind theme |
| `Frontend/astrology-app/lib/utils.ts` | `cn()` helper |
| `Frontend/astrology-app/lib/api.ts` | Axios instance + auth interceptor + 401 handler |
| `Frontend/astrology-app/store/authStore.ts` | Zustand auth store (user, token, helpers) |
| `Frontend/astrology-app/middleware.ts` | Route protection via cookie |
| `Frontend/astrology-app/app/layout.tsx` | Root layout with Providers |
| `Frontend/astrology-app/app/providers.tsx` | Client-side auth hydration |
| `Frontend/astrology-app/components/ui/Button.tsx` | CVA button variants |
| `Frontend/astrology-app/components/ui/Input.tsx` | Labelled input + error state |
| `Frontend/astrology-app/components/ui/Card.tsx` | Warm card surface |
| `Frontend/astrology-app/components/ui/Badge.tsx` | Status badge (present/absent, severity) |
| `Frontend/astrology-app/components/ui/Spinner.tsx` | Loading spinner |
| `Frontend/astrology-app/components/ui/Toast.tsx` | Inline error/success banner |
| `Frontend/astrology-app/components/layout/Navbar.tsx` | Top nav (logo, links, logout) |
| `Frontend/astrology-app/app/page.tsx` | Landing page |
| `Frontend/astrology-app/app/auth/login/page.tsx` | Login form |
| `Frontend/astrology-app/app/auth/signup/page.tsx` | Signup form |
| `Frontend/astrology-app/app/dashboard/page.tsx` | Dashboard hub |
| `Frontend/astrology-app/app/profile/setup/page.tsx` | Create/edit birth details form |
| `Frontend/astrology-app/app/chart/page.tsx` | Birth chart viewer |
| `Frontend/astrology-app/app/dosha/page.tsx` | Dosha checker |
| `Frontend/astrology-app/app/admin/page.tsx` | Admin user table |

---

## Task 1: Backend — Auto-geocode on profile create/update

**Files:**
- Modify: `Backend/astrology-api/src/validators/profileValidators.ts`
- Modify: `Backend/astrology-api/src/controllers/profileController.ts`

- [ ] **Step 1.1: Make lat/lon optional in the Joi schema**

Open `Backend/astrology-api/src/validators/profileValidators.ts` and replace the full file content:

```typescript
import Joi from "joi";

export const profileCreationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  dateOfBirth: Joi.date().max("now").required(),
  timeOfBirth: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required(),
  city: Joi.string().required(),
  state: Joi.string().allow(""),
  country: Joi.string().required(),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  timezone: Joi.string().default("+5.5"),
});

export const profileUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  gender: Joi.string().valid("male", "female", "other"),
  dateOfBirth: Joi.date().max("now"),
  timeOfBirth: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  city: Joi.string(),
  state: Joi.string().allow(""),
  country: Joi.string(),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  timezone: Joi.string(),
}).min(1);
```

- [ ] **Step 1.2: Wire geocoding into profileController.createProfile**

Open `Backend/astrology-api/src/controllers/profileController.ts`. Replace the full file:

```typescript
import { Request, Response } from "express";
import { BaseController } from "../core/BaseController";
import { BirthChartModel } from "../models/BirthChartModel";
import { DoshaReportModel } from "../models/DoshaReportModel";
import { profileService } from "../services/profileService";
import { getCoordinates } from "../utils/geocodingHelper";

class ProfileController extends BaseController {
  private canAccessUser(reqUserId: string, reqUserRole: string, targetUserId: string): boolean {
    return reqUserRole === "admin" || String(reqUserId) === String(targetUserId);
  }

  public createProfile = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) return this.fail(res, 401, "Unauthorized");

    const existingProfile = await profileService.getProfileByUserId(userId);
    if (existingProfile) return this.fail(res, 409, "Profile already exists. Use update endpoint.");

    let { latitude, longitude } = req.body as { latitude?: number; longitude?: number };
    const { city, country } = req.body as { city: string; country: string };

    if (latitude === undefined || longitude === undefined) {
      const coords = await getCoordinates(city, country);
      if (!coords) {
        return this.fail(res, 422, `Could not geocode birth city: "${city}, ${country}". Please check the city and country name.`);
      }
      latitude = coords.latitude;
      longitude = coords.longitude;
    }

    const profile = await profileService.createProfile({
      userId: userId as any,
      personalInfo: {
        name: req.body.name,
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth,
        timeOfBirth: req.body.timeOfBirth,
        placeOfBirth: {
          city,
          state: req.body.state,
          country,
          coordinates: { latitude, longitude },
        },
      },
      timezone: req.body.timezone || "+5.5",
    });

    return this.created(res, profile, "Profile created successfully");
  });

  public getProfile = this.asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req.user;
    if (!reqUser) return this.fail(res, 401, "Unauthorized");

    const targetUserId = String(req.params.userId || reqUser._id);
    if (!this.canAccessUser(reqUser._id, reqUser.role, targetUserId)) {
      return this.fail(res, 403, "Insufficient access");
    }

    const profile = await profileService.getProfileByUserId(targetUserId);
    if (!profile) return this.fail(res, 404, "Profile not found");

    return this.ok(res, profile);
  });

  public updateProfile = this.asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req.user;
    if (!reqUser) return this.fail(res, 401, "Unauthorized");

    const targetUserId = String(req.params.userId || reqUser._id);
    if (!this.canAccessUser(reqUser._id, reqUser.role, targetUserId)) {
      return this.fail(res, 403, "Insufficient access");
    }

    const profile = await profileService.getProfileByUserId(targetUserId);
    if (!profile) return this.fail(res, 404, "Profile not found");

    const updates = { ...req.body };

    if ((updates.city || updates.country) && (updates.latitude === undefined || updates.longitude === undefined)) {
      const city = updates.city || profile.personalInfo.placeOfBirth.city;
      const country = updates.country || profile.personalInfo.placeOfBirth.country;
      const coords = await getCoordinates(city, country);
      if (coords) {
        updates.latitude = coords.latitude;
        updates.longitude = coords.longitude;
      }
    }

    await profileService.updateProfile(profile, updates);
    return this.ok(res, profile, "Profile updated successfully");
  });

  public deleteProfile = this.asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req.user;
    if (!reqUser) return this.fail(res, 401, "Unauthorized");

    const targetUserId = String(req.params.userId || reqUser._id);
    if (!this.canAccessUser(reqUser._id, reqUser.role, targetUserId)) {
      return this.fail(res, 403, "Insufficient access");
    }

    const profile = await profileService.getProfileByUserId(targetUserId);
    if (!profile) return this.fail(res, 404, "Profile not found");

    await profileService.deleteProfile(profile);
    await BirthChartModel.updateMany({ profileId: profile._id }, { isDeleted: true });
    await DoshaReportModel.deleteMany({ profileId: profile._id });

    return this.ok(res, null, "Profile deleted successfully");
  });
}

export const profileController = new ProfileController();
```

- [ ] **Step 1.3: Verify backend compiles**

```bash
cd Backend/astrology-api && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 1.4: Commit**

```bash
git add Backend/astrology-api/src/validators/profileValidators.ts \
        Backend/astrology-api/src/controllers/profileController.ts
git commit -m "fix: auto-geocode lat/lon in profile create/update via Nominatim"
```

---

## Task 2: Global CSS — Warm Spiritual theme tokens

**Files:**
- Modify: `Frontend/astrology-app/app/globals.css`

- [ ] **Step 2.1: Replace globals.css with Warm Spiritual tokens**

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);

  /* Warm Spiritual palette */
  --color-bg:        #FAF7F2;
  --color-card:      #FFF8F0;
  --color-primary:   #8B2635;
  --color-primary-hover: #6E1E2A;
  --color-accent:    #D4860B;
  --color-text:      #2C1810;
  --color-muted:     #9C7E6A;
  --color-border:    #E8D5C4;
  --color-success:   #3D7A4B;
  --color-error:     #C0392B;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans), Georgia, serif;
}

/* Mandala watermark — used on auth pages */
.mandala-bg::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='90' fill='none' stroke='%238B2635' stroke-width='0.5' stroke-dasharray='4 4'/%3E%3Ccircle cx='100' cy='100' r='70' fill='none' stroke='%23D4860B' stroke-width='0.5' stroke-dasharray='3 6'/%3E%3Ccircle cx='100' cy='100' r='50' fill='none' stroke='%238B2635' stroke-width='0.5' stroke-dasharray='2 8'/%3E%3Ccircle cx='100' cy='100' r='30' fill='none' stroke='%23D4860B' stroke-width='0.5'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px 200px;
  opacity: 0.04;
  pointer-events: none;
  z-index: 0;
}
```

- [ ] **Step 2.2: Commit**

```bash
cd Frontend/astrology-app
git add app/globals.css
git commit -m "style: add Warm Spiritual color tokens to Tailwind v4 theme"
```

---

## Task 3: Utility helper

**Files:**
- Create: `Frontend/astrology-app/lib/utils.ts`

- [ ] **Step 3.1: Create cn() helper**

```typescript
// Frontend/astrology-app/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3.2: Commit**

```bash
git add lib/utils.ts
git commit -m "feat: add cn() class utility"
```

---

## Task 4: Axios API client

**Files:**
- Create: `Frontend/astrology-app/lib/api.ts`

- [ ] **Step 4.1: Create Axios instance with auth interceptor**

```typescript
// Frontend/astrology-app/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      document.cookie = "auth_token=; path=/; max-age=0";
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

- [ ] **Step 4.2: Add NEXT_PUBLIC_API_URL to .env.local**

Create `Frontend/astrology-app/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5001
```

- [ ] **Step 4.3: Commit**

```bash
git add lib/api.ts .env.local
git commit -m "feat: add Axios instance with JWT interceptor and 401 redirect"
```

---

## Task 5: Zustand auth store

**Files:**
- Create: `Frontend/astrology-app/store/authStore.ts`

- [ ] **Step 5.1: Create the store**

```typescript
// Frontend/astrology-app/store/authStore.ts
import { create } from "zustand";

interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
    document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 3600}`;
    set({ user, token, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    document.cookie = "auth_token=; path=/; max-age=0";
    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrate: () => {
    const token = localStorage.getItem("auth_token");
    const raw = localStorage.getItem("auth_user");
    if (token && raw) {
      try {
        const user = JSON.parse(raw) as AuthUser;
        set({ user, token, isAuthenticated: true });
      } catch {
        // corrupted storage — stay logged out
      }
    }
  },
}));
```

- [ ] **Step 5.2: Commit**

```bash
git add store/authStore.ts
git commit -m "feat: add Zustand auth store with localStorage + cookie persistence"
```

---

## Task 6: Next.js middleware — route protection

**Files:**
- Create: `Frontend/astrology-app/middleware.ts`

- [ ] **Step 6.1: Create middleware**

```typescript
// Frontend/astrology-app/middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/profile", "/chart", "/dosha"];
const ADMIN_ONLY = ["/admin"];
const AUTH_PAGES = ["/auth/login", "/auth/signup"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth_token")?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAdmin = ADMIN_ONLY.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if ((isProtected || isAdmin) && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/chart/:path*", "/dosha/:path*", "/admin/:path*", "/auth/:path*"],
};
```

Note: Admin role check in middleware requires decoding the JWT — we skip that here and enforce it at the page level (the backend will return 403 for non-admins anyway).

- [ ] **Step 6.2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add Next.js middleware for auth route protection"
```

---

## Task 7: Root layout + Providers

**Files:**
- Create: `Frontend/astrology-app/app/providers.tsx`
- Modify: `Frontend/astrology-app/app/layout.tsx`

- [ ] **Step 7.1: Create Providers component (client-side auth hydration)**

```tsx
// Frontend/astrology-app/app/providers.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function Providers({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
```

- [ ] **Step 7.2: Update root layout**

Replace `Frontend/astrology-app/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Deepa's Vision — Vedic Astrology",
  description: "Personalized Vedic birth charts and Dosha reports",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 7.3: Commit**

```bash
git add app/providers.tsx app/layout.tsx
git commit -m "feat: add Providers with auth hydration + update root layout metadata"
```

---

## Task 8: Core UI primitives

**Files:**
- Create: `Frontend/astrology-app/components/ui/Button.tsx`
- Create: `Frontend/astrology-app/components/ui/Input.tsx`
- Create: `Frontend/astrology-app/components/ui/Card.tsx`
- Create: `Frontend/astrology-app/components/ui/Badge.tsx`
- Create: `Frontend/astrology-app/components/ui/Spinner.tsx`
- Create: `Frontend/astrology-app/components/ui/Toast.tsx`

- [ ] **Step 8.1: Button**

```tsx
// Frontend/astrology-app/components/ui/Button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
        outline: "border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-border)]",
        ghost:   "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]",
        accent:  "bg-[var(--color-accent)] text-white hover:opacity-90",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-sm",
        lg: "px-7 py-3 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
```

- [ ] **Step 8.2: Input**

```tsx
// Frontend/astrology-app/components/ui/Input.tsx
import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export function Input({ label, error, id, wrapperClassName, className, ...props }: InputProps) {
  return (
    <div className={cn("flex flex-col gap-1", wrapperClassName)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--color-text)]">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition",
          error && "border-[var(--color-error)] focus:ring-[var(--color-error)]",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 8.3: Card**

```tsx
// Frontend/astrology-app/components/ui/Card.tsx
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-[0_2px_16px_rgba(139,38,53,0.08)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold text-[var(--color-text)]", className)}
      {...props}
    >
      {children}
    </h2>
  );
}
```

- [ ] **Step 8.4: Badge**

```tsx
// Frontend/astrology-app/components/ui/Badge.tsx
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeVariant = "present" | "absent" | "high" | "medium" | "low" | "admin" | "user";

const variantMap: Record<BadgeVariant, string> = {
  present: "bg-red-100 text-red-800 border-red-200",
  absent:  "bg-green-100 text-green-800 border-green-200",
  high:    "bg-red-100 text-red-800 border-red-200",
  medium:  "bg-amber-100 text-amber-800 border-amber-200",
  low:     "bg-green-100 text-green-800 border-green-200",
  admin:   "bg-purple-100 text-purple-800 border-purple-200",
  user:    "bg-blue-100 text-blue-700 border-blue-200",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
}

export function Badge({ variant, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantMap[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 8.5: Spinner**

```tsx
// Frontend/astrology-app/components/ui/Spinner.tsx
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]",
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
```

- [ ] **Step 8.6: Toast**

```tsx
// Frontend/astrology-app/components/ui/Toast.tsx
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "error" | "success" | "info";
  onClose?: () => void;
}

const typeStyles = {
  error:   "bg-red-50 border-red-200 text-red-800",
  success: "bg-green-50 border-green-200 text-green-800",
  info:    "bg-amber-50 border-amber-200 text-amber-800",
};

export function Toast({ message, type = "error", onClose }: ToastProps) {
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border p-4 text-sm", typeStyles[type])}>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-70 hover:opacity-100">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 8.7: Commit**

```bash
git add components/ui/
git commit -m "feat: add core UI primitives (Button, Input, Card, Badge, Spinner, Toast)"
```

---

## Task 9: Navbar

**Files:**
- Create: `Frontend/astrology-app/components/layout/Navbar.tsx`

- [ ] **Step 9.1: Create Navbar**

```tsx
// Frontend/astrology-app/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Star } from "lucide-react";

export function Navbar() {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push("/auth/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-card)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-[var(--color-primary)] font-semibold text-lg">
          <Star size={20} className="text-[var(--color-accent)]" />
          Deepa&apos;s Vision
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
                Dashboard
              </Link>
              <Link href="/chart" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
                Birth Chart
              </Link>
              <Link href="/dosha" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
                Dosha
              </Link>
              {user?.role === "admin" && (
                <Link href="/admin" className="text-sm text-[var(--color-accent)] hover:opacity-80 transition-opacity">
                  Admin
                </Link>
              )}
              <span className="text-sm text-[var(--color-muted)]">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 9.2: Commit**

```bash
git add components/layout/Navbar.tsx
git commit -m "feat: add Navbar with auth-aware links and logout"
```

---

## Task 10: Landing page

**Files:**
- Modify: `Frontend/astrology-app/app/page.tsx`

- [ ] **Step 10.1: Replace default Next.js landing**

```tsx
// Frontend/astrology-app/app/page.tsx
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Star, Moon, Sun } from "lucide-react";

const features = [
  {
    icon: Star,
    title: "Vedic Birth Chart",
    description: "Generate your personalized Kundli using Lahiri ayanamsha. See planetary positions, houses, and ascendant in your birth chart.",
  },
  {
    icon: Moon,
    title: "Dosha Analysis",
    description: "Check for five major doshas — Manglik, Kalsarp, Sadesati, Pitradosh, and Nadi — with severity assessment and Vedic remedies.",
  },
  {
    icon: Sun,
    title: "Cosmic Insights",
    description: "Understand how the planets at the moment of your birth shape your personality, life path, and karmic journey.",
  },
];

export default function LandingPage() {
  return (
    <div className="mandala-bg flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-[var(--color-accent)]">
          Vedic Astrology
        </p>
        <h1 className="mb-6 max-w-2xl text-5xl font-bold leading-tight text-[var(--color-text)]" style={{ fontFamily: "Georgia, serif" }}>
          Discover the stars&nbsp;that shaped your soul
        </h1>
        <p className="mb-10 max-w-lg text-lg text-[var(--color-muted)]">
          Deepa&apos;s Vision generates your authentic Vedic birth chart and dosha reports — rooted in ancient wisdom, delivered instantly.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/auth/signup">
            <Button size="lg">Begin Your Journey</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="lg">Sign In</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-24">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="flex flex-col items-start gap-4">
              <div className="rounded-xl bg-[var(--color-bg)] p-3">
                <Icon size={24} className="text-[var(--color-primary)]" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-[var(--color-text)]">{title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">{description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--color-border)] py-6 text-center text-sm text-[var(--color-muted)]">
        © {new Date().getFullYear()} Deepa&apos;s Vision · Built with ancient wisdom
      </footer>
    </div>
  );
}
```

- [ ] **Step 10.2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: build landing page with hero and feature cards"
```

---

## Task 11: Auth pages (Login + Signup)

**Files:**
- Create: `Frontend/astrology-app/app/auth/login/page.tsx`
- Create: `Frontend/astrology-app/app/auth/signup/page.tsx`

- [ ] **Step 11.1: Create Login page**

```tsx
// Frontend/astrology-app/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Toast } from "@/components/ui/Toast";
import { Star } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/auth/signin", { email, password });
      setAuth(data.data.user, data.data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mandala-bg flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Star size={32} className="text-[var(--color-accent)]" />
          <h1 className="text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: "Georgia, serif" }}>
            Welcome back
          </h1>
          <p className="text-sm text-[var(--color-muted)]">Sign in to Deepa&apos;s Vision</p>
        </div>

        {error && (
          <div className="mb-4">
            <Toast message={error} type="error" onClose={() => setError("")} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-medium text-[var(--color-primary)] hover:underline">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
```

- [ ] **Step 11.2: Create Signup page**

```tsx
// Frontend/astrology-app/app/auth/signup/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Toast } from "@/components/ui/Toast";
import { Star } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/auth/signup", { name, email, password });
      setAuth(data.data.user, data.data.token);
      router.push("/profile/setup");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mandala-bg flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Star size={32} className="text-[var(--color-accent)]" />
          <h1 className="text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: "Georgia, serif" }}>
            Begin your journey
          </h1>
          <p className="text-sm text-[var(--color-muted)]">Create your Deepa&apos;s Vision account</p>
        </div>

        {error && (
          <div className="mb-4">
            <Toast message={error} type="error" onClose={() => setError("")} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="name"
            type="text"
            label="Full name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            id="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-[var(--color-primary)] hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
```

- [ ] **Step 11.3: Commit**

```bash
git add app/auth/
git commit -m "feat: add Login and Signup pages with form validation and auth store integration"
```

---

## Task 12: Profile setup page

**Files:**
- Create: `Frontend/astrology-app/app/profile/setup/page.tsx`

- [ ] **Step 12.1: Create Profile setup form**

```tsx
// Frontend/astrology-app/app/profile/setup/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Toast } from "@/components/ui/Toast";
import { Navbar } from "@/components/layout/Navbar";

interface ProfileData {
  name: string;
  gender: string;
  dateOfBirth: string;
  timeOfBirth: string;
  city: string;
  state: string;
  country: string;
  timezone: string;
}

const defaultForm: ProfileData = {
  name: "",
  gender: "male",
  dateOfBirth: "",
  timeOfBirth: "",
  city: "",
  state: "",
  country: "",
  timezone: "+5.5",
};

export default function ProfileSetupPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProfileData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    api.get("/api/profile")
      .then(({ data }) => {
        const p = data.data;
        setIsEdit(true);
        setForm({
          name: p.personalInfo.name,
          gender: p.personalInfo.gender,
          dateOfBirth: p.personalInfo.dateOfBirth?.slice(0, 10) ?? "",
          timeOfBirth: p.personalInfo.timeOfBirth,
          city: p.personalInfo.placeOfBirth.city,
          state: p.personalInfo.placeOfBirth.state ?? "",
          country: p.personalInfo.placeOfBirth.country,
          timezone: p.timezone,
        });
      })
      .catch(() => {/* no profile yet — form stays empty */})
      .finally(() => setFetching(false));
  }, []);

  const set = (field: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (isEdit) {
        await api.patch("/api/profile", form);
        setSuccess("Profile updated successfully.");
      } else {
        await api.post("/api/profile/create", form);
        setSuccess("Profile created! Redirecting to your dashboard…");
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Could not save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main className="flex flex-1 items-start justify-center px-4 py-12">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle style={{ fontFamily: "Georgia, serif", fontSize: "1.4rem" }}>
              {isEdit ? "Update Birth Details" : "Enter Your Birth Details"}
            </CardTitle>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              These details are used to generate your Vedic birth chart.
            </p>
          </CardHeader>

          {error && <div className="mb-4"><Toast message={error} type="error" onClose={() => setError("")} /></div>}
          {success && <div className="mb-4"><Toast message={success} type="success" onClose={() => setSuccess("")} /></div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input id="name" label="Full Name" placeholder="As it appears in records" value={form.name} onChange={set("name")} required />

            <div className="flex flex-col gap-1">
              <label htmlFor="gender" className="text-sm font-medium text-[var(--color-text)]">Gender</label>
              <select
                id="gender"
                value={form.gender}
                onChange={set("gender")}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input id="dob" type="date" label="Date of Birth" value={form.dateOfBirth} onChange={set("dateOfBirth")} required />
              <Input id="tob" type="time" label="Time of Birth (24h)" value={form.timeOfBirth} onChange={set("timeOfBirth")} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input id="city" label="Birth City" placeholder="e.g. Mumbai" value={form.city} onChange={set("city")} required />
              <Input id="state" label="State / Province" placeholder="Optional" value={form.state} onChange={set("state")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input id="country" label="Country" placeholder="e.g. India" value={form.country} onChange={set("country")} required />
              <Input id="timezone" label="Timezone offset" placeholder="+5.5" value={form.timezone} onChange={set("timezone")} />
            </div>

            <p className="text-xs text-[var(--color-muted)]">
              Coordinates are resolved automatically from your city and country.
            </p>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Spinner className="h-4 w-4" /> : isEdit ? "Update Profile" : "Save & Continue"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
```

- [ ] **Step 12.2: Commit**

```bash
git add app/profile/
git commit -m "feat: add Profile setup/edit page with auto-geocode city input"
```

---

## Task 13: Dashboard page

**Files:**
- Create: `Frontend/astrology-app/app/dashboard/page.tsx`

- [ ] **Step 13.1: Create Dashboard**

```tsx
// Frontend/astrology-app/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Star, Moon, Settings, ChevronRight } from "lucide-react";

interface Profile {
  personalInfo: {
    name: string;
    gender: string;
    dateOfBirth: string;
    timeOfBirth: string;
    placeOfBirth: { city: string; country: string };
  };
  timezone: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/profile")
      .then(({ data }) => setProfile(data.data))
      .catch(() => {/* will show setup prompt */})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        {/* Greeting */}
        <div className="mb-8">
          <p className="text-sm text-[var(--color-accent)] font-medium uppercase tracking-widest mb-1">
            Welcome back
          </p>
          <h1 className="text-3xl font-bold text-[var(--color-text)]" style={{ fontFamily: "Georgia, serif" }}>
            {user?.name}
          </h1>
          {user?.role === "admin" && (
            <Badge variant="admin" className="mt-2">Administrator</Badge>
          )}
        </div>

        {!profile ? (
          /* No profile yet */
          <Card className="flex flex-col items-center gap-6 py-12 text-center">
            <Star size={48} className="text-[var(--color-accent)] opacity-60" />
            <div>
              <h2 className="mb-2 text-xl font-semibold text-[var(--color-text)]">Set up your birth details</h2>
              <p className="text-[var(--color-muted)] text-sm max-w-sm mx-auto">
                We need your date, time, and place of birth to generate your Vedic chart and dosha reports.
              </p>
            </div>
            <Link href="/profile/setup">
              <Button size="lg">Enter Birth Details</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Profile summary */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Birth Details</CardTitle>
              </CardHeader>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--color-muted)]">Name</dt>
                  <dd className="font-medium text-[var(--color-text)]">{profile.personalInfo.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-muted)]">Born</dt>
                  <dd className="font-medium text-[var(--color-text)]">
                    {new Date(profile.personalInfo.dateOfBirth).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-muted)]">Time</dt>
                  <dd className="font-medium text-[var(--color-text)]">{profile.personalInfo.timeOfBirth}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-muted)]">Place</dt>
                  <dd className="font-medium text-[var(--color-text)]">{profile.personalInfo.placeOfBirth.city}, {profile.personalInfo.placeOfBirth.country}</dd>
                </div>
              </dl>
              <div className="mt-4">
                <Link href="/profile/setup">
                  <Button variant="ghost" size="sm" className="w-full">
                    <Settings size={14} /> Edit Details
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Birth Chart CTA */}
            <Card className="flex flex-col justify-between lg:col-span-1">
              <CardHeader>
                <div className="mb-3 inline-flex rounded-xl bg-[var(--color-bg)] p-3">
                  <Star size={24} className="text-[var(--color-primary)]" />
                </div>
                <CardTitle>Vedic Birth Chart</CardTitle>
              </CardHeader>
              <p className="mb-6 text-sm text-[var(--color-muted)]">
                View your Kundli with planetary positions and house details.
              </p>
              <Link href="/chart">
                <Button className="w-full" variant="primary">
                  View Birth Chart <ChevronRight size={16} />
                </Button>
              </Link>
            </Card>

            {/* Dosha CTA */}
            <Card className="flex flex-col justify-between lg:col-span-1">
              <CardHeader>
                <div className="mb-3 inline-flex rounded-xl bg-[var(--color-bg)] p-3">
                  <Moon size={24} className="text-[var(--color-primary)]" />
                </div>
                <CardTitle>Dosha Reports</CardTitle>
              </CardHeader>
              <p className="mb-6 text-sm text-[var(--color-muted)]">
                Check for Manglik, Kalsarp, Sadesati, Pitradosh, and Nadi doshas.
              </p>
              <Link href="/dosha">
                <Button className="w-full" variant="primary">
                  Check Doshas <ChevronRight size={16} />
                </Button>
              </Link>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 13.2: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: add Dashboard with profile summary and quick-action cards"
```

---

## Task 14: Birth Chart page

**Files:**
- Create: `Frontend/astrology-app/components/chart/ChartViewer.tsx`
- Create: `Frontend/astrology-app/app/chart/page.tsx`

- [ ] **Step 14.1: Create ChartViewer component**

```tsx
// Frontend/astrology-app/components/chart/ChartViewer.tsx
import { Card } from "@/components/ui/Card";

interface ChartViewerProps {
  chartData: Record<string, unknown>;
  chartImage?: string;
}

function getPlanetRows(chartData: Record<string, unknown>): { planet: string; sign: string; house: string; degree: string }[] {
  const output = (chartData.output as Record<string, unknown>[]) ?? [];
  if (Array.isArray(output) && output.length > 0) {
    return output.map((p) => ({
      planet: String(p.planet ?? p.name ?? ""),
      sign:   String(p.sign ?? p.rashi ?? ""),
      house:  String(p.house ?? p.bhava ?? ""),
      degree: typeof p.degree === "number" ? `${(p.degree as number).toFixed(2)}°` : String(p.degree ?? ""),
    }));
  }

  const planets = (chartData.planets ?? chartData.planet_positions ?? chartData.data) as Record<string, unknown>[] | undefined;
  if (Array.isArray(planets)) {
    return planets.map((p) => ({
      planet: String(p.planet ?? p.name ?? ""),
      sign:   String(p.sign ?? p.rashi ?? ""),
      house:  String(p.house ?? p.bhava ?? ""),
      degree: typeof p.degree === "number" ? `${(p.degree as number).toFixed(2)}°` : String(p.degree ?? ""),
    }));
  }
  return [];
}

export function ChartViewer({ chartData, chartImage }: ChartViewerProps) {
  const rows = getPlanetRows(chartData);

  return (
    <div className="flex flex-col gap-6">
      {chartImage && (
        <Card className="flex items-center justify-center p-4">
          {chartImage.startsWith("<svg") ? (
            <div dangerouslySetInnerHTML={{ __html: chartImage }} className="max-w-full" />
          ) : (
            <img src={chartImage} alt="Vedic Birth Chart" className="max-w-full rounded-xl" />
          )}
        </Card>
      )}

      {rows.length > 0 && (
        <Card>
          <h3 className="mb-4 font-semibold text-[var(--color-text)]" style={{ fontFamily: "Georgia, serif" }}>
            Planetary Positions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-muted)]">
                  <th className="pb-2 pr-4 font-medium">Planet</th>
                  <th className="pb-2 pr-4 font-medium">Sign (Rashi)</th>
                  <th className="pb-2 pr-4 font-medium">House</th>
                  <th className="pb-2 font-medium">Degree</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-2 pr-4 font-medium text-[var(--color-primary)]">{r.planet}</td>
                    <td className="py-2 pr-4 text-[var(--color-text)]">{r.sign}</td>
                    <td className="py-2 pr-4 text-[var(--color-text)]">{r.house}</td>
                    <td className="py-2 text-[var(--color-muted)]">{r.degree}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!chartImage && rows.length === 0 && (
        <Card className="py-8 text-center text-[var(--color-muted)] text-sm">
          Chart data received but no visual format available. Raw data:
          <pre className="mt-4 text-left text-xs overflow-auto bg-[var(--color-bg)] p-4 rounded-lg max-h-64">
            {JSON.stringify(chartData, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 14.2: Create Chart page**

```tsx
// Frontend/astrology-app/app/chart/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Toast } from "@/components/ui/Toast";
import { ChartViewer } from "@/components/chart/ChartViewer";

interface BirthChart {
  _id: string;
  chartName: string;
  chartData: Record<string, unknown>;
  chartImage?: string;
  generatedAt: string;
}

export default function ChartPage() {
  const [charts, setCharts] = useState<BirthChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [noProfile, setNoProfile] = useState(false);

  const fetchCharts = async () => {
    try {
      const { data } = await api.get("/api/birth-chart/user");
      setCharts(data.data ?? []);
    } catch {
      setError("Could not load charts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCharts(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      await api.post("/api/birth-chart/generate", { chartName: "My Birth Chart" });
      await fetchCharts();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "";
      if (msg.toLowerCase().includes("profile")) setNoProfile(true);
      setError(msg || "Could not generate chart. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-accent)] mb-1">Vedic Astrology</p>
            <h1 className="text-3xl font-bold text-[var(--color-text)]" style={{ fontFamily: "Georgia, serif" }}>
              Your Birth Chart
            </h1>
          </div>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? <><Spinner className="h-4 w-4" /> Generating…</> : "Generate New Chart"}
          </Button>
        </div>

        {error && (
          <div className="mb-6">
            <Toast message={error} type="error" onClose={() => setError("")} />
            {noProfile && (
              <div className="mt-3 text-center">
                <Link href="/profile/setup">
                  <Button variant="outline">Set Up Profile First</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
        ) : charts.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-20 text-center">
            <p className="text-[var(--color-muted)]">No birth chart yet. Generate one to get started.</p>
            <Button onClick={handleGenerate} disabled={generating} size="lg">
              {generating ? "Generating…" : "Generate Birth Chart"}
            </Button>
          </div>
        ) : (
          <ChartViewer chartData={charts[0].chartData} chartImage={charts[0].chartImage} />
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 14.3: Commit**

```bash
git add components/chart/ app/chart/
git commit -m "feat: add birth chart page with ChartViewer (SVG + planetary table)"
```

---

## Task 15: Dosha page

**Files:**
- Create: `Frontend/astrology-app/app/dosha/page.tsx`

- [ ] **Step 15.1: Create Dosha page**

```tsx
// Frontend/astrology-app/app/dosha/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Toast } from "@/components/ui/Toast";

type DoshaType = "manglik" | "kalsarp" | "sadesati" | "pitradosh" | "nadi";
type Severity = "low" | "medium" | "high";

interface DoshaReport {
  id: string;
  doshaType: DoshaType;
  isPresent: boolean;
  severity: Severity;
  summary: string;
  remedies: string[];
  cachedAt: string;
}

const DOSHA_LABELS: Record<DoshaType, string> = {
  manglik:  "Manglik Dosh",
  kalsarp:  "Kalsarp Dosh",
  sadesati: "Sade Sati",
  pitradosh: "Pitra Dosh",
  nadi:     "Nadi Dosh",
};

const DOSHA_DESC: Record<DoshaType, string> = {
  manglik:  "Mars influence on marriage and relationships.",
  kalsarp:  "Rahu-Ketu axis enclosing all planets.",
  sadesati: "Saturn's 7.5-year transit over Moon sign.",
  pitradosh: "Ancestral karma and its effects.",
  nadi:     "Compatibility and genetic factors.",
};

export default function DoshaPage() {
  const [reports, setReports] = useState<DoshaReport[]>([]);
  const [selected, setSelected] = useState<DoshaType>("manglik");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [noProfile, setNoProfile] = useState(false);

  const fetchReports = async () => {
    try {
      const { data } = await api.get("/api/dosha/search");
      setReports(data.data ?? []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleCheck = async () => {
    setChecking(true);
    setError("");
    try {
      await api.post("/api/dosha/check", { doshaType: selected });
      await fetchReports();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "";
      if (msg.toLowerCase().includes("profile")) setNoProfile(true);
      setError(msg || "Could not check dosha. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const doshaTypes = Object.keys(DOSHA_LABELS) as DoshaType[];

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-accent)] mb-1">Vedic Analysis</p>
          <h1 className="text-3xl font-bold text-[var(--color-text)]" style={{ fontFamily: "Georgia, serif" }}>
            Dosha Reports
          </h1>
        </div>

        {/* Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Check a Dosha</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mb-6">
            {doshaTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelected(type)}
                className={`rounded-xl border p-3 text-left text-sm transition-all ${
                  selected === type
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                    : "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] hover:border-[var(--color-primary)]"
                }`}
              >
                <div className="font-medium">{DOSHA_LABELS[type]}</div>
                <div className={`mt-1 text-xs ${selected === type ? "text-white/70" : "text-[var(--color-muted)]"}`}>
                  {DOSHA_DESC[type]}
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4">
              <Toast message={error} type="error" onClose={() => setError("")} />
              {noProfile && (
                <div className="mt-3">
                  <Link href="/profile/setup">
                    <Button variant="outline" size="sm">Set Up Profile First</Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          <Button onClick={handleCheck} disabled={checking} size="lg">
            {checking ? <><Spinner className="h-4 w-4" /> Checking…</> : `Check ${DOSHA_LABELS[selected]}`}
          </Button>
        </Card>

        {/* Results */}
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Past Reports</h2>

        {loading ? (
          <div className="flex justify-center py-10"><Spinner className="h-8 w-8" /></div>
        ) : reports.length === 0 ? (
          <p className="text-center text-[var(--color-muted)] py-10">No dosha reports yet. Select a dosha above and check.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {reports.map((r) => (
              <Card key={r.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-[var(--color-text)]">{DOSHA_LABELS[r.doshaType]}</h3>
                      <Badge variant={r.isPresent ? "present" : "absent"}>
                        {r.isPresent ? "Present" : "Not Present"}
                      </Badge>
                      {r.isPresent && (
                        <Badge variant={r.severity}>
                          {r.severity.charAt(0).toUpperCase() + r.severity.slice(1)} severity
                        </Badge>
                      )}
                    </div>
                    {r.summary && r.summary !== "No summary available" && (
                      <p className="text-sm text-[var(--color-muted)] mb-3">{r.summary}</p>
                    )}
                    {r.remedies.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-2">Remedies</p>
                        <ul className="list-disc list-inside space-y-1">
                          {r.remedies.map((remedy, i) => (
                            <li key={i} className="text-sm text-[var(--color-text)]">{remedy}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-[var(--color-muted)] shrink-0">
                    {new Date(r.cachedAt).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 15.2: Commit**

```bash
git add app/dosha/
git commit -m "feat: add Dosha page with type selector, report generation, and past results"
```

---

## Task 16: Admin page

**Files:**
- Create: `Frontend/astrology-app/app/admin/page.tsx`

- [ ] **Step 16.1: Create Admin page**

```tsx
// Frontend/astrology-app/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Toast } from "@/components/ui/Toast";
import { Users } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    api.get("/api/user")
      .then(({ data }) => setUsers(data.data ?? []))
      .catch(() => setError("Could not load users."))
      .finally(() => setLoading(false));
  }, [user, router]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] p-3">
            <Users size={24} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-accent)]">Admin Panel</p>
            <h1 className="text-3xl font-bold text-[var(--color-text)]" style={{ fontFamily: "Georgia, serif" }}>
              User Management
            </h1>
          </div>
        </div>

        <Card className="mb-6 flex items-center gap-4 p-4">
          <div className="text-3xl font-bold text-[var(--color-primary)]">{users.length}</div>
          <div className="text-sm text-[var(--color-muted)]">Total registered users</div>
        </Card>

        {error && <div className="mb-4"><Toast message={error} type="error" /></div>}

        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
        ) : (
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--color-text)]">{u.name}</td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role === "admin" ? "admin" : "user"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 16.2: Commit**

```bash
git add app/admin/
git commit -m "feat: add Admin page with user table and role badges"
```

---

## Task 17: Type-check and verify

- [ ] **Step 17.1: Run TypeScript check on frontend**

```bash
cd Frontend/astrology-app && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 17.2: Start backend and verify health**

```bash
cd Backend/astrology-api && npm run dev
```

In another terminal:
```bash
curl http://localhost:5001/health
```

Expected: `{"success":true,"message":"Astrology API is running",...}`

- [ ] **Step 17.3: Start frontend dev server**

```bash
cd Frontend/astrology-app && npm run dev
```

Expected: server starts on `http://localhost:3000` with no compile errors.

- [ ] **Step 17.4: Manual verification checklist**

Open `http://localhost:3000` and verify:
- [ ] Landing page renders (ivory background, burgundy heading, saffron accent text)
- [ ] "Get Started" → `/auth/signup` → creates account → redirected to `/profile/setup`
- [ ] Profile form saves with just city + country (no lat/lon) → success toast shown
- [ ] `/dashboard` shows profile summary card + Birth Chart and Dosha CTA cards
- [ ] `/chart` → "Generate Birth Chart" button calls backend (may fail with API key error — that's expected without a valid key)
- [ ] `/dosha` → selector shows 5 dosha types → "Check" button calls backend
- [ ] Logout → token cleared → redirected to `/auth/login`
- [ ] Accessing `/dashboard` without a token → redirected to `/auth/login`

- [ ] **Step 17.5: Final commit**

```bash
git add .
git commit -m "chore: verify all pages compile and pass type check"
```

---

## Notes

- **API key required:** Birth chart and dosha generation will fail with a 401/403 from `vedicastroapi.com` until `VEDIC_ASTRO_API_KEY` is set in `Backend/astrology-api/.env`. The UI handles this gracefully with an error toast.
- **MongoDB:** Must be running locally on port 27017, or set `MONGO_URI` in `Backend/astrology-api/.env`.
- **CORS:** The backend uses `cors()` with no origin restriction — fine for development.
- **Admin user:** To create an admin, manually update the `role` field in MongoDB: `db.users.updateOne({email:"your@email.com"},{$set:{role:"admin"}})`.
