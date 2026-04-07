import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useListRecordings } from "@workspace/api-client-react";
import { usePlayer } from "@/components/player-context";
import { Play, MapPin, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function HomePage() {
  const { data: recordings, isLoading } = useListRecordings();
  const { playRecording, activeRecording } = usePlayer();

  return (
    <div className="absolute inset-0 bg-background">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <p className="text-primary font-mono tracking-widest uppercase text-sm">Tuning in...</p>
          </div>
        </div>
      ) : null}

      <MapContainer 
        center={[20, 0]} 
        zoom={3} 
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {recordings?.map((recording) => (
          <Marker 
            key={recording.id} 
            position={[recording.latitude, recording.longitude]}
            icon={audioMarkerIcon}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <h3 className="font-bold text-lg text-white mb-1 leading-tight">{recording.title}</h3>
                <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
                  <MapPin size={12} />
                  <span>{recording.location}</span>
                </div>
                
                {recording.description && (
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">{recording.description}</p>
                )}
                
                <Button 
                  onClick={() => playRecording(recording)}
                  className="w-full gap-2 bg-primary/20 hover:bg-primary/40 text-primary border border-primary/50 transition-all"
                  size="sm"
                >
                  {activeRecording?.id === recording.id ? (
                    <>
                      <Headphones size={16} className="animate-pulse" />
                      Playing
                    </>
                  ) : (
                    <>
                      <Play size={16} className="fill-current" />
                      Listen
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
            Explore the world through sound. Click on any pin to hear field recordings from that exact location.
          </p>
        </div>
      </div>
    </div>
  );
}
