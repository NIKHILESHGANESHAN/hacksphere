import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Notification } from "@/models/Notification";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await connectToDatabase();
    
    const notifications = await Notification.find({ userId: decoded.id })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json(notifications);
  } catch (err) {
    console.error("Notifications GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { notificationId } = await req.json();

    await connectToDatabase();
    
    // Mark specific notification as read, or all if no ID provided
    if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId: decoded.id },
        { $set: { isRead: true } }
      );
    } else {
      await Notification.updateMany(
        { userId: decoded.id, isRead: false },
        { $set: { isRead: true } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Notifications PATCH error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
