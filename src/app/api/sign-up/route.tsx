import dbConnect from "../../lib/helping/dbconnection";
import UserModal from "../../model/user";
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
        status: 400,
      });
    }

    const existingUsername = await UserModal.findOne({ username });
    if (existingUsername) {
      return Response.json({
        success: false,
        message: "Username already exists",
        status: 409,
      });
    }

    const existingEmail = await UserModal.findOne({ email });
    if (existingEmail) {
      return Response.json({
        success: false,
        message: "Email already exists",
        status: 409,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifycode = Math.floor(100000 + Math.random() * 900000).toString();
    const expirydate = new Date();
    expirydate.setHours(expirydate.getHours() + 1);

    const newUser = new UserModal({
      email,
      username,
      password: hashedPassword,
      isverified: false, // Make sure your schema uses 'isverified'
      verifycode,
      expirydate,
      isAcceptingMessages: true,
      messages: [],
    });

    const emailResponse = await sendVerificationEmail(email, username, verifycode);

    if (!emailResponse.success) {
      return Response.json({
        success: false,
        message: emailResponse.message,
        status: 500,
      });
    }

    await newUser.save();

    return Response.json({
      success: true,
      message: "User registered successfully. Please check your email for the verification code.",
      status: 200,
    });

  } catch (error) {
    console.error("Error:", error);
    return Response.json({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}