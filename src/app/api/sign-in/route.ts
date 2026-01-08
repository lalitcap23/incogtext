import dbConnect from "../../lib/helping/dbconnection";
import UserModal from "../../model/user";
import PendingUserModal from "../../model/pendingUser";
import bcrypt from "bcrypt";
import { z } from "zod";
import { sendVerificationEmail } from "../../lib/helping/sendverificationmail";

// Input validation schema
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Test account credentials (bypass verification for development)
const TEST_ACCOUNT = {
  email: process.env.TEST_EMAIL || "lalitrajput232002@gmail.com",
  password: process.env.TEST_PASSWORD || "11111",
  username: "lalit"
};

// Generate username from email
function generateUsernameFromEmail(email: string): string {
  const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
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

    // Check if this is the test account (bypass verification)
    if (email === TEST_ACCOUNT.email && password === TEST_ACCOUNT.password) {
      let testUser = await UserModal.findOne({ email: TEST_ACCOUNT.email });
      
      if (!testUser) {
        // Create test user if doesn't exist
        const hashedPassword = await bcrypt.hash(TEST_ACCOUNT.password, 10);
        testUser = new UserModal({
          email: TEST_ACCOUNT.email,
          username: TEST_ACCOUNT.username,
          password: hashedPassword,
          verified: true, // Test account is auto-verified
          verifyCode: "",
          verifyCodeExpires: new Date(),
          isAcceptingMessage: true,
          messages: [],
        });
        const savedTestUser = await testUser.save();
        
        // Verify test user was saved
        if (!savedTestUser || !savedTestUser.email || !savedTestUser.password) {
          console.error("Failed to save test user data to database");
          return Response.json({
            success: false,
            message: "Failed to save user data",
          }, { status: 500 });
        }
        
        console.log(`Test user saved successfully: ${savedTestUser.email}, Username: ${savedTestUser.username}`);
      } else if (!testUser.verified) {
        // Auto-verify test account
        testUser.verified = true;
        const updatedTestUser = await testUser.save();
        console.log(`Test user verified and saved: ${updatedTestUser.email}`);
      }

      return Response.json({
        success: true,
        message: "Sign in successful",
        user: {
          id: testUser._id,
          username: testUser.username,
          email: testUser.email,
          verified: testUser.verified,
          isAcceptingMessage: testUser.isAcceptingMessage,
        },
      }, { status: 200 });
    }

    // Find user by email
    const user = await UserModal.findOne({ email });

    // If user doesn't exist, create pending user and send verification
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
      expirydate.setMinutes(expirydate.getMinutes() + 10); // 10 minutes expiry

      // Delete any existing pending user
      await PendingUserModal.deleteMany({ 
        $or: [{ email }, { username }] 
      });

      // Create pending user
      const pendingUser = new PendingUserModal({
        email,
        username,
        password: hashedPassword,
        verifyCode: verifycode,
        verifyCodeExpires: expirydate,
      });

      const savedPendingUser = await pendingUser.save();

      // Verify pending user was saved
      if (!savedPendingUser || !savedPendingUser.email || !savedPendingUser.password) {
        console.error("Failed to save pending user data to database");
        return Response.json({
          success: false,
          message: "Failed to save user data",
        }, { status: 500 });
      }

      console.log(`Pending user saved successfully: ${savedPendingUser.email}, Username: ${savedPendingUser.username}`);

      // Send verification email
      const emailResponse = await sendVerificationEmail(email, username, verifycode);
      
      // In development, allow the flow to continue even if email fails (code is logged to console)
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (!emailResponse.success && !isDevelopment) {
        await PendingUserModal.deleteOne({ email });
        return Response.json({
          success: false,
          message: emailResponse.message || "Failed to send verification email",
        }, { status: 500 });
      }
      
      // In development, include the code in the response if email failed
      const devMessage = isDevelopment && !emailResponse.success
        ? `Verification code logged to console: ${verifycode} (Check server logs)`
        : "Account created. Please check your email for the verification code.";

      return Response.json({
        success: true,
        message: devMessage,
        needsVerification: true,
        email: email,
        verifyCode: isDevelopment && !emailResponse.success ? verifycode : undefined, // Include code in dev mode only if email failed
      }, { status: 200 });
    }

    // User exists - check if verified
    if (!user.verified) {
      // Verify password matches
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return Response.json({
          success: false,
          message: "Invalid password. Please use the correct password.",
        }, { status: 401 });
      }

      // Check if there's a pending user (might have expired)
      let pendingUser = await PendingUserModal.findOne({ email });
      
      // Generate new verification code
      const verifycode = Math.floor(100000 + Math.random() * 900000).toString();
      const expirydate = new Date();
      expirydate.setMinutes(expirydate.getMinutes() + 10);

      if (!pendingUser) {
        // Create new pending user if doesn't exist
        pendingUser = new PendingUserModal({
          email: user.email,
          username: user.username,
          password: user.password,
          verifyCode: verifycode,
          verifyCodeExpires: expirydate,
        });
      } else {
        // Update existing pending user
        pendingUser.verifyCode = verifycode;
        pendingUser.verifyCodeExpires = expirydate;
      }

      await pendingUser.save();

      // Resend verification email
      const emailResponse = await sendVerificationEmail(email, user.username, verifycode);
      
      // In development, allow the flow to continue even if email fails
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (!emailResponse.success && !isDevelopment) {
        return Response.json({
          success: false,
          message: emailResponse.message || "Failed to send verification email",
        }, { status: 500 });
      }
      
      // In development, include the code in the response if email failed
      const devMessage = isDevelopment && !emailResponse.success
        ? `Verification code logged to console: ${verifycode} (Check server logs)`
        : "Verification email sent. Please check your email for the verification code.";

      return Response.json({
        success: true,
        message: devMessage,
        needsVerification: true,
        email: email,
        verifyCode: isDevelopment && !emailResponse.success ? verifycode : undefined, // Include code in dev mode if email failed
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

    // Return success with user info
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