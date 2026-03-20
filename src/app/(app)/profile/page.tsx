"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { User as UserIcon, BookOpen, GraduationCap, Code } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user")
      .then(res => res.json())
      .then(data => {
        if (!data.error) setProfile(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          year: profile.year,
          department: profile.department,
          skills: profile.skills,
          interests: profile.interests,
        }),
      });
      if (res.ok) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile.");
      }
    } catch {
      toast.error("Error updating profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 animate-pulse flex space-x-4 items-center w-full justify-center">Loading profile...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your identity and XConnect matching preferences.</p>
        </div>
        <Button variant="gradient" onClick={handleSave} isLoading={saving}>Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="col-span-1 md:col-span-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary to-accent-cyan p-1 shadow-lg shadow-primary/20">
            <div className="h-full w-full bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile?.name || "Anonymous Student"}</h2>
            <p className="text-sm text-gray-400">{profile?.email}</p>
            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white tracking-wider border border-white/5 shadow-sm">
              {profile?.role}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="col-span-1 md:col-span-2">
          <form className="space-y-6" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" /> Full Name
                </label>
                <input 
                  type="text" 
                  value={profile?.name || ""}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> Year of Study
                </label>
                <select 
                  value={profile?.year || ""}
                  onChange={e => setProfile({...profile, year: Number(e.target.value)})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-primary outline-none appearance-none transition-all"
                >
                  <option value="" disabled className="bg-[#111]">Select Year</option>
                  {[1,2,3,4].map(y => <option key={y} value={y} className="bg-[#111]">Year {y}</option>)}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Department
                </label>
                <input 
                  type="text" 
                  value={profile?.department || ""}
                  onChange={e => setProfile({...profile, department: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="Computer Science and Engineering"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Code className="w-4 h-4" /> Skills (comma separated)
                </label>
                <input 
                  type="text" 
                  value={(profile?.skills || []).join(", ")}
                  onChange={e => setProfile({...profile, skills: e.target.value.split(",").map((s: string) => s.trim())})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="React, Next.js, Python, Tailwind"
                />
                <p className="text-xs text-gray-500 mt-1">These tags are highly weighted in XConnect anonymity matches.</p>
              </div>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
