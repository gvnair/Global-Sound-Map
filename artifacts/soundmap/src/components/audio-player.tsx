import { useState, useRef, useEffect } from "react";
import { usePlayer } from "./player-context";
import { Play, Pause, X, Volume2, Maximize2, MapPin, User, Heart } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useLikeRecording } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export function AudioPlayer() {
  const { activeRecording, stopPlayback } = usePlayer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const likeMutation = useLikeRecording();

  useEffect(() => {
    if (activeRecording && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
      setIsPlaying(true);
    }
  }, [activeRecording]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current && value[0] !== undefined) {
      audioRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const handleLike = () => {
    if (activeRecording) {
      likeMutation.mutate({ id: activeRecording.id });
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!activeRecording) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-in-out transform translate-y-0",
      !activeRecording ? "translate-y-full" : ""
    )}>
      <div className="bg-card/95 backdrop-blur-xl border-t border-white/10 p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <audio
          ref={audioRef}
          src={activeRecording.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 min-w-0 w-full md:w-auto">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-white truncate">{activeRecording.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {activeRecording.location}</span>
                  <span className="flex items-center gap-1"><User size={14} /> {activeRecording.authorName}</span>
                </div>
              </div>
              <div className="md:hidden">
                <Button variant="ghost" size="icon" onClick={stopPlayback} className="text-muted-foreground hover:text-white">
                  <X size={20} />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full">
              <span className="text-xs text-muted-foreground font-mono w-10 text-right">
                {formatTime(progress)}
              </span>
              <Slider 
                value={[progress]} 
                max={duration || 100} 
                step={0.1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground font-mono w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-12 h-12 border-primary/50 text-primary hover:bg-primary/20 hover:text-white transition-colors"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
            </Button>
            
            <div className="flex items-center gap-2 border-l border-white/10 pl-4 ml-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-pink-500 gap-2"
                onClick={handleLike}
                disabled={likeMutation.isPending}
              >
                <Heart size={18} className={likeMutation.isSuccess ? "fill-pink-500 text-pink-500" : ""} />
                <span>{activeRecording.likes + (likeMutation.isSuccess ? 1 : 0)}</span>
              </Button>
            </div>

            <div className="hidden md:block border-l border-white/10 pl-4 ml-2">
              <Button variant="ghost" size="icon" onClick={stopPlayback} className="text-muted-foreground hover:text-white">
                <X size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
