# 🎫 Evena - Event Ticket Management System

> Modern event ticketing platform built with Next.js 15, TypeScript, and Material-UI

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Material-UI](https://img.shields.io/badge/MUI-7.3.5-007FFF)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on `localhost:8080`

### Installation & Setup

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local

# 3. Edit .env.local with your configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# 4. Start development server
npm run dev

# 5. Open http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

---

## 📂 Project Structure

```
frontend/evena/
├── app/                          # Next.js App Router (Pages & API Routes)
│   ├── (auth)/
│   │   ├── login/page.tsx       # ✨ Refactored (151→17 lines)
│   │   ├── register/
│   │   └── verify-email/
│   ├── dashboard/
│   │   ├── (customer)/
│   │   └── organizer/
│   ├── api/auth/                # BFF API routes
│   ├── layout.tsx               # Root layout
│   └── providers.tsx            # ✨ Updated with SnackbarProvider
│
├── src/
│   ├── components/
│   │   ├── common/              # ✨ NEW
│   │   │   └── AuthLink/        # Reusable link component
│   │   ├── auth/                # ✨ NEW
│   │   │   └── LoginForm/       # Login form extracted
│   │   ├── layout/
│   │   │   └── AuthLayout/      # ✨ NEW - Auth page layout
│   │   ├── forms/               # Form components
│   │   └── cards/               # Display cards
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSnackbar.tsx      # ✨ NEW - Global notifications
│   │   ├── useLogin.ts          # ✨ NEW - Login logic
│   │   └── useCacheManager.ts
│   │
│   ├── stores/                  # Redux Toolkit + RTK Query
│   │   ├── store.ts
│   │   ├── slices/              # Redux slices
│   │   ├── services/            # API services
│   │   └── types/               # Type definitions
│   │
│   └── utils/
│       ├── constants/
│       │   └── theme.ts         # ✨ NEW - Theme constants
│       ├── validationSchema/    # Formik schemas
│       ├── storage/             # Cookie/localStorage helpers
│       └── logger.ts            # ✨ NEW - Logging utility
│
├── public/                      # Static assets
├── .env.example                 # ✨ NEW - Environment template
├── tsconfig.json                # ✨ Updated - Path aliases fixed
│
└── 📚 Documentation
    ├── README.md                # This file

```
