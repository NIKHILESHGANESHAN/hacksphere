"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, Compass, Users, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div 
        className="fixed inset-0" 
        onClick={() => setOpen(false)} 
        aria-hidden="true" 
      />
      <div className="w-full max-w-xl mx-4 z-10 relative animate-in fade-in zoom-in-95 duration-200">
        <Command 
          className="bg-[#141414] rounded-xl border border-white/10 shadow-2xl overflow-hidden" 
          loop
        >
          <div className="flex items-center px-4 py-3 border-b border-white/5">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <Command.Input 
              className="flex-1 bg-transparent text-white outline-none placeholder:text-gray-500 test-sm" 
              placeholder="Type a command or search..."
              autoFocus
            />
            <button 
              onClick={() => setOpen(false)}
              className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded hover:bg-white/10"
            >
              ESC
            </button>
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-gray-400">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-xs text-gray-500 font-medium px-2 pb-1 pt-2">
              <Command.Item 
                onSelect={() => { router.push('/dashboard'); setOpen(false); }}
                className="flex items-center gap-3 px-3 py-2 text-sm text-white rounded-lg aria-selected:bg-white/10 cursor-pointer mt-1 transition-colors"
                value="dashboard"
              >
                <Compass className="w-4 h-4 text-purple-400" />
                Dashboard / Discover
              </Command.Item>
              <Command.Item 
                onSelect={() => { router.push('/clubs'); setOpen(false); }}
                className="flex items-center gap-3 px-3 py-2 text-sm text-white rounded-lg aria-selected:bg-white/10 cursor-pointer mt-1 transition-colors"
                value="clubs"
              >
                <Users className="w-4 h-4 text-cyan-400" />
                Verified Clubs
              </Command.Item>
              <Command.Item 
                onSelect={() => { router.push('/chat'); setOpen(false); }}
                className="flex items-center gap-3 px-3 py-2 text-sm text-white rounded-lg aria-selected:bg-white/10 cursor-pointer mt-1 transition-colors"
                value="chat"
              >
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                Real-time Chat
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
