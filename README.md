# IncogText - Anonymous Messaging App

A private messaging application built with Next.js where users can send and receive anonymous messages.

## Features

- 🔐 User authentication with NextAuth.js
- ✉️ Email verification via Resend
- 💬 Send anonymous messages to users by username
- 📬 View received messages in dashboard
- 🎛️ Toggle message acceptance on/off
- 🔒 Secure password hashing with bcrypt
- 📱 Responsive UI with Tailwind CSS

## Prerequisites

- Node.js 18+ or Bun
- MongoDB database (local or MongoDB Atlas)
- Resend account for email sending
- Environment variables configured

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Resend API Key for Email
RESEND_API_KEY=your_resend_api_key_here

# App URL (for email verification links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

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
│   ├── get-messages/           # Fetch messages
│   └── accept-messages/        # Toggle acceptance
├── dashboard/                  # User dashboard (protected)
├── sign-up/                    # Registration page
├── sign-in/                    # Sign in page
├── verify/                     # Email verification page
├── Sign-in/                    # Alternative sign-in route
├── lib/                        # Utilities
├── model/                      # MongoDB models
├── schemas/                    # Zod validation schemas
└── type/                       # TypeScript types
```

## Troubleshooting

### Email not received?
- Check spam folder
- Verify RESEND_API_KEY is correct
- Check Resend dashboard for email logs
- Ensure email domain is verified in Resend (for production)

### MongoDB connection error?
- Verify MONGODB_URI is correct
- Check if MongoDB is running (for local)
- Ensure network access is allowed (for Atlas)

### Authentication not working?
- Verify NEXTAUTH_SECRET is set
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
