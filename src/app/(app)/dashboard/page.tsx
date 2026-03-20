"use client";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";

export default function DashboardPage() {
  const [recommended, setRecommended] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/recommendations")
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setRecommended(data);
      });

    fetch("/api/matches")
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setMatches(data);
      });
  }, []);

  const pendingRequests = matches.filter(m => m.status === 'PENDING' && !m.isSender).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-400 text-sm">Welcome back. Here's what's happening today.</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <GlassCard hoverEffect className="flex flex-col gap-2 bg-gradient-to-br from-[#111] to-black">
          <h3 className="font-semibold text-gray-300 text-sm tracking-wide uppercase">Upcoming Hackathons</h3>
          <span className="text-4xl font-bold text-white text-gradient mt-1">12</span>
          <span className="text-xs text-primary flex items-center gap-1 before:content-[''] before:w-1.5 before:h-1.5 before:bg-primary before:rounded-full before:animate-ping">+3 added this week</span>
        </GlassCard>
        
        <GlassCard hoverEffect className="flex flex-col gap-2 bg-gradient-to-br from-[#111] to-black">
          <h3 className="font-semibold text-gray-300 text-sm tracking-wide uppercase">Match Requests</h3>
          <span className="text-4xl font-bold text-white mt-1">{matches.length}</span>
          {pendingRequests > 0 ? (
            <span className="text-xs text-accent-cyan flex items-center gap-1 before:content-[''] before:w-1.5 before:h-1.5 before:bg-accent-cyan before:rounded-full">{pendingRequests} waiting for your response</span>
          ) : (
            <span className="text-xs text-gray-500">All caught up</span>
          )}
        </GlassCard>

        <GlassCard hoverEffect className="flex flex-col gap-2 bg-gradient-to-br from-[#111] to-black">
          <h3 className="font-semibold text-gray-300 text-sm tracking-wide uppercase">Clubs Verified</h3>
          <span className="text-4xl font-bold text-white mt-1">34</span>
          <span className="text-xs text-gray-500">Across SRM Ramapuram & KTR</span>
        </GlassCard>
      </div>

      <div className="pt-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-gradient">AI Recommended For You</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommended.length === 0 ? (
             <GlassCard className="col-span-1 md:col-span-2 flex flex-col items-center justify-center p-8 text-sm text-gray-500 border-white/5">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                Analyzing your skills and interests for matches...
             </GlassCard>
          ) : recommended.map(event => (
            <GlassCard key={event._id} hoverEffect className="flex justify-between items-center p-4">
              <div className="max-w-[70%]">
                <span className="text-[10px] font-bold tracking-wider uppercase text-primary bg-primary/10 px-2 py-0.5 rounded mb-2 inline-block">{event.domain}</span>
                <h4 className="font-bold text-white truncate">{event.title}</h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{event.description}</p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0 text-xs">View Event</Button>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
