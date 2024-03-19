import React from "react";
import { useAudioContext } from "./AudioContext";
import AudioControls from "../components/audioControls/AudioControls";

function AudioControlsContainer() {
  const { currentTrack, isPlaying, volume, audioRef, setVolume, nextTrack, toggleAudioControls } = useAudioContext();

  return (
    <AudioControls
      currentTrack={currentTrack}
      isPlaying={isPlaying}
      volume={volume}
      audioRef={audioRef}
      setVolume={setVolume}
      nextTrack={nextTrack}
      toggleAudioControls={toggleAudioControls}
    />
  );
}

export default AudioControlsContainer;