import dbConnect from "../../lib/helping/dbconnection";
import UserModal from "../../model/user";
import { verifySchema } from "../../schemas/verifySchema";
import { ApiResponse } from "../../type/ApiResponse";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { username, code } = body;

    if (!username || !code) {
      return Response.json({
        success: false,
        message: "Username and verification code are required",
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

    // Find user by username
    const user = await UserModal.findOne({ username });

    if (!user) {
      return Response.json({
        success: false,
        message: "User not found",
      } as ApiResponse, { status: 404 });
    }

    // Check if user is already verified
    if (user.verified) {
      return Response.json({
        success: false,
        message: "User is already verified",
      } as ApiResponse, { status: 400 });
    }

    // Check if verification code matches
    if (user.verifyCode !== code) {
      return Response.json({
        success: false,
        message: "Invalid verification code",
      } as ApiResponse, { status: 401 });
    }

    // Check if verification code has expired
    if (user.verifyCodeExpires < new Date()) {
      return Response.json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      } as ApiResponse, { status: 401 });
    }

    // Verify the user
    user.verified = true;
    user.verifyCode = "";
    user.verifyCodeExpires = new Date();
    await user.save();

    return Response.json({
      success: true,
      message: "Email verified successfully",
    } as ApiResponse, { status: 200 });

  } catch (error) {
    console.error("Error verifying email:", error);
    return Response.json({
      success: false,
      message: "Internal server error",
    } as ApiResponse, { status: 500 });
  }
}

