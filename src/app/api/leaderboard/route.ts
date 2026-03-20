import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch top 10 students based on points metric
    const leaders = await User.find({ role: "STUDENT" })
      .sort({ points: -1 })
      .limit(10)
      .select("name department year points");
      
    return NextResponse.json(leaders);
  } catch (err) {
    console.error("Leaderboard API Error: ", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
