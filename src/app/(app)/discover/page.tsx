"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Search, Users, Plus } from "lucide-react";
import Link from "next/link";

export default function DiscoverPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then(res => res.json())
      .then(data => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discover Hackathons</h1>
          <p className="text-gray-400 text-sm mt-1">Find events, join teams, and start building.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search domains..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <Button variant="gradient" className="gap-2">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Create Event</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <GlassCard key={i} className="animate-pulse h-64 border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">
              No upcoming events found. Check back later or host one!
            </div>
          ) : events.map(event => (
            <GlassCard key={event._id} hoverEffect className="group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2.5 py-1 bg-white/10 rounded-md text-xs font-medium text-purple-300">
                    {event.domain}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(event.dateTime).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{event.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-3 mb-4">{event.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {(event.requiredSkills || []).slice(0, 3).map((skill: string) => (
                    <span key={skill} className="text-xs px-2 py-1 bg-black/30 rounded text-gray-300 border border-white/5">
                      {skill}
                    </span>
                  ))}
                  {(event.requiredSkills || []).length > 3 && (
                    <span className="text-xs px-2 py-1 bg-black/30 rounded text-gray-500 border border-white/5">
                      +{(event.requiredSkills || []).length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Users className="w-4 h-4" />
                  <span>Team of {event.teamSize}</span>
                </div>
                <Link href="/xconnect" passHref>
                  <Button variant="glass" size="sm" className="text-xs">
                    Find Teammates
                  </Button>
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
