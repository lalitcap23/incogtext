import dbConnect from "../../lib/helping/dbconnection";
import UserModal from "../../model/user";
import bcrypt from "bcrypt";
import { z } from "zod";
import { sendVerificationEmail } from "../../lib/helping/sendverificationmail";

// Input validation schema
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Generate username from email (part before @)
function generateUsernameFromEmail(email: string): string {
  const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  // Ensure username is at least 3 characters
  if (baseUsername.length < 3) {
    return baseUsername + Math.floor(Math.random() * 1000).toString();
  }
  return baseUsername;
}

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

    const { email, password } = validationResult.data;

    // Find user by email
    let user = await UserModal.findOne({ email });

    // If user doesn't exist, create new user
    if (!user) {
      // Generate username from email
      let username = generateUsernameFromEmail(email);
      
      // Ensure username is unique
      let usernameExists = await UserModal.findOne({ username });
      let counter = 1;
      while (usernameExists) {
        username = generateUsernameFromEmail(email) + counter.toString();
        usernameExists = await UserModal.findOne({ username });
        counter++;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Generate verification code
      const verifycode = Math.floor(100000 + Math.random() * 900000).toString();
      const expirydate = new Date();
      expirydate.setHours(expirydate.getHours() + 1);

      // Create new user
      user = new UserModal({
        email,
        username,
        password: hashedPassword,
        verified: false,
        verifyCode: verifycode,
        verifyCodeExpires: expirydate,
        isAcceptingMessage: true,
        messages: [],
      });

      // Send verification email
      const emailResponse = await sendVerificationEmail(email, username, verifycode);
      
      if (!emailResponse.success) {
        return Response.json({
          success: false,
          message: emailResponse.message || "Failed to send verification email",
        }, { status: 500 });
      }

      // Save user
      await user.save();

      return Response.json({
        success: true,
        message: "Account created. Please check your email for the verification code.",
        needsVerification: true,
        email: email,
      }, { status: 200 });
    }

    // User exists - check if verified
    if (!user.verified) {
      // Check if password matches (to verify it's the same user)
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return Response.json({
          success: false,
          message: "Invalid password. Please use the correct password.",
        }, { status: 401 });
      }

      // Generate new verification code
      const verifycode = Math.floor(100000 + Math.random() * 900000).toString();
      const expirydate = new Date();
      expirydate.setHours(expirydate.getHours() + 1);

      // Update verification code
      user.verifyCode = verifycode;
      user.verifyCodeExpires = expirydate;
      await user.save();

      // Resend verification email
      const emailResponse = await sendVerificationEmail(email, user.username, verifycode);
      
      if (!emailResponse.success) {
        return Response.json({
          success: false,
          message: emailResponse.message || "Failed to send verification email",
        }, { status: 500 });
      }

      return Response.json({
        success: true,
        message: "Verification email sent. Please check your email for the verification code.",
        needsVerification: true,
        email: email,
      }, { status: 200 });
    }

    // User exists and is verified - verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return Response.json({
        success: false,
        message: "Invalid password",
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