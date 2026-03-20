import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Match } from "@/models/Match";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { status } = await req.json();
    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectToDatabase();
    const resolvedParams = await params;
    const match = await Match.findById(resolvedParams.id);

    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

    if (match.receiver.toString() !== decoded.id) {
      return NextResponse.json({ error: "Unauthorized to update this match request" }, { status: 403 });
    }

    match.status = status;
    await match.save();

    return NextResponse.json(match);
  } catch (err) {
    console.error("Match PUT error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
