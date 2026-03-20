import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Match } from "@/models/Match";
import { User } from "@/models/User";
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
    
    // Fetch user matches mapping
    const matches = await Match.find({
      $or: [{ sender: decoded.id }, { receiver: decoded.id }]
    }).populate({ path: "sender", model: User, select: "name skills interests year department" })
      .populate({ path: "receiver", model: User, select: "name skills interests year department" })
      .sort({ createdAt: -1 });

    // XConnect Core logic: Anonymize identity if pending/rejected
    const anonymizedMatches = matches.map(match => {
      const isSender = match.sender._id.toString() === decoded.id;
      const otherParty = isSender ? match.receiver : match.sender;
      
      let displayParty = { ...otherParty.toObject() } as any;

      if (match.status !== "ACCEPTED") {
        displayParty.name = "Anonymous Student";
        delete displayParty.department; 
      }

      return {
        _id: match._id,
        status: match.status,
        eventId: match.eventId,
        isSender,
        otherParty: displayParty,
        createdAt: match.createdAt
      };
    });

    return NextResponse.json(anonymizedMatches);
  } catch (err) {
    console.error("Matches GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { receiverId, eventId } = await req.json();

    if (!receiverId || receiverId === decoded.id) {
      return NextResponse.json({ error: "Invalid receiver" }, { status: 400 });
    }

    await connectToDatabase();
    
    const existing = await Match.findOne({
      $or: [
        { sender: decoded.id, receiver: receiverId },
        { sender: receiverId, receiver: decoded.id }
      ]
    });

    if (existing) {
      return NextResponse.json({ error: "Match request already exists" }, { status: 400 });
    }

    const newMatch = await Match.create({
      sender: decoded.id,
      receiver: receiverId,
      eventId: eventId || null
    });

    // Create Notification for Receiver
    const senderData = await User.findById(decoded.id).select("name");
    await Notification.create({
      userId: receiverId,
      type: "MATCH_REQUEST",
      title: "New Team Request",
      message: `${senderData?.name || "A student"} wants to connect with you!`,
      link: "/dashboard?tab=requests"
    });

    return NextResponse.json(newMatch, { status: 201 });
  } catch (err) {
    console.error("Matches POST error:", err);
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

    const { matchId, status } = await req.json();

    if (!matchId || !["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    await connectToDatabase();
    
    const match = await Match.findOne({ _id: matchId, receiver: decoded.id });
    if (!match) {
      return NextResponse.json({ error: "Match request not found or unauthorized" }, { status: 404 });
    }

    if (match.status !== "PENDING") {
      return NextResponse.json({ error: "Match is already processed" }, { status: 400 });
    }

    match.status = status;
    await match.save();

    // Notify original sender
    if (status === "ACCEPTED") {
      const receiverData = await User.findById(decoded.id).select("name");
      await Notification.create({
        userId: match.sender,
        type: "MATCH_ACCEPTED",
        title: "Request Accepted!",
        message: `${receiverData?.name || "A student"} accepted your team request! You can now chat.`,
        link: "/chat"
      });
    }

    return NextResponse.json(match);
  } catch (err) {
    console.error("Matches PATCH error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
