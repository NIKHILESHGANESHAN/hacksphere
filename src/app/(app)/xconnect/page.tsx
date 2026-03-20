"use client";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Users, Check, X, Send } from "lucide-react";
import { toast } from "sonner";

export default function XConnectPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [recRes, matchRes] = await Promise.all([
        fetch("/api/xconnect"),
        fetch("/api/matches")
      ]);
      const recData = await recRes.json();
      const matchData = await matchRes.json();
      
      if(Array.isArray(recData)) setRecommendations(recData);
      if(Array.isArray(matchData)) {
        // Filter pending incoming requests
        setRequests(matchData.filter(m => m.status === "PENDING" && !m.isSender));
      }
    } catch (e) {
      toast.error("Failed to load XConnect data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConnect = async (userId: string) => {
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId })
      });
      if (res.ok) {
        toast.success("Match request sent successfully!");
        setRecommendations(prev => prev.filter(r => r._id !== userId));
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to send request");
      }
    } catch (e) {
      toast.error("Error connecting");
    }
  };

  const handleResponse = async (matchId: string, status: "ACCEPTED" | "REJECTED") => {
    try {
      const res = await fetch("/api/matches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, status })
      });
      if (res.ok) {
        toast.success(`Request ${status.toLowerCase()}!`);
        setRequests(prev => prev.filter(r => r._id !== matchId));
      } else {
        toast.error("Failed to process request");
      }
    } catch (e) {
      toast.error("Error processing request");
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">XConnect Matching</h1>
        <p className="text-gray-400 mt-1">Discover teammates with complementary skills for your next hackathon.</p>
      </div>

      {/* INCOMING REQUESTS */}
      {requests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-accent-cyan" /> Pending Requests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map(req => (
               <GlassCard key={req._id} className="p-4 border-accent-cyan/30">
                 <div className="flex justify-between items-start">
                   <div>
                     <h3 className="font-bold text-lg">{req.otherParty?.name}</h3>
                     <p className="text-sm text-gray-400">Year {req.otherParty?.year || "Unknown"}</p>
                   </div>
                   <span className="text-xs px-2 py-1 bg-accent-cyan/10 text-accent-cyan rounded-full">New</span>
                 </div>
                 <div className="flex gap-2 mt-4">
                   <Button onClick={() => handleResponse(req._id, "ACCEPTED")} size="sm" variant="gradient" className="flex-1 gap-1">
                     <Check className="w-4 h-4"/> Accept
                   </Button>
                   <Button onClick={() => handleResponse(req._id, "REJECTED")} size="sm" variant="outline" className="flex-1 border-red-500/50 hover:bg-red-500/10 text-red-400 gap-1">
                     <X className="w-4 h-4"/> Reject
                   </Button>
                 </div>
               </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* RECOMMENDATIONS */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recommended Teammates</h2>
        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => <GlassCard key={i} className="h-40 animate-pulse" />)}
             </div>
        ) : recommendations.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white/5 rounded-xl border border-white/5">
            No new recommendations right now. Expand your skills profile!
          </div>
        ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map(user => (
                   <GlassCard key={user._id} hoverEffect className="flex flex-col h-full p-5">
                      <div className="mb-4">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-white text-lg">{user.name || "Anonymous"}</h3>
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                            {user.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{user.department || "Undeclared"} • Year {user.year || "Unknown"}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {(user.skills || []).slice(0,4).map((skill: string) => (
                           <span key={skill} className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded text-gray-300">
                             {skill}
                           </span>
                        ))}
                      </div>

                      <div className="mt-auto">
                        <Button onClick={() => handleConnect(user._id)} variant="outline" className="w-full gap-2 transition-colors hover:bg-white/10">
                          <Send className="w-4 h-4" /> Connect
                        </Button>
                      </div>
                   </GlassCard>
                ))}
             </div>
        )}
      </div>
    </div>
  );
}
