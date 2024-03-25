import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAudioContext } from "../AudioContext";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./AudioList.css";

const AudioList = () => {
  const { id } = useParams();
  const [prevPlaylistId, setPrevPlaylistId] = useState(null);
  const abortControllerRef = useRef(null);
  const prevCurrentPlaylistIdRef = useRef(null);

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    setCurrentTrack,
    isPlaying,
    togglePlay,
    setIsPlaying,
    currentTrackIndex,
    setCurrentTrackIndex,
    audioRef,
    playlistId,
    setPlaylistId,
    localAudioFiles,
    setLocalAudioFiles,
    updatePlaylist,
    currentPlaylistId,
    setCurrentPlaylistId,
    localPlaylistData,
    setLocalPlaylistData,
    clearLocalPlaylist,
    isClickOnPlaylistPlayButton,
    setIsClickOnPlaylistPlayButton,
    playlistData,
    isDragDroped,
    setIsDragDroped,
  } = useAudioContext();

  useEffect(() => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    if (id !== playlistId) {
      setPrevPlaylistId(playlistId);
      setPlaylistId(id);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [id]);

  useEffect(() => {
    if (id === currentPlaylistId && isClickOnPlaylistPlayButton) {
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(!isPlaying);
        togglePlay();
      }
      setIsClickOnPlaylistPlayButton(false);
    }

    if (id === currentPlaylistId) {
      clearLocalPlaylist();
      setLocalAudioFiles(playlistData.audioFiles);
      setLocalPlaylistData(playlistData);
      setIsClickOnPlaylistPlayButton(false);
      return;
    }

    if (
      id &&
      typeof id === "string" &&
      playlistId !== currentPlaylistId &&
      currentPlaylistId !== prevCurrentPlaylistIdRef.current
    ) {
      prevCurrentPlaylistIdRef.current = currentPlaylistId;

      clearLocalPlaylist();

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      fetch(`http://localhost:8080/api/playlists/${id}`, {
        method: "GET",
        signal: abortController.signal,
      })
        .then((response) => response.json())
        .then((fetchedPlaylistData) => {
          setLocalAudioFiles(
            Array.isArray(fetchedPlaylistData.audioFiles)
              ? fetchedPlaylistData.audioFiles
              : []
          );

          setLocalPlaylistData(fetchedPlaylistData);

          if (
            currentPlaylistId === -2 ||
            (isClickOnPlaylistPlayButton &&
              id !== currentPlaylistId &&
              fetchedPlaylistData.audioFiles.length > 0)
          ) {
            updatePlaylist(fetchedPlaylistData);
          }

          if (isClickOnPlaylistPlayButton && id !== currentPlaylistId) {
            if (fetchedPlaylistData.audioFiles.length > 0) {
              setCurrentTrack({
                id: fetchedPlaylistData.audioFiles[0].id,
                audioUrl: null,
                trackName: fetchedPlaylistData.audioFiles[0].title,
                author: fetchedPlaylistData.audioFiles[0].author,
                imageUrl: fetchedPlaylistData.audioFiles[0].image
                  ? `data:image/jpeg;base64,${fetchedPlaylistData.audioFiles[0].image.data}`
                  : "",
                duration: fetchedPlaylistData.audioFiles[0].duration,
              });
              setCurrentPlaylistId(id);
              setCurrentTrackIndex(0);
            }

            setIsClickOnPlaylistPlayButton(false);
          }
        })
        .catch((error) => {
          if (error.name === "AbortError") {
            console.log("Request aborted");
          } else {
            console.error("Error fetching data:", error);
          }
        });

      return () => {
        if (playlistId === prevPlaylistId && abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }
  }, [playlistId]);

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
    console.log("handlePlayAudio:\n\ncurrentTrackIndex = ", currentTrackIndex, "\nindex = ", index)
    if (
      currentTrackIndex === index &&
      playlistId === currentPlaylistId &&
      currentPlaylistId
    ) {
      handleTogglePlay();
    } else {
      try {
        setCurrentPlaylistId(playlistId);

        console.log("audioFile = ", audioFile, "\nlocalPlaylistData.audioFiles = ", localPlaylistData.audioFiles, "\nplaylistData.audioFiles = ", playlistData.audioFiles)
        updatePlaylist(localPlaylistData);

        setCurrentTrack({
          id: audioFile.id,
          audioUrl: null,
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

  const getTotalDuration = () => {
    const minutes = Math.floor(localPlaylistData.duration / 60);

    return minutes;
  };

  // function handleDragStart(event) {
  //   console.log("Drag start event fired.");

  //   const audioListContainer = document.querySelector(".audio-list");

  //   // Получаем координаты верхнего левого угла контейнера audio-list
  //   const audioListRect = audioListContainer.getBoundingClientRect();
  //   const audioListLeft = audioListRect.left;
  //   const audioListTop = audioListRect.top;

  //   // Получаем ширину и высоту контейнера audio-list
  //   const audioListWidth = audioListRect.width;
  //   const audioListHeight = audioListRect.height;

  //   // Получаем текущие координаты курсора
  //   const cursorX = event.pageX;
  //   const cursorY = event.pageY;

  //   console.log("Cursor X:", cursorX);
  //   console.log("Cursor Y:", cursorY);

  //   // Проверяем, находится ли курсор в пределах audio-list
  //   if (
  //     cursorX < audioListLeft ||
  //     cursorX > audioListLeft + audioListWidth ||
  //     cursorY < audioListTop ||
  //     cursorY > audioListTop + audioListHeight
  //   ) {
  //     // Если курсор за пределами audio-list, отменяем перетаскивание
  //     event.preventDefault();
  //     console.log("Drag start prevented: cursor outside audio-list.");
  //     return;
  //   }
  // }

  const handleDragStart = (event) => {
    console.log("drag");
    const startIndex = localAudioFiles.findIndex(
      (audioFile) => audioFile.id === event.draggableId
    );
    setIsDragging(true);
    setDraggedIndex(startIndex);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    console.log("drag ended");
    // setIsDragDroped(true);

    const reorderedAudioFiles = Array.from(localAudioFiles);
    const [reorderedItem] = reorderedAudioFiles.splice(result.source.index, 1);
    reorderedAudioFiles.splice(result.destination.index, 0, reorderedItem);

    setIsDragDroped(true);

    const updatedPlaylistData = {
      ...localPlaylistData,
      audioFiles: reorderedAudioFiles,
    };

    const currentTrackId = localPlaylistData.audioFiles[currentTrackIndex]?.id;
    const newCurrentTrackIndex = reorderedAudioFiles.findIndex(
      (audioFile) => audioFile.id === currentTrackId
    );

    console.log("result.source.index = ", result.source.index, "\nnewCurrentTrackIndex = ", newCurrentTrackIndex, "\ncurrentTrackIndex = ", currentTrackIndex)
    if ((currentTrackIndex === -1 || newCurrentTrackIndex !== -1) &&
    (result.source.index !== newCurrentTrackIndex || newCurrentTrackIndex !== currentTrackIndex || currentTrackIndex === result.source.index) || currentPlaylistId === -2) {
      console.log("asdsdad")
      if (currentPlaylistId !== -2) {
        console.log("currentPlaylistId !== -2 : true")
        setCurrentTrackIndex(newCurrentTrackIndex);
      } else {
        setIsDragDroped(false);
      }

      if (!isDragDroped && currentPlaylistId !== -2) {
        setIsDragDroped(true);
      }

      console.log(newCurrentTrackIndex);

      setLocalPlaylistData(updatedPlaylistData);
      setLocalAudioFiles(reorderedAudioFiles);
      updatePlaylist(updatedPlaylistData);
    }

    // setIsDragDroped(false);

    const updateAudioFiles = async (id, updatedAudioFiles) => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/playlists/${id}/update`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedAudioFiles),
          }
        );

        console.log(id, " : ", updatedAudioFiles);

        if (!response.ok) {
          throw new Error("Failed to update playlist");
        }

        console.log("Playlist updated!");

      } catch (error) {
        console.error("Error updating playlist:", error);
        throw error;
      }
    };

    updateAudioFiles(playlistId, reorderedAudioFiles);

    console.log(localAudioFiles);
  };

  return (
    <div className="audio-list-container">
      <div className="playlist-info">
        <img
          src={
            !localPlaylistData.image
              ? null
              : `data:image/jpeg;base64,${localPlaylistData.image.data}`
          }
          alt=""
        />
        <div className="playlist-details">
          <h2>{localPlaylistData.name}</h2>
          <p>
            {localPlaylistData.countOfAudio}{" "}
            {localPlaylistData.countOfAudio === 1
              ? "трек "
              : localPlaylistData.countOfAudio < 5 &&
                localPlaylistData.countOfAudio !== 0
              ? "трека "
              : "треков "}
            – {getTotalDuration()} минут
          </p>
          <div className="add-button-container">
            <Link to={`/playlists/${id}/upload`}>
              <button className="add-button">
                <span>+</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <Droppable droppableId="audioList">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="audio-list"
            >
              <ul>
                {Array.isArray(localAudioFiles) &&
                  localAudioFiles.map((audioFile, index) => (
                    <Draggable
                      key={audioFile.id}
                      draggableId={audioFile.id}
                      index={index}
                    >
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {/* <li key={audioFile.id}> */}
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
                                className={`play_pause ${
                                  currentTrackIndex === index &&
                                  playlistId === currentPlaylistId
                                    ? isPlaying
                                      ? "playing"
                                      : "current"
                                    : ""
                                }`}
                                onClick={() =>
                                  handlePlayAudio(audioFile, index)
                                }
                              >
                                <p
                                  style={{
                                    transform:
                                      currentTrackIndex === index &&
                                      playlistId === currentPlaylistId &&
                                      isPlaying
                                        ? ""
                                        : "scale(0.9, 2)",
                                    marginLeft:
                                      currentTrackIndex === index &&
                                      playlistId === currentPlaylistId &&
                                      isPlaying
                                        ? ""
                                        : "2px",
                                  }}
                                >
                                  {currentTrackIndex === index &&
                                  playlistId === currentPlaylistId &&
                                  isPlaying
                                    ? "❙❙"
                                    : "►"}
                                </p>
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
                          {/* </li> */}
                        </li>
                      )}
                    </Draggable>
                  ))}
              </ul>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default AudioList;
