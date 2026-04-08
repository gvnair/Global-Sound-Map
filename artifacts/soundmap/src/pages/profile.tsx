import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useListRecordings } from "@workspace/api-client-react";
import { usePlayer } from "@/components/player-context";
import { useUsername } from "@/hooks/use-username";
import { WaveformThumbnail } from "@/components/waveform-thumbnail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutGrid,
  Map as MapIcon,
  Heart,
  Play,
  Headphones,
  User,
  MapPin,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Recording } from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";

const markerIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:28px;height:28px;
    background:linear-gradient(135deg,#0ea5e9,#0284c7);
    border-radius:50% 50% 50% 0;transform:rotate(-45deg);
    border:2px solid rgba(255,255,255,0.5);
    box-shadow:0 2px 10px rgba(14,165,233,0.6);
    display:flex;align-items:center;justify-content:center;">
    <div style="transform:rotate(45deg);color:white;font-size:11px;">&#9658;</div>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -32],
});

function SetUsernamePrompt({ onSet }: { onSet: (name: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
        <User size={36} className="text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Choose your handle</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Pick a name to use across SoundMap. This is how others will see you.
      </p>
      <form
        className="flex gap-3 w-full max-w-sm"
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) onSet(value.trim());
        }}
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. maria_silva"
          className="bg-card/60 border-white/10 h-12 flex-1"
        />
        <Button type="submit" disabled={!value.trim()} className="h-12 px-6">
          Enter
        </Button>
      </form>
    </div>
  );
}

function PostCard({ recording }: { recording: Recording }) {
  const { playRecording, activeRecording } = usePlayer();
  const isPlaying = activeRecording?.id === recording.id;

  return (
    <div
      className={cn(
        "group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300",
        isPlaying ? "ring-2 ring-primary shadow-[0_0_20px_rgba(0,180,255,0.3)]" : "hover:ring-1 hover:ring-white/20"
      )}
      onClick={() => playRecording(recording)}
    >
      {recording.photoUrl ? (
        <img
          src={recording.photoUrl}
          alt={recording.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-card/80 border border-white/5 flex items-center justify-center px-3">
          <WaveformThumbnail recordingId={recording.id} isPlaying={isPlaying} />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <p className="text-white text-xs font-semibold line-clamp-1">{recording.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <MapPin size={10} className="text-white/70" />
          <p className="text-white/70 text-xs line-clamp-1">{recording.location}</p>
        </div>
      </div>

      <div className={cn(
        "absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
        isPlaying ? "bg-primary opacity-100" : "bg-black/50 opacity-0 group-hover:opacity-100"
      )}>
        {isPlaying
          ? <Headphones size={13} className="text-white animate-pulse" />
          : <Play size={13} className="text-white ml-0.5" />
        }
      </div>

      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 rounded-full px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Heart size={10} className="text-pink-400" />
        <span className="text-white text-[10px]">{recording.likes}</span>
      </div>
    </div>
  );
}

function MapView({ recordings }: { recordings: Recording[] }) {
  const { playRecording } = usePlayer();

  const center = recordings.length > 0
    ? [recordings[0].latitude, recordings[0].longitude] as [number, number]
    : [20, 0] as [number, number];

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 h-[500px]">
      <MapContainer center={center} zoom={4} className="w-full h-full" zoomControl={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {recordings.map((r) => (
          <Marker key={r.id} position={[r.latitude, r.longitude]} icon={markerIcon}>
            <Popup>
              <div className="p-1 min-w-[160px]">
                <p className="font-bold text-sm text-white mb-1">{r.title}</p>
                <p className="text-xs text-white/60 mb-2">{r.location}</p>
                <button
                  onClick={() => playRecording(r)}
                  className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300"
                >
                  <Play size={12} /> Play
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default function ProfilePage() {
  const { username, setUsername } = useUsername();
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const { data: allRecordings } = useListRecordings();

  const myRecordings = (allRecordings ?? []).filter(
    (r) => r.authorName === username
  );

  const totalLikes = myRecordings.reduce((sum, r) => sum + r.likes, 0);

  if (!username) {
    return (
      <div className="min-h-screen pt-8 pb-32 px-6">
        <SetUsernamePrompt onSet={setUsername} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 px-6 pt-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-6 mb-10">
          <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(0,180,255,0.15)]">
            <User size={36} className="text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold font-mono">{username}</h1>
            <div className="flex items-center gap-6 mt-2">
              <div className="text-center">
                <p className="text-xl font-bold">{myRecordings.length}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Signals</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{totalLikes}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Resonances</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-card/60 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-white"
              )}
            >
              <LayoutGrid size={16} />
              Grid
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                viewMode === "map" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-white"
              )}
            >
              <MapIcon size={16} />
              Map
            </button>
          </div>
        </div>

        {myRecordings.length === 0 ? (
          <div className="text-center py-24 border border-white/5 rounded-2xl bg-card/20">
            <div className="w-16 h-16 rounded-full bg-card/60 border border-white/5 flex items-center justify-center mx-auto mb-5">
              <Radio size={28} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-2">No signals yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Head to Record to capture your first audio moment and pin it to the map.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-3 gap-2">
            {myRecordings.map((r) => (
              <PostCard key={r.id} recording={r} />
            ))}
          </div>
        ) : (
          <MapView recordings={myRecordings} />
        )}
      </div>
    </div>
  );
}
