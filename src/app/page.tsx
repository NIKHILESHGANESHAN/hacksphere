"use client";

import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[128px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-cyan/10 rounded-full blur-[128px] -z-10 pointer-events-none" />

      <div className="max-w-5xl w-full flex flex-col items-center text-center space-y-8 z-10">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Welcome to <br/>
          <span className="text-gradient">SRM HackSphere</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl text-balance">
          The ultimate platform for SRM students to discover hackathons, 
          connect with teammates through XConnect, and interact with verified clubs.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <Button variant="gradient" size="lg" onClick={() => router.push('/login')}>Discover Events</Button>
          <Button variant="glass" size="lg" onClick={() => router.push('/login')}>Find Teammates</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-16 text-left">
          <GlassCard hoverEffect>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-primary font-bold text-xl">X</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">XConnect</h3>
            <p className="text-gray-400 text-sm">Find the perfect teammates anonymously based on your skills and interests.</p>
          </GlassCard>
          <GlassCard hoverEffect>
             <div className="h-10 w-10 rounded-lg bg-accent-indigo/10 flex items-center justify-center mb-4">
              <span className="text-accent-indigo font-bold text-xl">C</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Verified Clubs</h3>
            <p className="text-gray-400 text-sm">Interact only with officially verified SRM clubs to discover quality events.</p>
          </GlassCard>
          <GlassCard hoverEffect>
             <div className="h-10 w-10 rounded-lg bg-accent-cyan/10 flex items-center justify-center mb-4">
              <span className="text-accent-cyan font-bold text-xl">R</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Real-time</h3>
            <p className="text-gray-400 text-sm">Connect and chat securely in real-time to start building your ideas faster.</p>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
