# 🎫 Evena - Event Ticket Management System

> Modern event ticketing platform built with Next.js 15, TypeScript, and Material-UI

![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Material-UI](https://img.shields.io/badge/MUI-7.3.5-007FFF)

---

## 📋 Prerequisites

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher (hoặc yarn/pnpm)
- **Backend API** running on `http://localhost:8080`

---

## 🚀 Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd frontend/evena
```

### 2. Install Dependencies

```bash
npm install
```

Hoặc sử dụng yarn:

```bash
yarn install
```

### 3. Configure Environment

Tạo file `.env.local` từ template:

```bash
cp .env.example .env.local
```

Chỉnh sửa `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## 🏃 Running the Application

### Development Mode

Chạy development server với hot-reload:

```bash
npm run dev
```

Mở trình duyệt và truy cập: **http://localhost:3000**

### Production Build

```bash
# Build production
npm run build

# Start production server
npm start
```

Ứng dụng sẽ chạy trên: **http://localhost:3000**

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Chạy development server (port 3000) |
| `npm run build` | Build production bundle |
| `npm start` | Chạy production server |
| `npm run lint` | Kiểm tra code quality với ESLint |
| `npm run type-check` | Kiểm tra TypeScript types |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: Material-UI v7.3.5
- **State Management**:
  - Redux Toolkit v2.10.1 (Client/UI state)
  - TanStack Query v5.90.12 (Server state)
- **Forms**: Formik + Yup
- **Maps**: React Leaflet v5.0.0
- **Language**: TypeScript (strict mode)

---

## 🎯 Key Features

- ✅ **Role-Based Access Control** (ADMIN, ORGANIZER, CUSTOMER)
- ✅ **Interactive Leaflet Maps** for venue location
- ✅ **Optimized State Management** (Server/Client separation)
- ✅ **TypeScript Path Aliases** for clean imports
- ✅ **Shared Layout Data Context** (reduces API calls by 67%)

---

## 📂 Project Structure

```
frontend/evena/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, register)
│   ├── dashboard/
│   │   ├── (customer)/          # Customer dashboard
│   │   ├── organizer/           # Organizer dashboard
│   │   └── admin/               # Admin dashboard
│   ├── layout.tsx               # Root layout
│   └── providers.tsx            # Global providers
│
├── src/
│   ├── components/              # Reusable components
│   │   ├── RoleGuard/          # Role-based route protection
│   │   ├── LeafletMapPicker/   # Interactive map picker
│   │   └── CreateVenueForm/    # Venue form with map
│   │
│   ├── hooks/
│   │   ├── queries/            # React Query hooks
│   │   └── useAuth.ts          # Authentication hook
│   │
│   ├── stores/                 # Redux store
│   │   ├── slices/            # UI state slices
│   │   ├── services/          # RTK Query APIs (legacy)
│   │   └── types/             # Type definitions
│   │
│   ├── lib/                   # Utilities
│   │   └── api-client.ts     # API fetch wrapper
│   │
│   ├── providers/             # Context providers
│   │   └── QueryProvider.tsx # React Query provider
│   │
│   └── utils/                 # Helper functions
│       ├── validationSchema/  # Formik/Yup schemas
│       └── storage/          # localStorage helpers
│
├── public/                    # Static assets
├── .env.local                # Environment variables
└── tsconfig.json             # TypeScript config
```

---

## 🔐 User Roles

- **ADMIN**: Quản lý categories, venues, organizations
- **ORGANIZER**: Tạo và quản lý events, organizations
- **CUSTOMER**: Đặt vé và xem events

---

## 🌐 Environment Variables

```env
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## 🐛 Troubleshooting

### Port 3000 đã được sử dụng

```bash
# Thay đổi port
PORT=3001 npm run dev
```

### Build errors sau khi cài package mới

```bash
# Xóa cache và rebuild
rm -rf .next
npm run build
```

### TypeScript errors

```bash
# Kiểm tra lỗi TypeScript
npm run type-check
```

---

## 📝 Notes

- Backend API phải chạy trước khi start frontend
- Default admin credentials: kiểm tra backend documentation
- Build time khoảng 10-30 giây tùy máy

---

**🎉 Happy Coding!**
