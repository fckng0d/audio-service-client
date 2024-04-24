import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import PropTypes from "prop-types";
import { debounce } from "lodash";
import AuthService from "../services/AuthService";
import { useAuthContext } from "../auth/AuthContext";

const AudioContext = createContext();
export const useAudioContext = () => useContext(AudioContext);

const apiUrl = process.env.REACT_APP_REST_API_URL;

export const AudioProvider = ({ children }) => {
  const { isAuthenticated } = useAuthContext();

  const abortControllerRef = useRef(null);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  const [currentPlaylistId, setCurrentPlaylistId] = useState(-2);
  const [playlistId, setPlaylistId] = useState(-1);
  const [toCurrentPlaylistId, setToCurrentPlaylistId] = useState(-1);

  const [isClickOnPlaylistPlayButton, setIsClickOnPlaylistPlayButton] =
    useState(false);
  const [isDragDroped, setIsDragDroped] = useState(false);

  const [isFetchingAudioFile, setIsFetchingAudioFile] = useState(false);
  const [isUploadedAudioFile, setIsUploadedAudioFile] = useState(false);

  const [isFetchingPlaylistAborted, setIsFetchingPlaylistAborted] =
    useState(false);

  const initialPlaylistData = {
    id: null,
    name: "",
    author: "",
    countOfAudio: 0,
    duration: 0.0,
    playlistOwnerRole: "",
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

  const updatePlaylistMultiFetch = (audioFilesData) => {
    setPlaylistSize(audioFilesData.audioFiles.length);

    setPlaylistData((prevPlaylistData) => ({
      ...prevPlaylistData,
      audioFiles: [
        ...prevPlaylistData.audioFiles,
        ...audioFilesData.audioFiles,
      ],
      audioFiles: audioFilesData.audioFiles,
    }));
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    resetAudioContext();
  }, [isAuthenticated]);

  const resetAudioContext = () => {
    setCurrentTrack(null);
    setIsPlaying(false);
    audioRef.current.src = null;
    // audioRef = null;
    setPlaylistId(-1);
    setCurrentTrackIndex(-1);
    setCurrentPlaylistId(-2);
    setLocalPlaylistData(null);
    clearLocalPlaylist();
    setToCurrentPlaylistId(-1);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
    togglePlay();
  };

  const handlePlayAudio = async (audioFile, index) => {
    // console.log(audioFile);
    // console.log(currentTrackIndex === audioFile.indexInPlaylist);
    // console.log(currentTrack);
    if (
      currentTrackIndex === audioFile.indexInPlaylist &&
      playlistId === currentPlaylistId &&
      currentPlaylistId
    ) {
      handleTogglePlay();
    } else {
      try {
        setIsFetchingAudioFile(true);
        updatePlaylist(localPlaylistData);
        setCurrentPlaylistId(playlistId);

        setCurrentTrack({
          id: audioFile.id,
          audioUrl: null,
          trackName: audioFile.title,
          author: audioFile.author,
          imageUrl: audioFile.image
            ? `data:image/jpeg;base64,${audioFile.image.data}`
            : "",
          duration: audioFile.duration,
          indexInPlaylist: audioFile.indexInPlaylist,
        });
        setIsFetchingAudioFile(false);
        // setIsClickOnPlaylistPlayButton(false);

        setCurrentTrackIndex(audioFile.indexInPlaylist);
        setIsPlaying(true);
      } catch (error) {
        console.error("Error fetching audio:", error);
      }
    }
  };

  useEffect(() => {
    if (currentTrackIndex !== -1 && currentPlaylistId === playlistId) {
      if (
        currentTrackIndex !== -1 &&
        playlistData &&
        playlistData.audioFiles &&
        playlistData.audioFiles[currentTrackIndex] &&
        !isDragDroped &&
        !isUploadedAudioFile
      ) {
        setIsFetchingAudioFile(true);
        setCurrentTrack({
          id: playlistData.audioFiles[currentTrackIndex].id,
          audioUrl: playlistData.audioFiles[currentTrackIndex].audioData,
          trackName: playlistData.audioFiles[currentTrackIndex].title,
          author: playlistData.audioFiles[currentTrackIndex].author,
          imageUrl: playlistData.audioFiles[currentTrackIndex].image
            ? `data:image/jpeg;base64,${playlistData.audioFiles[currentTrackIndex].image.data}`
            : "",
          duration: playlistData.audioFiles[currentTrackIndex].duration,
          indexInPlaylist:
            playlistData.audioFiles[currentTrackIndex].indexInPlaylist,
        });
        setIsFetchingAudioFile(false);
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
          setIsFetchingAudioFile(true);
          const response = await fetch(
            `${apiUrl}/api/audio/${playlistData.audioFiles[previousIndex].id}`,
            {
              headers: {
                Authorization: `Bearer ${AuthService.getAuthToken()}`,
              },
              signal: abortController.signal,
            }
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
            indexInPlaylist:
              playlistData.audioFiles[previousIndex].indexInPlaylist,
          });
          setIsFetchingAudioFile(false);
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
          setIsFetchingAudioFile(true);
          console.log("fetch");
          const response = await fetch(
            `${apiUrl}/api/audio/${playlistData.audioFiles[nextIndex].id}`,
            {
              headers: {
                Authorization: `Bearer ${AuthService.getAuthToken()}`,
              },
              signal: abortController.signal,
            }
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
            indexInPlaylist: playlistData.audioFiles[nextIndex].indexInPlaylist,
          });
          setIsFetchingAudioFile(false);
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
  }, 0);

  const debouncedPlayPreviousTrack = debounce(() => {
    if (currentTrackIndex !== -1) {
      playPreviousTrack();
    }
  }, 0);

  useEffect(() => {
    // console.log(
    //   "currentPlaylistId = ",
    //   currentPlaylistId,
    //   "\nplaylistId = ",
    //   playlistId,
    //   "\ncurrentTrackIndex = ",
    //   currentTrackIndex,
    //   "\nplaylistData = ",
    //   playlistData
    // );
    if (
      currentTrackIndex !== -1 &&
      (currentPlaylistId === playlistId || isClickOnPlaylistPlayButton)
    ) {
      // console.log("isDragDroped = ", isDragDroped)
      if (
        isDragDroped &&
        // currentTrackIndex !== -1 &&
        currentPlaylistId !== -2
      ) {
        setIsDragDroped(false);
        return;
      }

      // console.log("SPFSDJFKSJDK\n\n\n\KDFKSFKSDKF")

      if (isUploadedAudioFile && playlistId === currentPlaylistId) {
        setIsUploadedAudioFile(false);
        return;
      }

      const fetchAudioAndPlay = async () => {
        try {
          const abortController = new AbortController();
          const currentAudioFile = playlistData.audioFiles[currentTrackIndex];

          if (
            currentTrackIndex !== -1 &&
            (currentPlaylistId === playlistId || isClickOnPlaylistPlayButton) &&
            playlistData &&
            playlistData.audioFiles &&
            playlistData.audioFiles[currentTrackIndex] &&
            !isDragDroped
          ) {
            if (abortControllerRef.current) {
              abortControllerRef.current.abort();
            }

            abortControllerRef.current = abortController;

            let url = `${apiUrl}/api/audio/${playlistData.audioFiles[currentTrackIndex].id}`;
            if (isClickOnPlaylistPlayButton) {
              url = `${apiUrl}/api/audio/${localAudioFiles[0].id}`;
              setIsClickOnPlaylistPlayButton(false);
            }

            setIsFetchingAudioFile(true);
            const response = await fetch(url, {
              headers: {
                Authorization: `Bearer ${AuthService.getAuthToken()}`,
              },
              signal: abortController.signal,
            });
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
              indexInPlaylist: currentAudioFile.indexInPlaylist,
            }));
            setIsFetchingAudioFile(false);
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
        isDragDroped,
        setIsDragDroped,
        handlePlayAudio,
        isUploadedAudioFile,
        setIsUploadedAudioFile,
        setToCurrentPlaylistId,
        toCurrentPlaylistId,
        resetAudioContext,
        isFetchingAudioFile,
        setIsFetchingAudioFile,
        updatePlaylistMultiFetch,
        isFetchingPlaylistAborted,
        setIsFetchingPlaylistAborted,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

AudioProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
