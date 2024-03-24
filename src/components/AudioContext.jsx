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
  const abortControllerRef = useRef(null);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  const [currentPlaylistId, setCurrentPlaylistId] = useState(-2);
  const [playlistId, setPlaylistId] = useState(-1);

  const [isClickOnPlaylistPlayButton, setIsClickOnPlaylistPlayButton] =
    useState(false);

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
    try {
      if (!playlistData || !playlistData.audioFiles || currentTrackIndex === 0)
        return;

      let previousIndex = currentTrackIndex - 1;

      const abortController = new AbortController();

      if (
        previousIndex >= 0 &&
        previousIndex < playlistData.audioFiles.length
      ) {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = abortController;

        if (playlistId !== currentPlaylistId) {
          const response = await fetch(
            `http://localhost:8080/api/audio/${playlistData.audioFiles[previousIndex].id}`,
            { signal: abortController.signal }
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const blob = await response.blob();
          const audioData = URL.createObjectURL(new Blob([blob]));

          setCurrentTrack({
            id: playlistData.audioFiles[previousIndex].id,
            audioUrl: audioData,
            trackName: playlistData.audioFiles[previousIndex].title,
            author: playlistData.audioFiles[previousIndex].author,
            imageUrl: playlistData.audioFiles[previousIndex].image
              ? `data:image/jpeg;base64,${playlistData.audioFiles[previousIndex].image.data}`
              : "",
            duration: playlistData.audioFiles[previousIndex].duration,
          });
        }

        setIsPlaying(true);
        setCurrentTrackIndex(previousIndex);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Error fetching data:", error);
      }
    }
  };

  const playNextTrack = async () => {
    try {
      if (
        !playlistData ||
        !playlistData.audioFiles ||
        currentTrackIndex === playlistData.audioFiles.length - 1
      )
        return;

      let nextIndex = currentTrackIndex + 1;

      const abortController = new AbortController();

      if (nextIndex < playlistData.audioFiles.length) {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = abortController;

        if (playlistId !== currentPlaylistId) {
          const response = await fetch(
            `http://localhost:8080/api/audio/${playlistData.audioFiles[nextIndex].id}`,
            { signal: abortController.signal }
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const blob = await response.blob();
          const audioData = URL.createObjectURL(new Blob([blob]));

          setCurrentTrack({
            id: playlistData.audioFiles[nextIndex].id,
            audioUrl: audioData,
            trackName: playlistData.audioFiles[nextIndex].title,
            author: playlistData.audioFiles[nextIndex].author,
            imageUrl: playlistData.audioFiles[nextIndex].image
              ? `data:image/jpeg;base64,${playlistData.audioFiles[nextIndex].image.data}`
              : "",
            duration: playlistData.audioFiles[nextIndex].duration,
          });
        }
        setIsPlaying(true);
        setCurrentTrackIndex(nextIndex);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Error fetching data:", error);
      }
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
    if (
      currentTrackIndex !== -1 &&
      (currentPlaylistId === playlistId || isClickOnPlaylistPlayButton) &&
      playlistData
    ) {
      const fetchAudioAndPlay = async () => {
        try {
          const abortController = new AbortController();
          const currentAudioFile = playlistData.audioFiles[currentTrackIndex];

          if (
            currentTrackIndex !== -1 &&
            (currentPlaylistId === playlistId || isClickOnPlaylistPlayButton) &&
            playlistData &&
            playlistData.audioFiles &&
            playlistData.audioFiles[currentTrackIndex]
          ) {
            if (abortControllerRef.current) {
              abortControllerRef.current.abort();
            }

            console.log(playlistData);

            abortControllerRef.current = abortController;

            const response = await fetch(
              `http://localhost:8080/api/audio/${playlistData.audioFiles[currentTrackIndex].id}`,
              { signal: abortController.signal }
            );
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            const audioData = URL.createObjectURL(new Blob([blob]));

            setCurrentTrack((prevTrack) => ({
              ...prevTrack,
              id: currentAudioFile.id,
              audioUrl: audioData,
              trackName: currentAudioFile.title,
              author: currentAudioFile.author,
              imageUrl: currentAudioFile.image
                ? `data:image/jpeg;base64,${currentAudioFile.image.data}`
                : "",
              duration: currentAudioFile.duration,
            }));
          }
          
          setIsClickOnPlaylistPlayButton(false);

          if (!isPlaying) {
            setIsPlaying(true);
          }
        } catch (error) {
          if (error.name === "AbortError") {
            console.log("Request aborted");
          } else {
            console.error("Error fetching data:", error);
          }
        }
      };

      fetchAudioAndPlay();
      audioRef.current.volume = volume;

      return () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }
  }, [currentTrackIndex, playlistData]);

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
        playlistData,
        updatePlaylist,
        audioId,
        setAudioId,
        clearLocalPlaylist,
        localPlaylistData,
        setLocalPlaylistData,
        playlistSize,
        isClickOnPlaylistPlayButton,
        setIsClickOnPlaylistPlayButton,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

AudioProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
