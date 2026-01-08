import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import dbConnect from "../../lib/helping/dbconnection";
import UserModal from "../../model/user";
import { acceptMessageSchema } from "../../schemas/acceptMessageSchema";
import { ApiResponse } from "../../type/ApiResponse";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({
        success: false,
        message: "Unauthorized",
      } as ApiResponse, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    // Validate input
    const validationResult = acceptMessageSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json({
        success: false,
        message: "Invalid input",
        errors: validationResult.error.errors,
      } as ApiResponse, { status: 400 });
    }

    const userId = session.user._id;
    const user = await UserModal.findById(userId);

    if (!user) {
      return Response.json({
        success: false,
        message: "User not found",
      } as ApiResponse, { status: 404 });
    }

    // Update message acceptance status
    user.isAcceptingMessage = validationResult.data.acceptMessage;
    await user.save();

    return Response.json({
      success: true,
      message: `Message acceptance ${validationResult.data.acceptMessage ? 'enabled' : 'disabled'}`,
      isAcceptingmessages: validationResult.data.acceptMessage,
    } as ApiResponse, { status: 200 });

  } catch (error) {
    console.error("Error updating message acceptance:", error);
    return Response.json({
      success: false,
      message: "Internal server error",
    } as ApiResponse, { status: 500 });
  }
}

