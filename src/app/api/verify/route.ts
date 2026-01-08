import dbConnect from "../../lib/helping/dbconnection";
import UserModal from "../../model/user";
import PendingUserModal from "../../model/pendingUser";
import { verifySchema } from "../../schemas/verifySchema";
import { ApiResponse } from "../../type/ApiResponse";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return Response.json({
        success: false,
        message: "Email and verification code are required",
      } as ApiResponse, { status: 400 });
    }

    // Validate code format
    const validationResult = verifySchema.safeParse({ code });
    if (!validationResult.success) {
      return Response.json({
        success: false,
        message: "Invalid verification code format",
        errors: validationResult.error.errors,
      } as ApiResponse, { status: 400 });
    }

    // Find pending user by email
    const pendingUser = await PendingUserModal.findOne({ email });

    if (!pendingUser) {
      return Response.json({
        success: false,
        message: "No pending verification found. Please sign up again.",
      } as ApiResponse, { status: 404 });
    }

    // Check if verification code matches
    if (pendingUser.verifyCode !== code) {
      return Response.json({
        success: false,
        message: "Invalid verification code",
      } as ApiResponse, { status: 401 });
    }

    // Check if verification code has expired (10 minutes)
    if (pendingUser.verifyCodeExpires < new Date()) {
      // Delete expired pending user
      await PendingUserModal.deleteOne({ email });
      return Response.json({
        success: false,
        message: "Verification code has expired. Please sign up again.",
        expired: true,
      } as ApiResponse, { status: 401 });
    }

    // Check if user already exists (might exist if they signed in before verifying)
    const existingUser = await UserModal.findOne({
      $or: [{ email: pendingUser.email }, { username: pendingUser.username }]
    });

    if (existingUser) {
      // If user exists but not verified, update them to verified
      if (!existingUser.verified) {
        existingUser.verified = true;
        existingUser.verifyCode = "";
        existingUser.verifyCodeExpires = new Date();
        const updatedUser = await existingUser.save();
        
        // Verify user was updated and saved
        if (!updatedUser || !updatedUser.email || !updatedUser.password) {
          console.error("Failed to update user verification status in database");
          return Response.json({
            success: false,
            message: "Failed to update user data",
          } as ApiResponse, { status: 500 });
        }
        
        console.log(`User verified and saved: ${updatedUser.email}, Username: ${updatedUser.username}`);
        
        // Delete pending user
        await PendingUserModal.deleteOne({ email });
        
        return Response.json({
          success: true,
          message: "Email verified successfully! Redirecting to dashboard...",
          user: {
            id: updatedUser._id,
            email: updatedUser.email,
            username: updatedUser.username,
            verified: updatedUser.verified,
          },
          // Include email and username for auto-sign-in
          autoSignIn: true,
          email: updatedUser.email,
          username: updatedUser.username,
        } as ApiResponse, { status: 200 });
      } else {
        // User already verified, delete pending user
        await PendingUserModal.deleteOne({ email });
        return Response.json({
          success: false,
          message: "User already exists and is verified. Please sign in.",
        } as ApiResponse, { status: 409 });
      }
    }

    // Create actual user in main database
    const newUser = new UserModal({
      email: pendingUser.email,
      username: pendingUser.username,
      password: pendingUser.password, // Already hashed
      verified: true,
      verifyCode: "",
      verifyCodeExpires: new Date(),
      isAcceptingMessage: true,
      messages: [],
    });

    const savedUser = await newUser.save();

    // Verify user was saved with all data
    if (!savedUser || !savedUser.email || !savedUser.password) {
      console.error("Failed to save user data to database");
      return Response.json({
        success: false,
        message: "Failed to save user data",
      } as ApiResponse, { status: 500 });
    }

    console.log(`User saved successfully: ${savedUser.email}, Username: ${savedUser.username}, Verified: ${savedUser.verified}`);

    // Delete pending user after successful verification
    await PendingUserModal.deleteOne({ email });

    return Response.json({
      success: true,
      message: "Email verified successfully! Redirecting to dashboard...",
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        verified: newUser.verified,
      },
      // Include email and username for auto-sign-in
      autoSignIn: true,
      email: newUser.email,
      username: newUser.username,
    } as ApiResponse, { status: 200 });

  } catch (error) {
    console.error("Error verifying email:", error);
    return Response.json({
      success: false,
      message: "Internal server error",
    } as ApiResponse, { status: 500 });
  }
}

