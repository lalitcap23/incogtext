import { auth, currentUser } from "@clerk/nextjs/server";
import dbConnect from "../../lib/helping/dbconnection";
import UserModal from "../../model/user";

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await currentUser();
    
    if (!user || !user.emailAddresses[0]) {
      return Response.json(
        { success: false, message: "User data not found" },
        { status: 400 }
      );
    }

    await dbConnect();

    const email = user.emailAddresses[0].emailAddress;
    const username = user.username || email.split("@")[0];

    // Check if user exists by clerkId
    let dbUser = await UserModal.findOne({ clerkId: userId });

    if (!dbUser) {
      // Check if user exists by email (migration case)
      dbUser = await UserModal.findOne({ email });
      
      if (dbUser) {
        // Update existing user with clerkId
        dbUser.clerkId = userId;
        dbUser.username = username;
        await dbUser.save();
      } else {
        // Create new user
        dbUser = new UserModal({
          clerkId: userId,
          email: email,
          username: username,
          isAcceptingMessage: true,
          messages: [],
        });
        await dbUser.save();
      }
    } else {
      // Update email and username if changed
      dbUser.email = email;
      dbUser.username = username;
      await dbUser.save();
    }

    return Response.json(
      {
        success: true,
        message: "User synced successfully",
        user: {
          id: dbUser._id,
          username: dbUser.username,
          email: dbUser.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error syncing user:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

