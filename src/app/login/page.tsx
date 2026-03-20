"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith("@srmist.edu.in")) {
      toast.error("Please use a valid @srmist.edu.in email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("OTP sent to your email!");
        setStep("OTP");
      } else {
        toast.error(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Login successful!");
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Invalid OTP.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full pointer-events-none -z-10" />
      
      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 rounded-xl bg-gradient-to-tr from-primary to-accent-cyan items-center justify-center shadow-lg shadow-primary/20 mb-4">
              <span className="font-bold text-white text-xl">H</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">HackSphere</h1>
            <p className="text-gray-400 text-sm">Sign in with your university email</p>
          </div>

          {step === "EMAIL" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2 text-left">
                <label className="text-xs font-medium text-gray-300 uppercase tracking-wider">Student Email</label>
                <input 
                  type="email"
                  required
                  placeholder="ab1234@srmist.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm"
                />
              </div>
              <Button type="submit" variant="gradient" className="w-full h-11" isLoading={loading}>
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2 text-left">
                <label className="text-xs font-medium text-gray-300 uppercase tracking-wider">Verification Code</label>
                <input 
                  type="text"
                  required
                  placeholder="••••••"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-center tracking-[1em] font-mono text-lg"
                />
                <p className="text-xs text-gray-500 text-center mt-2">Code sent to <span className="text-gray-300">{email}</span></p>
              </div>
              <Button type="submit" variant="primary" className="w-full h-11" isLoading={loading}>
                Verify & Sign In
              </Button>
              <button 
                type="button" 
                onClick={() => setStep("EMAIL")}
                className="w-full text-xs text-gray-400 hover:text-white transition-colors"
                disabled={loading}
              >
                Use a different email
              </button>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
