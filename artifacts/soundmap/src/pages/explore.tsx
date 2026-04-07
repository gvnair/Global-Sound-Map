import { useListFeaturedRecordings, useListRecentRecordings, useGetRecordingsSummary, Recording } from "@workspace/api-client-react";
import { usePlayer } from "@/components/player-context";
import { Play, MapPin, Clock, Heart, Headphones } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function RecordingCard({ recording, index }: { recording: Recording, index: number }) {
  const { playRecording, activeRecording } = usePlayer();
  const isPlaying = activeRecording?.id === recording.id;

  return (
    <Card 
      className={cn(
        "group bg-card/40 border-white/5 hover:border-primary/30 transition-all duration-500 overflow-hidden cursor-pointer relative",
        isPlaying ? "border-primary/50 shadow-[0_0_20px_rgba(0,180,255,0.1)]" : "hover:shadow-lg"
      )}
      onClick={() => playRecording(recording)}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
            isPlaying 
              ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,180,255,0.4)]" 
              : "bg-white/5 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
          )}>
            {isPlaying ? <Headphones size={20} className="animate-pulse" /> : <Play size={20} className="fill-current ml-1" />}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm bg-white/5 px-2 py-1 rounded-full">
            <Heart size={14} className="text-pink-500" />
            <span>{recording.likes}</span>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{recording.title}</h3>
        
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="opacity-70" />
            <span>{recording.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="opacity-70" />
            <span>{formatDistanceToNow(new Date(recording.createdAt), { addSuffix: true })}</span>
          </div>
        </div>

        {recording.tags && recording.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
            {recording.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-1 bg-white/5 rounded-md text-gray-400">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string, value: string | number, icon: React.ElementType }) {
  return (
    <div className="bg-card/40 border border-white/5 p-6 rounded-xl flex items-center gap-4">
      <div className="p-3 bg-primary/10 text-primary rounded-lg">
        <Icon size={24} />
      </div>
      <div>
        <p className="text-3xl font-mono font-bold">{value}</p>
        <p className="text-sm text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const { data: featured, isLoading: isLoadingFeatured } = useListFeaturedRecordings();
  const { data: recent, isLoading: isLoadingRecent } = useListRecentRecordings();
  const { data: stats, isLoading: isLoadingStats } = useGetRecordingsSummary();

  return (
    <div className="min-h-screen pt-24 pb-32 px-6 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">Discover the World</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Listen to the most captivating audioscapes captured by our community of sonic explorers.
          </p>
        </header>

        {!isLoadingStats && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <StatCard label="Global Signals" value={stats.totalRecordings} icon={MapPin} />
            <StatCard label="Total Resonances" value={stats.totalLikes} icon={Heart} />
            <StatCard label="Recent Transmissions" value={stats.recentCount} icon={Clock} />
          </div>
        )}

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="w-8 h-px bg-primary"></span>
              Featured Signals
            </h2>
          </div>

          {isLoadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-[250px] rounded-xl bg-white/5" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured?.map((rec, i) => (
                <RecordingCard key={rec.id} recording={rec} index={i} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="w-8 h-px bg-primary"></span>
              Recent Transmissions
            </h2>
          </div>

          {isLoadingRecent ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-[250px] rounded-xl bg-white/5" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recent?.map((rec, i) => (
                <RecordingCard key={rec.id} recording={rec} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
