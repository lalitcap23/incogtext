# 🎭 IncogText - Anonymous Messaging Platform

A modern, privacy-focused anonymous messaging platform built with Next.js 14. Send and receive honest feedback without revealing your identity.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-6.20-green?style=flat-square&logo=mongodb)
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)

## ✨ Features

- 🔐 **Clerk Authentication** - Secure user authentication
- 💬 **Anonymous Messaging** - Send messages without identity disclosure
- 📊 **Dashboard Analytics** - Visual statistics with charts (daily/weekly/monthly)
- 🎛️ **Message Control** - Toggle message acceptance on/off
- 🔗 **Shareable Links** - Unique username-based URLs (`/send/username`)
- 🎨 **Modern UI** - Responsive design with Tailwind CSS

## 🛠️ Tech Stack

**Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts  
**Backend:** Next.js API Routes, MongoDB, Mongoose, Clerk, Zod

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB account ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Clerk account ([Clerk.com](https://clerk.com))

### Installation

```bash
git clone https://github.com/yourusername/incogtext.git
cd incogtext
npm install
```

### Environment Setup

Create a `.env.local` file:

```env
MONGODB_URI="your_mongodb_connection_string"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
```

### Run

```bash
npm run dev  # Development at http://localhost:3000
npm run build && npm start  # Production
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/              # API routes (message, sync-user, get-messages, etc.)
│   ├── dashboard/        # User dashboard with statistics
│   ├── send/[username]/  # Send message page
│   ├── model/            # Mongoose schemas
│   ├── schemas/          # Zod validation
│   └── lib/              # Database connection
└── middleware.ts         # Clerk route protection
```

## 🎯 How It Works

1. **Sign In** - Authenticate via Clerk (Google, Email)
2. **Get Your Link** - Share `/send/username` to receive messages
3. **Receive Messages** - View in dashboard with analytics
4. **Send Messages** - Anyone can send anonymously (no login required)

## 📊 API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/message` | POST | No | Send anonymous message |
| `/api/get-messages` | GET | Yes | Fetch messages & stats |
| `/api/accept-messages` | POST | Yes | Toggle acceptance |
| `/api/check-user` | GET | No | Check user status |
| `/api/health` | GET | No | MongoDB health check |
| `/api/cron` | GET | No | Keep MongoDB awake |

## 📝 License

MIT License

---

**Made with ❤️ using Next.js and TypeScript**
