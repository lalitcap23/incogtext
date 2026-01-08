import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import dbConnect from "../../lib/helping/dbconnection";
import UserModal from "../../model/user";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // If already signed in, return success
    if (session?.user) {
      return Response.json({
        success: true,
        message: "Already signed in",
        user: session.user,
      }, { status: 200 });
    }

    await dbConnect();
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return Response.json({
        success: false,
        message: "Email is required",
      }, { status: 400 });
    }

    // Find verified user by email
    const user = await UserModal.findOne({ email, verified: true });

    if (!user) {
      return Response.json({
        success: false,
        message: "Verified user not found",
      }, { status: 404 });
    }

    // Return user info (client will use NextAuth to sign in)
    return Response.json({
      success: true,
      message: "User ready for sign in",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        verified: user.verified,
        isAcceptingMessage: user.isAcceptingMessage,
      },
    }, { status: 200 });

  } catch (error) {
    console.error("Auto sign-in error:", error);
    return Response.json({
      success: false,
      message: "Internal server error",
    }, { status: 500 });
  }
}

