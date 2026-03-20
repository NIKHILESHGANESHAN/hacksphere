import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Return mock user profile to bypass MongoDB
    const mockUser = {
      _id: "mock_user_123",
      email: "test@srmist.edu.in",
      name: "Mock Student",
      role: "STUDENT",
      year: "3rd Year",
      department: "Computer Science",
      skills: ["React", "Next.js"],
      interests: ["Web Development", "AI/ML"]
    };

    return NextResponse.json(mockUser);
  } catch (err) {
    console.error("User GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { name, year, department, skills, interests } = body;

    // Return the updated mock payload directly
    const updatedUser = {
      _id: "mock_user_123",
      email: "test@srmist.edu.in",
      role: "STUDENT",
      name, year, department, skills, interests
    };

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error("User PUT error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
