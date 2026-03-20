"use client";

import { useEffect, useState, useRef } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Send, AlertTriangle, Lock } from "lucide-react";
import { pusherClient } from "@/lib/pusherClient";
import { toast } from "sonner";

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [activeMatch, setActiveMatch] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user").then(r => r.json()).then(u => setUserId(u._id));
    fetch("/api/matches").then(r => r.json()).then(m => {
      // Allow only ACCEPTED matches into chat UI
      const accepted = Array.isArray(m) ? m.filter((match: any) => match.status === "ACCEPTED") : [];
      setMatches(accepted);
      if (accepted.length > 0) setActiveMatch(accepted[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!activeMatch) return;

    fetch(`/api/chat?matchId=${activeMatch}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      }).catch(err => console.error(err));

    const channel = pusherClient.subscribe(`chat-${activeMatch}`);
    channel.bind("incoming-message", (newMsg: any) => {
      setMessages(prev => [...prev, newMsg]);
    });

    return () => {
      pusherClient.unsubscribe(`chat-${activeMatch}`);
    };
  }, [activeMatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeMatch) return;

    const content = input;
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: activeMatch, content }),
      });
      const data = await res.json();
      
      if (data.warning) {
        toast.error(data.warning, { icon: <AlertTriangle className="text-red-500 w-5 h-5" /> });
      }
      
      if (data.error && !data.warning) {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] gap-6">
      <GlassCard className="w-1/3 hidden md:flex flex-col p-4 overflow-y-auto">
        <h2 className="font-bold text-xl mb-4 text-white">Contacts</h2>
        {matches.length === 0 ? (
           <p className="text-gray-500 text-sm">No active matches found. Use XConnect on Discover events.</p>
        ) : matches.map(m => (
          <button 
            key={m._id}
            onClick={() => setActiveMatch(m._id)}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all w-full text-left mb-2 ${activeMatch === m._id ? 'bg-primary/20 border border-primary/50' : 'hover:bg-white/5 border border-transparent'}`}
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 shrink-0 shadow-sm" />
            <div className="overflow-hidden">
              <h4 className="font-semibold text-white truncate">{m.otherParty?.name}</h4>
              <p className="text-xs text-gray-400 truncate mt-0.5">{m.otherParty?.skills?.join(", ")}</p>
            </div>
          </button>
        ))}
      </GlassCard>

      <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden relative border-white/10">
        {!activeMatch ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            Select a contact to start chatting securely.
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-400" />
              <div>
                <h3 className="font-bold text-white text-sm">Encrypted Connection</h3>
                <p className="text-xs text-gray-400">End-to-End simulation active</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-xs text-gray-500 my-4">No messages yet. Say hi!</div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.sender?._id === userId;
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[70%] p-3 text-sm flex flex-col ${isMe ? 'bg-primary text-white rounded-2xl rounded-tr-sm shadow-md' : 'bg-white/10 text-gray-200 rounded-2xl rounded-tl-sm'}`}>
                      <span>{msg.content}</span>
                      <span className="text-[10px] opacity-50 mt-1 self-end">
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 bg-black/40 border-t border-white/10 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a secure message..."
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-gray-600 transition-all font-sans"
              />
              <Button type="submit" variant="gradient" size="icon" className="shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        )}
      </GlassCard>
    </div>
  );
}
