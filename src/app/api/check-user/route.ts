import dbConnect from "../../lib/helping/dbconnection";
import UserModal from "../../model/user";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "../../type/ApiResponse";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({
        success: false,
        message: "Username is required",
      } as ApiResponse, { status: 400 });
    }

    // Find user by username
    const user = await UserModal.findOne({ username }).select('username isAcceptingMessage');

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      } as ApiResponse, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      username: user.username,
      isAcceptingMessage: user.isAcceptingMessage,
    }, { status: 200 });

  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    } as ApiResponse, { status: 500 });
  }
}

