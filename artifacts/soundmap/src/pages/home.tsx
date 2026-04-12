import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useListRecordings } from "@workspace/api-client-react";
import { usePlayer } from "@/components/player-context";
import { Play, MapPin, Headphones, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

// ── Marker icon ──────────────────────────────────────────────────────────────
const audioMarkerIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 32px; height: 32px;
    background: linear-gradient(135deg, #0ea5e9, #0284c7);
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 2px solid rgba(255,255,255,0.5);
    box-shadow: 0 2px 12px rgba(14,165,233,0.6);
    display:flex; align-items:center; justify-content:center;
  ">
    <div style="transform:rotate(45deg); color:white; font-size:13px;">&#9658;</div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
});

// ── Search result type ────────────────────────────────────────────────────────
interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

// ── Fly-to helper (must be inside MapContainer) ───────────────────────────────
function FlyTo({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  if (coords) map.flyTo(coords, 13, { duration: 1.4 });
  return null;
}

// ── Search bar ────────────────────────────────────────────────────────────────
function SearchBar({ onFly }: { onFly: (coords: [number, number]) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`,
          { headers: { "Accept-Language": "en" } },
        );
        const data: SearchResult[] = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const pick = (r: SearchResult) => {
    onFly([parseFloat(r.lat), parseFloat(r.lon)]);
    setQuery(r.display_name.split(",")[0]);
    setResults([]);
  };

  return (
    <div className="absolute top-20 left-4 z-[500] w-80">
      {/* Input */}
      <div className="flex items-center gap-2 bg-white rounded-xl shadow-lg px-3 py-2 border border-gray-200">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Search places…"
          className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
          >
            <X size={14} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {(results.length > 0 || loading) && (
        <div className="mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-400">Searching…</div>
          )}
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => pick(r)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 last:border-0 truncate"
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { data: recordings, isLoading } = useListRecordings();
  const { playRecording, activeRecording } = usePlayer();
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);

  // GPS: ask for location on load, fall back to Soho if denied
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFlyTo([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          // GPS denied or unavailable — fly to Soho, London
          setFlyTo([51.5137, -0.1337]);
        },
        { timeout: 5000 }
      );
    } else {
      setFlyTo([51.5137, -0.1337]);
    }
  }, []);

  return (
    <div className="absolute inset-0 bg-background">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-primary font-mono tracking-widest uppercase text-sm">
              Tuning in…
            </p>
          </div>
        </div>
      )}

      {/* Search bar lives outside MapContainer so it can own its own state cleanly */}
      <SearchBar
        onFly={(coords) => {
          setFlyTo(null);
          setTimeout(() => setFlyTo(coords), 10);
        }}
      />

      <MapContainer
        center={[51.5137, -0.1337]}
        zoom={13}
        minZoom={2} // ← can't zoom out past seeing most of the globe
        maxZoom={18}
        className="w-full h-full"
        zoomControl={false}
      >
        {/* 
          CartoDB Voyager — light, clean, Google Maps feel.
          Shows country names in English, political borders at mid-zoom,
          no roads or infrastructure clutter.
        */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
        />

        {/* Labels-only layer: country names at low zoom, more detail as you zoom in */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
          attribution=""
          minZoom={2}
        />

        {/* Fly to searched location */}
        <FlyTo coords={flyTo} />

        {recordings?.map((recording) => (
          <Marker
            key={recording.id}
            position={[recording.latitude, recording.longitude]}
            icon={audioMarkerIcon}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <h3 className="font-bold text-lg text-white mb-1 leading-tight">
                  {recording.title}
                </h3>
                <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
                  <MapPin size={12} />
                  <span>{recording.location}</span>
                </div>
                {recording.description && (
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {recording.description}
                  </p>
                )}
                <Button
                  onClick={() => playRecording(recording)}
                  className="w-full gap-2 bg-primary/20 hover:bg-primary/40 text-primary border border-primary/50 transition-all"
                  size="sm"
                >
                  {activeRecording?.id === recording.id ? (
                    <>
                      <Headphones size={16} className="animate-pulse" /> Playing
                    </>
                  ) : (
                    <>
                      <Play size={16} className="fill-current" /> Listen
                    </>
                  )}
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute bottom-8 left-6 z-[400] pointer-events-none">
        <div className="bg-card/80 backdrop-blur-md p-4 rounded-xl border border-white/5 shadow-2xl max-w-sm pointer-events-auto">
          <h2 className="text-xl font-bold mb-2">The Audio Atlas</h2>
          <p className="text-sm text-muted-foreground">
            Explore the world through sound. Click on any pin to hear field
            recordings from that exact location.
          </p>
        </div>
      </div>
    </div>
  );
}
