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
import { useNavigate } from "react-router-dom";
import CookieService from "../services/CookieService";

const AudioContext = createContext();
export const useAudioContext = () => useContext(AudioContext);

const apiUrl = process.env.REACT_APP_REST_API_URL;

export const AudioProvider = ({ children }) => {
  const {
    isAuthenticated,
    setIsAuthenticated,
    isValidToken,
    setIsValidToken,
    isAdminRole,
    setIsAdminRole,
    profileData,
  } = useAuthContext();

  const abortControllerRef = useRef(null);

  const navigate = useNavigate();

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

  const [isPlayTrackInNewPlaylist, setIsPlayTrackInNewPlaylist] =
    useState(false);

  const [isUpdatedPlaylistName, setIsUpdatePlaylistName] = useState(false);

  const [isUploadedFromCookies, setIsUploadedFromCookies] = useState(false);

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
    if (!isAuthenticated) {
      resetAudioContext();
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!profileData) {
      return;
    }

    if (isAuthenticated && isValidToken) {
      const { lastPlaylistId, trackId, indexInPlaylist } =
        CookieService.loadAudioDataFromCookie(profileData.id);

      const parsedLastPlaylistId = isNaN(lastPlaylistId)
        ? lastPlaylistId
        : parseInt(lastPlaylistId);

      const fetchLastAudioFromCookie = async () => {
        if (trackId && indexInPlaylist) {
          const response = await fetch(
            `${apiUrl}/api/audio-metadata/${trackId}`,
            {
              headers: {
                Authorization: `Bearer ${AuthService.getAuthToken()}`,
              },
            }
          );
          if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return;
          }

          const data = await response.json();

          // setToCurrentPlaylistId(-7);
          // setPlaylistId(0);

          const audioFile = {
            ...data,
            id: trackId,
            audioUrl: null,
            indexInPlaylist: indexInPlaylist,
          };

          fetchAudioData(audioFile, true);
        } 

        if (!lastPlaylistId) {
          return;
        }

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        let isAborted = false;

        fetch(
          // isFavoriteAudioFiles && (!lastPlaylistId ||
          parsedLastPlaylistId === -10
            ? // )
              `${apiUrl}/api/favorites/audioFiles`
            : `${apiUrl}/api/playlists/${parsedLastPlaylistId}`,
          {
            headers: {
              Authorization: `Bearer ${AuthService.getAuthToken()}`,
            },
            method: "GET",
            signal: abortController.signal,
          }
        )
          .then((response) => {
            if (response.status === 403) {
              navigate("/auth/sign-in", { replace: true });
              return null;
            }
            return response.json();
          })
          .then((data) => {
            const initialPlaylistData = {
              id: data.id,
              name: data.name,
              author: data.author,
              countOfAudio: data.countOfAudio,
              duration: data.duration,
              playlistOwnerRole: data.playlistOwnerRole,
              image: data.image,
              audioFiles: [],
            };

            setPlaylistData(initialPlaylistData);
            setCurrentPlaylistId(parsedLastPlaylistId);
            setToCurrentPlaylistId(-5);
            setPlaylistId(0);

            const totalCount = data.countOfAudio;
            const pageSize = 10;

            const fetchPartialPlaylists = async (id, startIndex, count) => {
              const response = await fetch(
                parsedLastPlaylistId === -10
                  ? `${apiUrl}/api/favorites/audioFiles/partial?startIndex=${startIndex}&count=${count}`
                  : `${apiUrl}/api/playlists/${id}/audioFiles/partial?startIndex=${startIndex}&count=${count}`,
                {
                  headers: {
                    Authorization: `Bearer ${AuthService.getAuthToken()}`,
                  },
                  method: "GET",
                  signal: abortController.signal.aborted
                    ? null
                    : abortController.signal,
                }
              );
              // console.log(response)
              if (response.status === 403) {
                navigate("/auth/sign-in", { replace: true });
                return null;
              }
              return response.json();
            };

            const fetchAllPartialPlaylistsParallel = async (
              id,
              totalCount,
              pageSize
            ) => {
              const fetchPromises = [];
              const totalPages = Math.ceil(totalCount / pageSize);

              for (let page = 0; page < totalPages; page++) {
                const count = Math.min(pageSize, totalCount - page * pageSize);
                fetchPromises.push(
                  fetchPartialPlaylists(id, page * pageSize, count).catch(
                    (error) => {
                      setIsFetchingPlaylistAborted(true);
                      return null;
                    }
                  )
                );
              }

              try {
                const responses = await Promise.all(
                  fetchPromises.map(async (fetchPromise) => {
                    try {
                      const response = await fetchPromise;
                      return response;
                    } catch (error) {
                      isAborted = true;
                      return;
                    }
                  })
                );

                const updatedAudioFiles = [...playlistData.audioFiles];
                // const updatedLocalAudioFiles = [...playlistData];

                if (!isAborted) {
                  responses.forEach((response) => {
                    if (response && Array.isArray(response.audioFiles)) {
                      const uniqueAudioFiles = response.audioFiles.filter(
                        (audioFile) => {
                          return !updatedAudioFiles.some(
                            (existingFile) => existingFile.id === audioFile.id
                          );
                        }
                      );

                      updatedAudioFiles.push(...uniqueAudioFiles);
                      updatedAudioFiles.sort(
                        (a, b) => a.indexInPlaylist - b.indexInPlaylist
                      );

                      setPlaylistData((prevPlaylistData) => ({
                        ...prevPlaylistData,
                        audioFiles: updatedAudioFiles,
                      }));
                      // updatedLocalAudioFiles.push(...uniqueAudioFiles);
                      // updatedLocalAudioFiles.sort(
                      //   (a, b) => a.indexInPlaylist - b.indexInPlaylist
                      // );
                    }
                  });

                  setIsUploadedFromCookies(true);
                }
              } catch (error) {
                console.error("Error fetching data:", error);
              }
            };

            fetchAllPartialPlaylistsParallel(
              parsedLastPlaylistId,
              totalCount,
              pageSize
            );
          })
          .catch((error) => {
            if (error.name === "AbortError") {
              console.log("Request aborted");
            } else {
              console.error("Error fetching data:", error);
            }
          });
      };

      if (trackId !== null) {
        fetchLastAudioFromCookie();
      }
    }
  }, [profileData]);

  useEffect(() => {
    if (isUploadedFromCookies) {
      const { indexInPlaylist } = CookieService.loadAudioDataFromCookie(
        profileData.id
      );

      setCurrentTrack({
        id: playlistData.audioFiles[indexInPlaylist].id,
        audioUrl: null,
        trackName: playlistData.audioFiles[indexInPlaylist].title,
        author: playlistData.audioFiles[indexInPlaylist].author,
        imageUrl: playlistData.audioFiles[indexInPlaylist].image
          ? `data:image/jpeg;base64,${playlistData.audioFiles[indexInPlaylist].image.data}`
          : "",
        duration: playlistData.audioFiles[indexInPlaylist].duration,
        indexInPlaylist:
          playlistData.audioFiles[indexInPlaylist].indexInPlaylist,
      });
      const parsedIndexInPlaylist = parseInt(indexInPlaylist);
      setCurrentTrackIndex(parsedIndexInPlaylist);

      setTimeout(() => {
        setIsUploadedFromCookies(false);
      }, 200);
    }
  }, [playlistData, isUploadedFromCookies]);

  const resetAudioContext = () => {
    setCurrentTrack(null);
    setCurrentTrackIndex(-1);
    setCurrentPlaylistId(-2);
    setPlaylistData(initialPlaylistData);
    setIsPlaying(false);
    audioRef.current.src = null;
    // audioRef = null;
    setPlaylistId(-1);
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

  const handlePlayAudio = async (audioFile, index, isNewPlaylist) => {
    // console.log(audioFile);
    // console.log(currentTrackIndex === audioFile.indexInPlaylist);
    // console.log(currentTrack);
    // console.log(playlistId + " : " + currentPlaylistId)
    if (
      currentTrackIndex === audioFile.indexInPlaylist &&
      playlistId === currentPlaylistId &&
      currentPlaylistId
    ) {
      handleTogglePlay();
    } else {
      // console.log("PLAY FIRST")
      try {
        setIsFetchingAudioFile(true);

        if (isNewPlaylist) {
          updatePlaylist(localPlaylistData);
          setCurrentPlaylistId(playlistId);
        } else {
          setIsPlayTrackInNewPlaylist(true);
          updatePlaylist(playlistData);
        }

        document.title = audioFile.title + " − " + audioFile.author;

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
        !isUploadedAudioFile &&
        !isUploadedFromCookies
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
      const previousAudioFile = playlistData.audioFiles[previousIndex];

      if (
        previousIndex >= 0 &&
        previousIndex < playlistData.audioFiles.length
      ) {
        if (playlistId !== currentPlaylistId) {
          fetchAudioData(previousAudioFile);
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
      ) {
        return;
      }

      let nextIndex = currentTrackIndex + 1;

      const nextAudioFile = playlistData.audioFiles[nextIndex];

      if (nextIndex < playlistData.audioFiles.length) {
        if (playlistId !== currentPlaylistId) {
          fetchAudioData(nextAudioFile);
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

  const fetchAudioData = async (audioFile, isLoadedFromCookie) => {
    AuthService.isValideToken(navigate).then((result) => {
      if (!result) {
        setIsValidToken(false);
        return;
      }
    });

    try {
      document.title = audioFile.title + " − " + audioFile.author;

      const abortController = new AbortController();
      setIsFetchingAudioFile(true);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = abortController;

      const response = await fetch(`${apiUrl}/api/audio/${audioFile.id}`, {
        headers: {
          Authorization: `Bearer ${AuthService.getAuthToken()}`,
        },
        signal: abortController.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!isLoadedFromCookie) {
        CookieService.clearAudioDataFromCookie(profileData.id);
      }

      const contentType = response.headers.get("content-type");

      let audioData;
      if (contentType === "application/octet-stream") {
        const blob = await response.blob();
        audioData = URL.createObjectURL(new Blob([blob]));
      } else {
        const data = await response.json();
        audioData = data.urlPath;
      }

      setCurrentTrack({
        id: audioFile.id,
        audioUrl: audioData,
        trackName: audioFile.title,
        author: audioFile.author,
        imageUrl: audioFile.image
          ? `data:image/jpeg;base64,${audioFile.image.data}`
          : "",
        duration: audioFile.duration,
        indexInPlaylist: audioFile.indexInPlaylist,
      });

      if (!isLoadedFromCookie) {
        CookieService.saveAudioDataToCookie(
          profileData.id,
          currentPlaylistId,
          audioFile.id,
          audioFile.indexInPlaylist
        );
      }

      setIsFetchingAudioFile(false);
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Error fetching data:", error);
      }
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  };

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
      (currentPlaylistId === playlistId ||
        isClickOnPlaylistPlayButton ||
        isPlayTrackInNewPlaylist)
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

      if (isUpdatedPlaylistName) {
        setIsUpdatePlaylistName(false);
        return;
      }

      if (isUploadedFromCookies) {
        setIsUploadedFromCookies(false);
        return;
      }

      if (isUploadedAudioFile && playlistId === currentPlaylistId) {
        setIsUploadedAudioFile(false);
        return;
      }

      const fetchAudioAndPlay = async () => {
        try {
          const currentAudioFile = playlistData.audioFiles[currentTrackIndex];

          if (
            currentTrackIndex !== -1 &&
            (currentPlaylistId === playlistId ||
              isClickOnPlaylistPlayButton ||
              isPlayTrackInNewPlaylist) &&
            playlistData &&
            playlistData.audioFiles &&
            playlistData.audioFiles[currentTrackIndex] &&
            !isDragDroped
          ) {
            setIsPlayTrackInNewPlaylist(false);

            if (isClickOnPlaylistPlayButton) {
              setIsClickOnPlaylistPlayButton(false);
            }

            fetchAudioData(currentAudioFile);
          }

          setIsClickOnPlaylistPlayButton(false);

          if (!isPlaying) {
            setIsPlaying(true);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchAudioAndPlay();

      audioRef.current.volume = volume;
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
        setPlaylistData,
        isUpdatedPlaylistName,
        setIsUpdatePlaylistName,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

AudioProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
