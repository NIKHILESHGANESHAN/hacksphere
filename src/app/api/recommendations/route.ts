import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Event } from "@/models/Event";
import { User } from "@/models/User";
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
    
    // Fetch user profile metrics
    const user = await User.findById(decoded.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const userSkills = new Set((user.skills || []).map((s: string) => s.toLowerCase()));
    
    // Fetch upcoming events only
    const allEvents = await Event.find({ dateTime: { $gte: new Date() } });

    // AI Rule-based Weights Matrix Evaluation
    const scoredEvents = allEvents.map(event => {
      let score = 0;
      
      // Skill overlap analysis (High Weight)
      (event.requiredSkills || []).forEach((skill: string) => {
        if (userSkills.has(skill.toLowerCase())) score += 5;
      });

      // Domain vs Interest correlation (Medium Weight)
      const userInterestsStr = (user.interests || []).join(" ").toLowerCase();
      const departmentStr = (user.department || "").toLowerCase();
      const domainLower = event.domain.toLowerCase();

      if (userInterestsStr.includes(domainLower)) score += 3;
      if (departmentStr.includes(domainLower)) score += 2;

      return { event, score };
    });

    // Bubble highest ranked
    scoredEvents.sort((a, b) => b.score - a.score);
    // Take Top 4
    const recommended = scoredEvents.slice(0, 4).map(item => item.event);

    return NextResponse.json(recommended);
  } catch (err) {
    console.error("Recommendations API Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
