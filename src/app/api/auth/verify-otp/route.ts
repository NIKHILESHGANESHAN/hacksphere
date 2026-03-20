import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Otp } from "@/models/Otp";
import { User } from "@/models/User";
import { signToken } from "@/lib/auth";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required." }, { status: 400 });
    }

    await connectToDatabase();

    // Find the latest OTP for this email
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 400 });
    }

    // OTP verified, consume it
    await Otp.deleteMany({ email });

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email, role: "STUDENT" });
    }

    const token = signToken({ id: user._id, role: user.role });

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return NextResponse.json({ message: "Authenticated successfully", user });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal server error during verification." }, { status: 500 });
  }
}
