// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom"; // Импорт хука useParams
// import { useAudioContext } from "../AudioContext";
// import "./AudioList.css";

// const AudioList = () => {
//   const { id } = useParams(); // Получение параметра id из URL

//   const {
//     currentTrack,
//     setCurrentTrack,
//     isPlaying,
//     togglePlay,
//     setIsPlaying,
//     currentTrackIndex,
//     setCurrentTrackIndex,
//     audioFiles,
//     audioRef,
//     playlistId,
//     setPlaylistId,
//     localAudioFiles,
//     setLocalAudioFiles,
//     updateAudioFiles,
//     updatePlaylist,
//     audioId,
//     setAudioId,
//     currentPlaylistId,
//     setCurrentPlaylistId,
//   } = useAudioContext();

//   const [isLocalPlaying, setIsLocalPlaying] = useState(false); // Дополнительное состояние для отслеживания локального воспроизведения

//   useEffect(() => {
//     console.log(currentPlaylistId);
//   }, [id]);

//   useEffect(() => {
//     setPlaylistId(id);
//     console.log(
//       "useEffect и fetct /playlists/${id}:\n\ncurrentPlaylistId = " +
//         currentPlaylistId +
//         // "\nid = " +
//         // id +
//         "\nplaylistId = " +
//         playlistId
//     );
//     if (
//       currentPlaylistId === -1 ||
//       currentPlaylistId !== playlistId ||
//       !isPlaying
//     ) {
//       fetch(`http://localhost:8080/api/playlists/${id}`, { method: "GET" })
//         .then((response) => response.json())
//         .then((data) => {
//           if (currentPlaylistId === -1 || currentPlaylistId !== playlistId) {
//             updateAudioFiles(data);
//           }
//           // updatePlaylist(data);
//         })
//         .catch((error) => console.error("Error fetching data:", error));
//     }
//   }, [id]);

//   useEffect(() => {
//     setIsLocalPlaying(isPlaying);
//   }, [isPlaying]);

//   const handleTogglePlay = () => {
//     if (isLocalPlaying) {
//       audioRef.current.pause(); // Пауза воспроизведения
//     } else {
//       audioRef.current.play(); // Возобновление воспроизведения
//     }
//     setIsLocalPlaying(!isLocalPlaying); // Изменение локального состояния воспроизведения
//     togglePlay(); // Переключение состояния воспроизведения в контексте
//   };

//   const handlePlayAudio = async (audioFile, index) => {
//     console.log(
//       "play/pause:\n\ncurrentPlaylistId = " +
//         currentPlaylistId +
//         "\nid = " + id +
//         "\nplaylistId = " +
//         playlistId
//     );
//     if (
//       currentTrackIndex === index &&
//       currentPlaylistId === id &&
//       audioId === audioFile.id
//     ) {
//       handleTogglePlay();
//     } else {
//       try {
//         const response = await fetch(
//           `http://localhost:8080/api/audio/${audioFile.id}`
//         );
//         setAudioId(audioFile.id);

//         // console.log(
//         //   "currentPlaylistId = " +
//         //     currentPlaylistId +
//         //     "\nid = " +
//         //     id +
//         //     "\nplaylistId = " +
//         //     playlistId
//         // );

//         // if (id !== currentPlaylistId) {
//           setCurrentPlaylistId(id);
//         // }

//         // console.log(
//         //   "currentPlaylistId = " +
//         //     currentPlaylistId +
//         //     "\nid = " +
//         //     id +
//         //     "\nplaylistId = " +
//         //     playlistId
//         // );

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const blob = await response.blob();
//         const audioData = URL.createObjectURL(new Blob([blob]));

//         setCurrentTrackIndex(index);
//         setCurrentTrack({
//           id: audioFile.id,
//           audioUrl: audioData,
//           trackName: audioFile.title,
//           author: audioFile.author,
//           imageUrl: audioFile.image
//             ? `data:image/jpeg;base64,${audioFile.image.data}`
//             : "",
//           duration: audioFile.duration,
//         });

//         setIsPlaying(true);
//       } catch (error) {
//         console.error("Error fetching audio:", error);
//       }
//     }
//   };

//   function formatDuration(duration) {
//     const hours = Math.floor(duration / 3600);
//     const minutes = Math.floor((duration % 3600) / 60);
//     const seconds = Math.floor(duration % 60);

//     let formattedTime = "";
//     if (hours > 0) {
//       formattedTime += hours + ":";
//     }
//     if (hours > 0 && minutes < 10) {
//       formattedTime += "0";
//     }
//     formattedTime += String(minutes).padStart(hours > 0 ? 2 : 1, "0") + ":";
//     formattedTime += String(seconds).padStart(2, "0");

//     return formattedTime;
//   }

//   return (
//     <div className="audio-list">
//       <ul>
//         {Array.isArray(localAudioFiles) &&
//           localAudioFiles.map((audioFile, index) => (
//             <li key={audioFile.id}>
//               <div className="audio-metadata-container">
//                 {audioFile.image && (
//                   <img
//                     src={`data:image/jpeg;base64,${audioFile.image.data}`}
//                     alt={audioFile.title}
//                     loading="lazy"
//                   />
//                 )}
//                 <div className="button-container">
//                   <button
//                     className="play_pause"
//                     onClick={() => handlePlayAudio(audioFile, index)}
//                   >
//                     {currentTrackIndex === index &&
//                     currentPlaylistId === playlistId &&
//                     // audioId === audioFile.id &&
//                     isPlaying
//                       ? "||"
//                       : ">"}
//                   </button>
//                 </div>
//                 <div className="title-author-container">
//                   <span className="title">{audioFile.title}</span>
//                   <span>{audioFile.author}</span>
//                 </div>
//                 <div className="duration-container">
//                   <span className="duration">
//                     {formatDuration(audioFile.duration)}
//                   </span>
//                 </div>
//               </div>
//             </li>
//           ))}
//       </ul>
//     </div>
//   );
// };

// export default AudioList;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Импорт хука useParams
import { useAudioContext } from "../AudioContext";
import "./AudioList.css";

const AudioList = () => {
  const { id } = useParams(); // Получение параметра id из URL

  const {
    setCurrentTrack,
    isPlaying,
    togglePlay,
    setIsPlaying,
    currentTrackIndex,
    setCurrentTrackIndex,
    audioFiles,
    audioRef,
    playlistId,
    setPlaylistId,
    localAudioFiles,
    setLocalAudioFiles,
    updateAudioFiles,
    updatePlaylist,
    currentPlaylistId,
    setCurrentPlaylistId,
    localPlaylistData,
    setLocalPlaylistData,
    clearLocalPlaylist,
  } = useAudioContext();

  const [isLocalPlaying, setIsLocalPlaying] = useState(false); // Дополнительное состояние для отслеживания локального воспроизведения

  useEffect(() => {
    if (id !== playlistId) {
      console.log("обновление id плейлиста в ссылке:\nid = " + id);
      setPlaylistId(id);
    }
  }, [id]);

  useEffect(() => {
    if (id && typeof id === "string" && playlistId !== currentPlaylistId) {
      clearLocalPlaylist();

      console.log(
        "GET плейлилиста:\nplaylistId = " +
          playlistId +
          "\ncurrentPlaylistId = " +
          currentPlaylistId
      );

      fetch(`http://localhost:8080/api/playlists/${id}`, { method: "GET" })
        .then((response) => response.json())
        .then((fetchedPlaylistData) => {
          // if (playlistId === -1) {
          setLocalAudioFiles(
            Array.isArray(fetchedPlaylistData.audioFiles)
              ? fetchedPlaylistData.audioFiles
              : []
          );
          setLocalPlaylistData(fetchedPlaylistData);
          // }
          if (currentPlaylistId === -2) {
            updatePlaylist(fetchedPlaylistData);
          }
        })
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [playlistId]);

  useEffect(() => {
    setIsLocalPlaying(isPlaying);
  }, [isPlaying]);

  const handleTogglePlay = () => {
    if (isLocalPlaying) {
      audioRef.current.pause(); // Пауза воспроизведения
    } else {
      audioRef.current.play(); // Возобновление воспроизведения
    }
    setIsLocalPlaying(!isLocalPlaying); // Изменение локального состояния воспроизведения
    togglePlay(); // Переключение состояния воспроизведения в контексте
  };

  const handlePlayAudio = async (audioFile, index) => {
    console.log("handlePlayAudio:\n\ncurrentPlaylistId = " + currentPlaylistId);
    if (currentTrackIndex === index && playlistId === currentPlaylistId && currentPlaylistId) {
      handleTogglePlay();
    } else {
      try {
        const response = await fetch(
          `http://localhost:8080/api/audio/${audioFile.id}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        const audioData = URL.createObjectURL(new Blob([blob]));

        // if (playlistId !== currentPlaylistId) {
        setCurrentPlaylistId(playlistId);

        updatePlaylist(localPlaylistData);
        // }

        // setCurrentPslaylistId(playlistId);

        setCurrentTrack({
          id: audioFile.id,
          audioUrl: audioData,
          trackName: audioFile.title,
          author: audioFile.author,
          imageUrl: audioFile.image
            ? `data:image/jpeg;base64,${audioFile.image.data}`
            : "",
          duration: audioFile.duration,
        });

        setCurrentTrackIndex(index);
        setIsPlaying(true);
      } catch (error) {
        console.error("Error fetching audio:", error);
      }
    }
  };

  function formatDuration(duration) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    let formattedTime = "";
    if (hours > 0) {
      formattedTime += hours + ":";
    }
    if (hours > 0 && minutes < 10) {
      formattedTime += "0";
    }
    formattedTime += String(minutes).padStart(hours > 0 ? 2 : 1, "0") + ":";
    formattedTime += String(seconds).padStart(2, "0");

    return formattedTime;
  }

  // Временно (нужно переписать api, чтобы получать сам плейлист)
  const getTotalDuration = () => {
    let totalSeconds = 0;
    localAudioFiles.forEach((audioFile) => {
      totalSeconds += audioFile.duration;
    });

    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = (totalSeconds % 60).toFixed(2);

    return minutes;
  };

  return (
    <div className="audio-list-container">
      <div className="playlist-info">
        <h2>Плейлист</h2>
        <p>
          {localAudioFiles.length}{" "}
          {localAudioFiles.length === 1
            ? "песня"
            : localAudioFiles.length < 5 && localAudioFiles.length !== 0
            ? "песни"
            : "песен"}
          , {getTotalDuration()} минут
        </p>
      </div>
      <div className="audio-list">
        <ul>
          {Array.isArray(localAudioFiles) &&
            localAudioFiles.map((audioFile, index) => (
              <li key={audioFile.id}>
                <div className="audio-metadata-container">
                  {audioFile.image && (
                    <img
                      src={`data:image/jpeg;base64,${audioFile.image.data}`}
                      alt={audioFile.title}
                      loading="lazy"
                    />
                  )}
                  <div className="button-container">
                    <button
                      className="play_pause"
                      onClick={() => handlePlayAudio(audioFile, index)}
                    >
                      {currentTrackIndex === index &&
                      playlistId === currentPlaylistId &&
                      isPlaying
                        ? "||"
                        : ">"}
                    </button>
                  </div>
                  <div className="title-author-container">
                    <span className="title">{audioFile.title}</span>
                    <span className="author">{audioFile.author}</span>
                  </div>
                  <div className="duration-container">
                    <span className="duration">
                      {formatDuration(audioFile.duration)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default AudioList;
