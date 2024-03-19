// import React, {
//   createContext,
//   useState,
//   useContext,
//   useEffect,
//   useRef,
// } from "react";
// import PropTypes from "prop-types";
// import { debounce } from "lodash";

// const AudioContext = createContext();

// export const useAudioContext = () => useContext(AudioContext);

// export const AudioProvider = ({ children }) => {
//   const [currentTrack, setCurrentTrack] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [volume, setVolume] = useState(1);

//   const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
//   const [currentTime, setCurrentTime] = useState(0);
//   const audioRef = useRef(null);

//   const [currentPlaylistId, setCurrentPlaylistId] = useState(-2);
//   const [playlistId, setPlaylistId] = useState(-1);

//   const [currentPLaylist, setCurrentPlaylis] = useState(null);

//   const [audioFiles, setAudioFiles] = useState([]);
//   const [localAudioFiles, setLocalAudioFiles] = useState([]);

//   const [audioId, setAudioId] = useState(-1);

//   const clearAudioFiles = () => {
//     setAudioFiles([]);
//   };

//   useEffect(() => {
//     console.log(
//       "useEffect currentPlaylistId:\n\ncurrentPlaylistId = " +
//         currentPlaylistId +
//         "\nplaylistId = " +
//         playlistId
//     );
//   }, [currentPlaylistId]);

//   // useEffect(() => {
//   //   setCurrentPlaylistId(playlistId);
//   // }, [playlistId]);

//   const updateAudioFiles = (data) => {
//     setLocalAudioFiles(data);
//     if (currentPlaylistId === playlistId && !isPlaying) {
//       console.log("Обновлен audioFiles\n\ncurrentPlaylistId = " + currentPlaylistId + "\nplaylistId = " + playlistId);
//       // setCurrentPlaylistId(playlistId);
//       setAudioFiles(data);
//       // if (!isPlaying || currentPlaylistId !== playlistId) {
//       //   setLocalAudioFiles(data);
//       // }
//     }
//     // setLocalAudioFiles(data);
//   };

//   const updatePlaylist = (data) => {
//     if (currentPlaylistId !== playlistId || !isPlaying) {
//       setLocalAudioFiles(data);
//       if (!isPlaying) {
//         setAudioFiles(data);
//       }
//     }
//   };

//   const togglePlay = () => {
//     setIsPlaying(!isPlaying);
//   };

//   // useEffect(() => {
//   //   if (currentTrackIndex !== -1 && currentPlaylistId === playlistId) {
//   //     setCurrentTrack({
//   //       id: audioFiles[currentTrackIndex].id,
//   //       audioUrl: audioFiles[currentTrackIndex].audioUrl,
//   //       trackName: audioFiles[currentTrackIndex].title,
//   //       author: audioFiles[currentTrackIndex].author,
//   //       imageUrl: audioFiles[currentTrackIndex].image
//   //         ? `data:image/jpeg;base64,${audioFiles[currentTrackIndex].image.data}`
//   //         : "",
//   //       duration: audioFiles[currentTrackIndex].duration,
//   //     });
//   //   }
//   // }, [currentTrackIndex]);

//   const playNextTrack = async () => {
//     if (currentTrackIndex === audioFiles.length - 1) return;

//     let nextIndex = currentTrackIndex + 1;
//     while (nextIndex < audioFiles.length) {
//       const nextTrack = audioFiles[nextIndex];
//       // if (nextTrack.playlistId === currentPlaylistId) {
//       setCurrentTrackIndex(nextIndex);
//       try {
//         const response = await fetch(
//           `http://localhost:8080/api/audio/${nextTrack.id}`
//         );
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const blob = await response.blob();
//         const audioData = URL.createObjectURL(blob);

//         setCurrentTrack({
//           id: nextTrack.id,
//           audioUrl: audioData,
//           // audioUrl: nextTrack.audioData,
//           trackName: nextTrack.title,
//           author: nextTrack.author,
//           imageUrl: nextTrack.image
//             ? `data:image/jpeg;base64,${nextTrack.image.data}`
//             : "",
//           duration: nextTrack.duration,
//         });
//         setIsPlaying(true);
//         return;
//       } catch (error) {
//         console.error("Error fetching audio:", error);
//       }
//       // }
//       nextIndex++;
//     }
//   };

//   const playPreviousTrack = async () => {
//     if (currentTrackIndex === 0) return;

//     console.log(
//       "Предыдущий трек:\n\ncurrentPlaylistId = " +
//         currentPlaylistId +
//         "\nplaylistId = " +
//         playlistId +
//         "\n\nтекущий трек = " +
//         audioFiles[currentTrackIndex].title +
//         "\nпредыдущий трек = " +
//         audioFiles[currentTrackIndex - 1].title
//     );

//     let previousIndex = currentTrackIndex - 1;
//     while (previousIndex >= 0) {
//       const previousTrack = audioFiles[previousIndex];
//       // if (previousTrack.playlistId === currentPlaylistId) {
//       // setCurrentPlaylistId(playlistId);

//       setCurrentTrackIndex(previousIndex);
//       try {
//         const response = await fetch(
//           `http://localhost:8080/api/audio/${previousTrack.id}`
//         );
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const blob = await response.blob();
//         const audioData = URL.createObjectURL(blob);

//         setCurrentTrack({
//           id: previousTrack.id,
//           audioUrl: audioData,
//           // audioUrl: previousTrack.audioData,
//           trackName: previousTrack.title,
//           author: previousTrack.author,
//           imageUrl: previousTrack.image
//             ? `data:image/jpeg;base64,${previousTrack.image.data}`
//             : "",
//           duration: previousTrack.duration,
//         });
//         setIsPlaying(true);
//         return;
//       } catch (error) {
//         console.error("Error fetching audio:", error);
//       }

//       // }
//       previousIndex--;
//     }
//   };

//   // const playPreviousTrack = async () => {
//   //   if (currentTrackIndex === 0) return;

//   //   console.log(
//   //     "Предыдущий трек:\n\ncurrentPlaylistId = " +
//   //       currentPlaylistId +
//   //       "\nplaylistId = " +
//   //       playlistId
//   //   );

//   //   let previousIndex = currentTrackIndex - 1;
//   //   while (previousIndex >= 0) {
//   //     const previousTrack = audioFiles[previousIndex];
//   //     // if (previousTrack.playlistId === currentPlaylistId) {
//   //       setCurrentTrackIndex(previousIndex);
//   //       try {
//   //         const response = await fetch(
//   //           `http://localhost:8080/api/audio/${previousTrack.id}`
//   //         );
//   //         if (!response.ok) {
//   //           throw new Error(`HTTP error! status: ${response.status}`);
//   //         }
//   //         const blob = await response.blob();
//   //         const audioData = URL.createObjectURL(blob);

//   //         setCurrentTrack({
//   //           id: previousTrack.id,
//   //           audioUrl: audioData,
//   //           trackName: previousTrack.title,
//   //           author: previousTrack.author,
//   //           imageUrl: previousTrack.image
//   //             ? `data:image/jpeg;base64,${previousTrack.image.data}`
//   //             : "",
//   //           duration: previousTrack.duration,
//   //         });
//   //         setIsPlaying(true);
//   //         return;
//   //       } catch (error) {
//   //         console.error("Error fetching audio:", error);
//   //       }
//   //     // }
//   //     previousIndex--;
//   //   }
//   // };

//   // Задержка перед следующим вызовом
//   const debouncedPlayNextTrack = debounce(() => {
//     if (currentTrackIndex !== -1) {
//       playNextTrack();
//     }
//   }, 500);

//   const debouncedPlayPreviousTrack = debounce(() => {
//     if (currentTrackIndex !== -1) {
//       playPreviousTrack();
//     }
//   }, 500);

//   useEffect(() => {
//     if (currentTrackIndex !== -1 && currentPlaylistId === playlistId) {
//       // console.log("useEffect GET audio:\n\n" + "audioFiles: " + audioFiles[currentTrackIndex].title);
//       const fetchAudioAndPlay = async () => {
//         try {
//           const response = await fetch(
//             `http://localhost:8080/api/audio/${audioFiles[currentTrackIndex].id}`
//           );
//           if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//           }
//           const blob = await response.blob();
//           const audioData = URL.createObjectURL(new Blob([blob]));

//           if (playlistId !== currentPlaylistId) {

//             setCurrentPlaylistId(playlistId);
//             console.log("setCurrentPlaylistId: = " + currentPlaylistId);
//           }

//           setCurrentTrack({
//             id: audioFiles[currentTrackIndex].id,
//             audioUrl: audioData,
//             trackName: audioFiles[currentTrackIndex].title,
//             author: audioFiles[currentTrackIndex].author,
//             imageUrl: audioFiles[currentTrackIndex].image
//               ? `data:image/jpeg;base64,${audioFiles[currentTrackIndex].image.data}`
//               : "",
//             duration: audioFiles[currentTrackIndex].duration,
//           });
//           setIsPlaying(true);
//         } catch (error) {
//           console.error("Error fetching audio:", error);
//         }
//       };

//       fetchAudioAndPlay();
//       audioRef.current.volume = volume;
//     }
//   }, [currentTrackIndex]);

//   return (
//     <AudioContext.Provider
//       value={{
//         currentTrack,
//         setCurrentTrack,
//         isPlaying,
//         setIsPlaying,
//         togglePlay,
//         volume,
//         setVolume,
//         audioFiles,
//         updateAudioFiles,
//         currentTrackIndex,
//         setCurrentTrackIndex,
//         audioRef,
//         debouncedPlayNextTrack,
//         debouncedPlayPreviousTrack,
//         currentTime,
//         setCurrentTime,
//         clearAudioFiles,
//         currentPlaylistId,
//         setCurrentPlaylistId,
//         playlistId,
//         setPlaylistId,
//         localAudioFiles,
//         setLocalAudioFiles,
//         updatePlaylist,
//         audioId,
//         setAudioId,
//         currentPLaylist,
//         setCurrentPlaylis,
//       }}
//     >
//       {children}
//     </AudioContext.Provider>
//   );
// };

// AudioProvider.propTypes = {
//   children: PropTypes.node.isRequired,
// };

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

  const [localAudioFiles, setLocalAudioFiles] = useState([]);

  const [audioId, setAudioId] = useState(-1);

  const clearLocalPlaylist = () => {
    // if (playlistId !== currentPlaylistId) {
    setLocalAudioFiles([]);
    setLocalPlaylistData(initialPlaylistData);
    // }
  };

  useEffect(() => {
    console.log(
      "useEffect currentPlaylistId:\n\ncurrentPlaylistId = " +
        currentPlaylistId +
        "\nplaylistId = " +
        playlistId
    );
  }, [currentPlaylistId]);

  const updatePlaylist = (playlistData) => {
    // if (currentPlaylistId === playlistId || !isPlaying) {
    console.log(
      "Обновлен playlistData\n\ncurrentPlaylistId = " +
        currentPlaylistId +
        "\nplaylistId = " +
        playlistId
    );
    setPlaylistData(playlistData);
    // setPlaylistData({
    //   id: playlistData.id,
    //   name: playlistData.name,
    //   audioFiles: Array.isArray(playlistData.audioFiles)
    //     ? playlistData.audioFiles
    //     : [],
    // });
    console.log(playlistData);
    // }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    console.log("useEffect на обновление currentTrackIndex");
    if (currentTrackIndex !== -1 && currentPlaylistId === playlistId) {
      if (
        currentTrackIndex !== -1 &&
        // currentPlaylistId === playlistId &&
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

    // console.log(
    //   "playlistData:",
    //   playlistData,
    //   "currentTrackIndex:",
    //   currentTrackIndex,
    //   "playlistData.audioFiles:",
    //   playlistData.audioFiles,
    //   "playlistData.audioFiles[currentTrackIndex]:",
    //   playlistData.audioFiles[currentTrackIndex]
    // );

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

      // setCurrentTrackIndex(previousIndex);

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

      // setCurrentTrackIndex(previousIndex);

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

            console.log(
              "playlistData:",
              playlistData,
              "currentTrackIndex:",
              currentTrackIndex,
              "playlistData.audioFiles:",
              playlistData.audioFiles,
              "playlistData.audioFiles[currentTrackIndex]:",
              playlistData.audioFiles[currentTrackIndex]
            );

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
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

AudioProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
