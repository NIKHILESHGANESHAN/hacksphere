import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";
import { Match } from "@/models/Match";
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
    
    // 1. Fetch current user
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 2. Fetch all other users
    const allUsers = await User.find({ _id: { $ne: currentUser._id }, role: "STUDENT" }).select("-warnings -isBanned -points");

    // 3. Fetch existing matches to exclude them
    const existingMatches = await Match.find({
      $or: [{ sender: currentUser._id }, { receiver: currentUser._id }]
    });
    
    const exclusionIds = new Set(
      existingMatches.map(m => 
        m.sender.toString() === currentUser._id.toString() ? m.receiver.toString() : m.sender.toString()
      )
    );

    // 4. Algorithm mapping
    const mySkills = new Set((currentUser.skills || []).map((s: string) => s.toLowerCase()));
    const myInterests = new Set((currentUser.interests || []).map((s: string) => s.toLowerCase()));

    const scoredUsers = allUsers
      .filter(u => !exclusionIds.has(u._id.toString()))
      .map(user => {
        let score = 0;
        
        // Skill synergy (+5 per overlapping skill)
        (user.skills || []).forEach((skill: string) => {
          if (mySkills.has(skill.toLowerCase())) score += 5;
        });

        // Interest synergy (+3 per overlapping interest)
        (user.interests || []).forEach((interest: string) => {
          if (myInterests.has(interest.toLowerCase())) score += 3;
        });

        // Year grouping (+2 for same year)
        if (user.year && currentUser.year && user.year === currentUser.year) {
           score += 2;
        }

        return { user, score };
      });

    // Bubble highest ranked matches
    scoredUsers.sort((a, b) => b.score - a.score);
    // Return Top 10 potential teammates
    const recommendations = scoredUsers.slice(0, 10).map(item => ({
       ...item.user.toObject(),
       matchScore: item.score
    }));

    return NextResponse.json(recommendations);
  } catch (err) {
    console.error("XConnect GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
