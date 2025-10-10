import dbConnect from "../../lib/helping/dbconnection";
import UserModal from "../../model/user";
import bcrypt from "bcrypt";
import { z } from "zod";

// Input validation schema
const signInSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Validate input
    const validationResult = signInSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json({
        success: false,
        message: "Invalid input",
        errors: validationResult.error.errors,
      }, { status: 400 });
    }

    const { username, password } = validationResult.data;

    // Find user by username or email
    const user = await UserModal.findOne({
      $or: [
        { username: username },
        { email: username },
      ],
    });

    if (!user) {
      return Response.json({
        success: false,
        message: "Invalid credentials",
      }, { status: 401 });
    }

    // Check if user is verified
    if (!user.verified) {
      return Response.json({
        success: false,
        message: "Please verify your email before signing in",
        needsVerification: true,
      }, { status: 403 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return Response.json({
        success: false,
        message: "Invalid credentials",
      }, { status: 401 });
    }

    // Return success with user info (excluding sensitive data)
    return Response.json({
      success: true,
      message: "Sign in successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        verified: user.verified,
        isAcceptingMessage: user.isAcceptingMessage,
      },
    }, { status: 200 });

  } catch (error) {
    console.error("Sign-in error:", error);
    return Response.json({
      success: false,
      message: "Internal server error",
    }, { status: 500 });
  }
}

// Handle other methods
export async function GET() {
  return Response.json({
    success: false,
    message: "Method not allowed. Use POST to sign in.",
  }, { status: 405 });
}

export async function PUT() {
  return Response.json({
    success: false,
    message: "Method not allowed. Use POST to sign in.",
  }, { status: 405 });
}

export async function DELETE() {
  return Response.json({
    success: false,
    message: "Method not allowed. Use POST to sign in.",
  }, { status: 405 });
}