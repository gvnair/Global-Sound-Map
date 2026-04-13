useEffect(() => {
  if (activeRecording && audioRef.current) {
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true); // Only set to true if playback succeeds
      })
      .catch((e) => {
        console.error("Playback failed:", e);
        // Show a toast error message if playback fails
        toast.error("Audio playback failed. Please check your browser settings or try again.");
        setIsPlaying(false); // Ensure state reflects playback failure
      });
  }
}, [activeRecording, audioRef]);