import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Otp } from "@/models/Otp";
import { Resend } from "resend";
import bcrypt from "bcryptjs";

console.log("RESEND KEY:", process.env.RESEND_API_KEY);

const resend = new Resend(process.env.RESEND_API_KEY || "fallback");

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@srmist\.edu\.in$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Access denied. Only @srmist.edu.in emails are allowed." }, { status: 403 });
    }

    await connectToDatabase();

    // Generate random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before storing
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otpCode, salt);

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: hashedOtp });

    if (process.env.RESEND_API_KEY) {
      const { error } = await resend.emails.send({
        from: "Acme <onboarding@resend.dev>", // Replace with a verified domain for full production
        to: ["codewithngc@gmail.com"],
        subject: "Your SRM HackSphere OTP",
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0a0a0a; color: #fff; padding: 20px; text-align: center;">
            <h1 style="color: #8b5cf6;">SRM HackSphere</h1>
            <p>Your one-time password to enter the portal is:</p>
            <h2 style="font-size: 32px; background: #222; padding: 10px; display: inline-block; border-radius: 8px;">${otpCode}</h2>
            <p style="color: #666; font-size: 12px;">This code will expire in 5 minutes.</p>
          </div>
        `,
      });

      /*if (error) {
        console.error("Resend error:", error);
        return NextResponse.json({ error: "Failed to send email via Resend." }, { status: 500 });
      }*/
      if (error) {
        console.error("FULL RESEND ERROR:", JSON.stringify(error, null, 2));
        return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
      }
    } else {
      console.warn(`[DEV LOG] RESEND_API_KEY is missing. Mock email sent - Generated OTP for ${email}: ${otpCode}`);
    }

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json({ error: "Internal server error while sending OTP" }, { status: 500 });
  }
}
