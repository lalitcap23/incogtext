import dbConnect from "../../lib/helping/dbconnection";
import UserModal from "../../model/user";
import PendingUserModal from "../../model/pendingUser";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "../../lib/helping/sendverificationmail";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { email, username, password } = body;

    if (!email || !username || !password) {
      return Response.json({
        success: false,
        message: "Email, username, and password are required.",
      }, { status: 400 });
    }

    // Check if username or email already exists in main user collection
    const existingUsername = await UserModal.findOne({ username });
    if (existingUsername) {
      return Response.json({
        success: false,
        message: "Username already exists",
      }, { status: 409 });
    }

    const existingEmail = await UserModal.findOne({ email });
    if (existingEmail) {
      return Response.json({
        success: false,
        message: "Email already exists",
      }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate 6-digit verification code
    const verifycode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 10 minutes from now
    const expirydate = new Date();
    expirydate.setMinutes(expirydate.getMinutes() + 10);

    // Delete any existing pending user with same email or username
    await PendingUserModal.deleteMany({ 
      $or: [{ email }, { username }] 
    });

    // Create pending user (will auto-delete after 10 minutes)
    const pendingUser = new PendingUserModal({
      email,
      username,
      password: hashedPassword,
      verifyCode: verifycode,
      verifyCodeExpires: expirydate,
    });

    await pendingUser.save();

    // Send verification email
    const emailResponse = await sendVerificationEmail(email, username, verifycode);

    if (!emailResponse.success) {
      // Delete pending user if email fails
      await PendingUserModal.deleteOne({ email });
      return Response.json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: "Verification code sent to your email. Please verify within 10 minutes.",
      expiresIn: "10 minutes",
    }, { status: 200 });

  } catch (error) {
    console.error("Sign-up error:", error);
    return Response.json({
      success: false,
      message: "Internal server error",
    }, { status: 500 });
  }
}