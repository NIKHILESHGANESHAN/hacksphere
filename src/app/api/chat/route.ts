import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Message } from "@/models/Message";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { pusherServer } from "@/lib/pusher";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get('matchId');

    await connectToDatabase();
    // Only return messages that are not deleted from abusive content
    const messages = await Message.find({ matchId, isDeleted: false })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });
      
    return NextResponse.json(messages);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Simple profanity list for hackathon rules
const abusiveWords = ["hate", "abuse", "spam", "foul", "nsfw"];

function containsAbusiveWords(text: string) {
  const words = text.toLowerCase().split(/\W+/);
  return words.some(w => abusiveWords.includes(w));
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { matchId, content } = await req.json();

    if (!matchId || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectToDatabase();
    
    const user = await User.findById(decoded.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.isBanned) return NextResponse.json({ error: "You are banned from sending messages." }, { status: 403 });

    let isDeleted = false;
    let autoReply = null;

    if (containsAbusiveWords(content)) {
      isDeleted = true;
      user.warnings += 1;
      
      if (user.warnings >= 3) {
        user.isBanned = true;
      }
      await user.save();

      autoReply = user.isBanned 
        ? "SYSTEM: Message deleted. You have been banned for repeat violations." 
        : `SYSTEM: Message deleted for policy violation. Warning ${user.warnings}/3.`;
    }

    const savedMsg = await Message.create({
      matchId,
      sender: decoded.id,
      content: isDeleted ? "This message was deleted." : content,
      isDeleted
    });

    if (!isDeleted) {
      // Trigger frontend websockets
      await pusherServer.trigger(`chat-${matchId}`, "incoming-message", {
        _id: savedMsg._id,
        content: savedMsg.content,
        sender: { _id: user._id, name: user.name },
        createdAt: savedMsg.createdAt,
      });
    }

    return NextResponse.json({ 
      success: true, 
      warning: autoReply, 
      message: savedMsg 
    });

  } catch (err) {
    console.error("Chat API Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
