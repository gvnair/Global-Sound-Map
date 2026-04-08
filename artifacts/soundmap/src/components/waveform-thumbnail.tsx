function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

interface WaveformThumbnailProps {
  recordingId: number;
  isPlaying?: boolean;
  className?: string;
}

export function WaveformThumbnail({ recordingId, isPlaying, className }: WaveformThumbnailProps) {
  const rand = seededRandom(recordingId * 7919);
  const barCount = 40;
  const bars = Array.from({ length: barCount }, () => {
    const height = 20 + rand() * 80;
    return height;
  });

  return (
    <div className={`flex items-center justify-center gap-[2px] h-full w-full ${className ?? ""}`}>
      {bars.map((height, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-150"
          style={{
            width: "2px",
            height: `${height}%`,
            background: isPlaying
              ? `rgba(0,180,255,${0.4 + (height / 100) * 0.6})`
              : `rgba(255,255,255,${0.15 + (height / 100) * 0.35})`,
            animationDelay: isPlaying ? `${(i * 50) % 400}ms` : undefined,
            animation: isPlaying ? "waveformPulse 0.8s ease-in-out infinite alternate" : undefined,
          }}
        />
      ))}
      <style>{`
        @keyframes waveformPulse {
          from { transform: scaleY(0.6); }
          to { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
}
