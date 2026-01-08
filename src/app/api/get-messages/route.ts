import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import dbConnect from "../../lib/helping/dbconnection";
import UserModal from "../../model/user";
import { ApiResponse } from "../../type/ApiResponse";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({
        success: false,
        message: "Unauthorized",
      } as ApiResponse, { status: 401 });
    }

    await dbConnect();
    const userId = session.user._id;
    const user = await UserModal.findById(userId).select("-password -verifyCode");

    if (!user) {
      return Response.json({
        success: false,
        message: "User not found",
      } as ApiResponse, { status: 404 });
    }

    return Response.json({
      success: true,
      messages: user.messages || [],
      isAcceptingMessage: user.isAcceptingMessage,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching messages:", error);
    return Response.json({
      success: false,
      message: "Internal server error",
    } as ApiResponse, { status: 500 });
  }
}

