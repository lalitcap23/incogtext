# 🎭 IncogText - Anonymous Messaging Platform

A modern, privacy-focused anonymous messaging platform built with Next.js 14. Send and receive honest feedback without revealing your identity.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-6.20-green?style=flat-square&logo=mongodb)
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)

## ✨ Features

- 🔐 **Clerk Authentication** - Secure user authentication with protected routes
- 💬 **Anonymous Messaging** - Send messages without identity disclosure
- 📊 **Dashboard Analytics** - Visual statistics with charts (daily/weekly/monthly views)
- 🎛️ **Message Control** - Toggle message acceptance on/off
- 🔗 **Shareable Links** - Unique username-based URLs (`/send/username`)
- ✅ **Validation** - Zod schema validation for all inputs
- 🎨 **Modern UI** - Responsive design with Tailwind CSS and gradient animations

## 🛠️ Tech Stack

**Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts  
**Backend:** Next.js API Routes, MongoDB, Mongoose, Clerk, Zod

## � Quick Start

### Prerequisites
- Node.js 18+
- MongoDB account ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Clerk account ([Clerk.com](https://clerk.com))

### Installation

```bash
# Clone and install
git clone https://github.com/yourusername/incogtext.git
cd incogtext
npm install
```

### Environment Setup

Create a `.env` file:

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

## 📊 API Response Format

All API endpoints follow a consistent response structure:

```typescript
{
  success: boolean;
  message: string;
  data?: any;           // Optional data payload
  errors?: any[];       // Validation errors if any
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Clerk](https://clerk.com/) - Authentication Platform
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Recharts](https://recharts.org/) - Chart Library
- [Zod](https://zod.dev/) - Schema Validation

## 📧 Support

For support, email your.email@example.com or open an issue in the GitHub repository.

---

**Made with ❤️ using Next.js and TypeScript**

**How to get these values:**
- **MONGODB_URI**: Get from MongoDB Atlas or your local MongoDB connection string
- **NEXTAUTH_SECRET**: Generate using `openssl rand -base64 32` or any random string generator
- **RESEND_API_KEY**: Sign up at [resend.com](https://resend.com) and get your API key
- **NEXTAUTH_URL**: Your app URL (use `http://localhost:3000` for development)
- **NEXT_PUBLIC_APP_URL**: Same as NEXTAUTH_URL for development

### 3. Run the Development Server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Test the Application

### Step 1: Sign Up
1. Navigate to `http://localhost:3000`
2. Click "Sign in to view your messages" or go to `/sign-up`
3. Fill in the registration form:
   - Username (3-20 characters, alphanumeric and underscores only)
   - Email address
   - Password (min 8 characters, must contain letters)
4. Submit the form
5. Check your email for the verification code (6 digits)

### Step 2: Verify Email
1. After signing up, you'll be redirected to the verify page
2. Enter the 6-digit verification code from your email
3. Click "Verify Email"
4. You'll be redirected to the sign-in page

### Step 3: Sign In
1. Go to `/sign-in` or click the sign-in link
2. Enter your username (or email) and password
3. Click "Sign in"
4. You'll be redirected to the dashboard

### Step 4: View Dashboard
1. On the dashboard, you'll see:
   - Your username (share this for others to send you messages)
   - Message acceptance toggle (on/off)
   - Your received messages (empty initially)

### Step 5: Send Anonymous Messages
1. Open a new incognito/private browser window (or use a different browser)
2. Go to `http://localhost:3000` (home page)
3. Enter the username of the user you want to message
4. Type your anonymous message
5. Click "Send Message"
6. The message will be delivered to that user's dashboard

### Step 6: Receive Messages
1. Go back to your dashboard (signed-in session)
2. Click "Refresh" to see new messages
3. Messages will appear with timestamps

### Step 7: Toggle Message Acceptance
1. On the dashboard, use the toggle button to accept/decline messages
2. When disabled, others cannot send you messages
3. When enabled, anyone can send you anonymous messages

## API Routes

- `GET /api/health` - Check MongoDB connection status
- `POST /api/sign-up` - User registration
- `POST /api/sign-in` - User sign in
- `POST /api/verify` - Email verification
- `POST /api/message` - Send anonymous message
- `GET /api/get-messages` - Get user's messages (protected)
- `POST /api/accept-messages` - Toggle message acceptance (protected)

## Project Structure

```
src/app/
├── api/
│   ├── auth/[...nextauth]/    # NextAuth configuration
│   ├── sign-up/                # Registration endpoint
│   ├── sign-in/                # Sign in endpoint
│   ├── verify/                 # Email verification
│   ├── message/                # Send messages
│  🤝 Contributing

Contributions welcome! Fork the repo, create a feature branch, and submit a PR.

## 📝 License

MIT License - feel free to use this project for learning or personal use.

---

**Made with ❤️ using Next.js 14 &
- Check NEXTAUTH_URL matches your app URL
- Clear browser cookies and try again

### Messages not appearing?
- Ensure user is accepting messages (check toggle)
- Verify username is correct (case-sensitive)
- Check browser console for errors
- Refresh the dashboard

## Build for Production

```bash
npm run build
npm start
```

## Technologies Used

- **Next.js 14** - React framework
- **NextAuth.js** - Authentication
- **MongoDB + Mongoose** - Database
- **Resend** - Email service
- **bcrypt** - Password hashing
- **Zod** - Schema validation
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## License

Private project
