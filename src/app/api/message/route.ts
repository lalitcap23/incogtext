import dbConnect from "../../lib/helping/dbconnection";
import UserModal from "../../model/user";
import { messageSchema } from "../../schemas/messageSchema";
import { ApiResponse } from "../../type/ApiResponse";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { username, message } = body;

    // Validate input
    const validationResult = messageSchema.safeParse({ content: message });
    if (!validationResult.success) {
      return Response.json({
        success: false,
        message: "Invalid message format",
        errors: validationResult.error.errors,
      } as ApiResponse, { status: 400 });
    }

    if (!username) {
      return Response.json({
        success: false,
        message: "Username is required",
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

    // Check if user is accepting messages
    if (!user.isAcceptingMessage) {
      return Response.json({
        success: false,
        message: "User is not accepting messages at the moment",
        isAcceptingmessages: false,
      } as ApiResponse, { status: 403 });
    }

    // Add message to user's messages array
    user.messages.push({
      content: validationResult.data.content,
      createdAt: new Date(),
    });

    await user.save();

    return Response.json({
      success: true,
      message: "Message sent successfully",
    } as ApiResponse, { status: 200 });

  } catch (error) {
    console.error("Error sending message:", error);
    return Response.json({
      success: false,
      message: "Internal server error",
    } as ApiResponse, { status: 500 });
  }
}

