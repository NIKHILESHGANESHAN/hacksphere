import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Event } from "@/models/Event";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { User } from "@/models/User"; // needed to populate

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");
    const search = searchParams.get("search");
    const skills = searchParams.get("skills"); // comma separated
    const date = searchParams.get("date"); // upcoming, past, or specific date
    
    const query: any = {};

    if (domain) query.domain = domain;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    if (skills) {
      // Find events that require ANY of the provided skills
      const skillArray = skills.split(",").map(s => s.trim());
      query.requiredSkills = { $in: skillArray };
    }
    
    if (date === "upcoming") {
      query.dateTime = { $gte: new Date() };
    } else if (date === "past") {
      query.dateTime = { $lt: new Date() };
    }

    await connectToDatabase();
    const events = await Event.find(query)
      .sort({ dateTime: 1 })
      .populate({ path: "clubId", select: "name email", model: User });
    
    return NextResponse.json(events);
  } catch (err) {
    console.error("Events GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || (decoded.role !== "CLUB_MEMBER" && decoded.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only verified Club Members can create events." }, { status: 403 });
    }

    const { title, description, dateTime, teamSize, domain, requiredSkills, contactDetails } = await req.json();

    if (!title || !description || !dateTime || !domain) {
      return NextResponse.json({ error: "Missing required event fields." }, { status: 400 });
    }

    await connectToDatabase();
    const newEvent = await Event.create({
      title, 
      description, 
      dateTime, 
      teamSize: Number(teamSize) || 1, 
      domain, 
      requiredSkills: requiredSkills || [], 
      contactDetails, 
      clubId: decoded.id
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (err) {
    console.error("Events POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
