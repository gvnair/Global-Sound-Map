import { useState, createContext, useContext } from 'react';
import type { Recording } from '@workspace/api-client-react';

interface PlayerContextType {
  activeRecording: Recording | null;
  playRecording: (recording: Recording) => void;
  stopPlayback: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [activeRecording, setActiveRecording] = useState<Recording | null>(null);

  const playRecording = (recording: Recording) => {
    setActiveRecording(recording);
  };

  const stopPlayback = () => {
    setActiveRecording(null);
  };

  return (
    <PlayerContext.Provider value={{ activeRecording, playRecording, stopPlayback }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
