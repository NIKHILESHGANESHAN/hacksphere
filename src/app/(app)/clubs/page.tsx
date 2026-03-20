import { GlassCard } from "@/components/ui/GlassCard";

export default function ClubsPage() {
  const mockClubs = [
    { id: 1, name: "Data Science Club", members: 120, badge: "Verified" },
    { id: 2, name: "Web Dev Society", members: 95, badge: "Verified" },
    { id: 3, name: "AI/ML Enthusiasts", members: 210, badge: "Verified" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Verified Clubs</h1>
        <p className="text-gray-400">Discover and join verified technical clubs at SRM.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockClubs.map(club => (
          <GlassCard key={club.id} hoverEffect className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">{club.name}</h3>
              <span className="text-xs font-semibold bg-accent-cyan/20 text-accent-cyan px-2 py-1 rounded-full">
                {club.badge}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">{club.members} active members</p>
            <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors border border-white/10">
              View Club
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
