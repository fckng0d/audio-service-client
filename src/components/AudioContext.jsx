import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import PropTypes from "prop-types";
import { debounce } from "lodash";

const AudioContext = createContext();

export const useAudioContext = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  const [currentPlaylistId, setCurrentPlaylistId] = useState(-2);
  const [playlistId, setPlaylistId] = useState(-1);

  const [currentPLaylist, setCurrentPlaylis] = useState(null);

  const initialPlaylistData = {
    id: null,
    name: "",
    author: "",
    countOfAudio: 0,
    duration: 0.0,
    image: null,
    audioFiles: [],
  };

  const [playlistData, setPlaylistData] = useState(initialPlaylistData);
  const [localPlaylistData, setLocalPlaylistData] =
    useState(initialPlaylistData);
  const [playlistSize, setPlaylistSize] = useState(-1);

  const [localAudioFiles, setLocalAudioFiles] = useState([]);

  const [audioId, setAudioId] = useState(-1);

  const clearLocalPlaylist = () => {
    setLocalAudioFiles([]);
    setLocalPlaylistData(initialPlaylistData);
  };

  const updatePlaylist = (playlistData) => {
    setPlaylistSize(playlistData.audioFiles.length);
    setPlaylistData(playlistData);
    // console.log(playlistData);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (currentTrackIndex !== -1 && currentPlaylistId === playlistId) {
      if (
        currentTrackIndex !== -1 &&
        playlistData &&
        playlistData.audioFiles &&
        playlistData.audioFiles[currentTrackIndex]
      ) {
        setCurrentTrack({
          id: playlistData.audioFiles[currentTrackIndex].id,
          audioUrl: playlistData.audioFiles[currentTrackIndex].audioData,
          trackName: playlistData.audioFiles[currentTrackIndex].title,
          author: playlistData.audioFiles[currentTrackIndex].author,
          imageUrl: playlistData.audioFiles[currentTrackIndex].image
            ? `data:image/jpeg;base64,${playlistData.audioFiles[currentTrackIndex].image.data}`
            : "",
          duration: playlistData.audioFiles[currentTrackIndex].duration,
        });
        setIsPlaying(true);
      }
    }
  }, [currentTrackIndex]);

  const playPreviousTrack = async () => {
    if (!playlistData || !playlistData.audioFiles || currentTrackIndex === 0)
      return;

    let previousIndex = currentTrackIndex - 1;

    if (previousIndex >= 0 && previousIndex < playlistData.audioFiles.length) {
      const previousTrack = playlistData.audioFiles[previousIndex];

      const response = await fetch(
        `http://localhost:8080/api/audio/${playlistData.audioFiles[previousIndex].id}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const audioData = URL.createObjectURL(new Blob([blob]));

      // const audioData = URL.createObjectURL(new Blob([previousTrack.data]));
      // console.log("asmdkasmdkmsakdm\n\n" + audioData);

      try {
        setCurrentTrack({
          id: previousTrack.id,
          audioUrl: audioData,
          trackName: previousTrack.title,
          author: previousTrack.author,
          imageUrl: previousTrack.image
            ? `data:image/jpeg;base64,${previousTrack.image.data}`
            : "",
          duration: previousTrack.duration,
        });
        setIsPlaying(true);
      } catch (error) {
        console.error("Error fetching audio:", error);
      }
      setCurrentTrackIndex(previousIndex);
    }
  };

  const playNextTrack = async () => {
    if (
      !playlistData ||
      !playlistData.audioFiles ||
      currentTrackIndex === playlistData.audioFiles.length - 1
    )
      return;

    let nextIndex = currentTrackIndex + 1;
    if (nextIndex < playlistData.audioFiles.length) {
      const nextTrack = playlistData.audioFiles[nextIndex];

      const response = await fetch(
        `http://localhost:8080/api/audio/${playlistData.audioFiles[nextIndex].id}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const audioData = URL.createObjectURL(new Blob([blob]));

      try {
        setCurrentTrack({
          id: nextTrack.id,
          audioUrl: audioData,
          trackName: nextTrack.title,
          author: nextTrack.author,
          imageUrl: nextTrack.image
            ? `data:image/jpeg;base64,${nextTrack.image.data}`
            : "",
          duration: nextTrack.duration,
        });
        setIsPlaying(true);
      } catch (error) {
        console.error("Error fetching audio:", error);
      }
      setCurrentTrackIndex(nextIndex);
    }
  };

  // Задержка перед следующим вызовом
  const debouncedPlayNextTrack = debounce(() => {
    if (currentTrackIndex !== -1) {
      playNextTrack();
    }
  }, 500);

  const debouncedPlayPreviousTrack = debounce(() => {
    if (currentTrackIndex !== -1) {
      playPreviousTrack();
    }
  }, 500);

  useEffect(() => {
    if (currentTrackIndex !== -1 && currentPlaylistId === playlistId) {
      const fetchAudioAndPlay = async () => {
        try {
          if (
            currentTrackIndex !== -1 &&
            currentPlaylistId === playlistId &&
            playlistData &&
            playlistData.audioFiles &&
            playlistData.audioFiles[currentTrackIndex]
          ) {
            const response = await fetch(
              `http://localhost:8080/api/audio/${playlistData.audioFiles[currentTrackIndex].id}`
            );
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            const audioData = URL.createObjectURL(new Blob([blob]));

            setCurrentPlaylistId(playlistId);

            setCurrentTrack({
              id: playlistData.audioFiles[currentTrackIndex].id,
              audioUrl: audioData,
              trackName: playlistData.audioFiles[currentTrackIndex].title,
              author: playlistData.audioFiles[currentTrackIndex].author,
              imageUrl: playlistData.audioFiles[currentTrackIndex].image
                ? `data:image/jpeg;base64,${playlistData.audioFiles[currentTrackIndex].image.data}`
                : "",
              duration: playlistData.audioFiles[currentTrackIndex].duration,
            });
          }
          setIsPlaying(true);
        } catch (error) {
          console.error("Error fetching audio:", error);
        }
      };

      fetchAudioAndPlay();
      audioRef.current.volume = volume;
    }
  }, [currentTrackIndex]);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        setCurrentTrack,
        isPlaying,
        setIsPlaying,
        togglePlay,
        volume,
        setVolume,
        currentTrackIndex,
        setCurrentTrackIndex,
        audioRef,
        debouncedPlayNextTrack,
        debouncedPlayPreviousTrack,
        currentTime,
        setCurrentTime,
        // clearAudioFiles,
        currentPlaylistId,
        setCurrentPlaylistId,
        playlistId,
        setPlaylistId,
        localAudioFiles,
        setLocalAudioFiles,
        updatePlaylist,
        audioId,
        setAudioId,
        currentPLaylist,
        setCurrentPlaylis,
        clearLocalPlaylist,
        localPlaylistData,
        setLocalPlaylistData,
        playlistSize,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

AudioProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
