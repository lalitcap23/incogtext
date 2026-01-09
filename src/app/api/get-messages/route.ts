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

    const messages = user.messages || [];
    
    // Calculate statistics
    const totalMessages = messages.length;
    
    // Calculate average messages per day
    const now = new Date();
    const firstMessageDate = messages.length > 0 
      ? new Date(Math.min(...messages.map((m: any) => new Date(m.createdAt).getTime())))
      : now;
    const daysDiff = Math.max(1, Math.ceil((now.getTime() - firstMessageDate.getTime()) / (1000 * 60 * 60 * 24)));
    const avgMessagesPerDay = totalMessages > 0 ? (totalMessages / daysDiff).toFixed(2) : '0.00';
    
    // Messages per day (last 30 days)
    const messagesPerDay: { date: string; count: number }[] = [];
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (29 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });
    
    last30Days.forEach((date) => {
      const dateStr = date.toISOString().split('T')[0];
      const count = messages.filter((m: any) => {
        const msgDate = new Date(m.createdAt);
        msgDate.setHours(0, 0, 0, 0);
        return msgDate.getTime() === date.getTime();
      }).length;
      messagesPerDay.push({ date: dateStr, count });
    });
    
    // Messages per week (last 12 weeks)
    const messagesPerWeek: { week: string; count: number }[] = [];
    const last12Weeks = Array.from({ length: 12 }, (_, i) => {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + (11 - i) * 7));
      weekStart.setHours(0, 0, 0, 0);
      return weekStart;
    });
    
    last12Weeks.forEach((weekStart) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const weekStr = `${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`;
      const count = messages.filter((m: any) => {
        const msgDate = new Date(m.createdAt);
        return msgDate >= weekStart && msgDate <= weekEnd;
      }).length;
      messagesPerWeek.push({ week: weekStr, count });
    });
    
    // Messages per month (last 12 months)
    const messagesPerMonth: { month: string; count: number }[] = [];
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return monthStart;
    });
    
    last12Months.forEach((monthStart) => {
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      const monthStr = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const count = messages.filter((m: any) => {
        const msgDate = new Date(m.createdAt);
        return msgDate >= monthStart && msgDate <= monthEnd;
      }).length;
      messagesPerMonth.push({ month: monthStr, count });
    });

    return Response.json({
      success: true,
      messages: messages,
      isAcceptingMessage: user.isAcceptingMessage,
      statistics: {
        totalMessages,
        avgMessagesPerDay: parseFloat(avgMessagesPerDay),
        messagesPerDay,
        messagesPerWeek,
        messagesPerMonth,
      },
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching messages:", error);
    return Response.json({
      success: false,
      message: "Internal server error",
    } as ApiResponse, { status: 500 });
  }
}

