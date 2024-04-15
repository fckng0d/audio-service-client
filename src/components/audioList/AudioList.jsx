import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAudioContext } from "../AudioContext";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Tooltip } from "react-tooltip";
import "./AudioList.css";
import { useHistoryContext } from "../../App";
import AuthService from "../../services/AuthService";
import { useAuthContext } from "../../auth/AuthContext";

const AudioList = () => {
  const navigate = useNavigate();

  const {
    isAuthenticated,
    setIsAuthenticated,
    isValidToken,
    setIsValidToken,
    isAdminRole,
    setIsAdminRole,
  } = useAuthContext();

  const { setLastStateKey } = useHistoryContext();

  const { id } = useParams();
  const [prevPlaylistId, setPrevPlaylistId] = useState(null);
  const abortControllerRef = useRef(null);
  const prevCurrentPlaylistIdRef = useRef(null);

  // const [draggedIndex, setDraggedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const [isDragging, setIsDragging] = useState(false);
  const [draggingItemId, setDraggingItemId] = useState(null);
  // const [isDragDisabled, setIsDragDisabled] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [isShowImageMenu, setIsShowImageMenu] = useState(false);
  const fileInputRef = useRef(null);

  const [isPlaylistDownloading, setIsPlaylistDownloading] = useState(false);

  const audioListRef = useRef(null);
  const audioListContainerRef = useRef(null);

  const handleMouseEnterLiItem = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeaveLiItem = () => {
    setHoveredIndex(null);
  };

  const {
    setCurrentTrack,
    isPlaying,
    togglePlay,
    setIsPlaying,
    currentTrack,
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
    handlePlayAudio,
    isUploadedAudioFile,
    setIsUploadedAudioFile,
    setToCurrentPlaylistId,
    toCurrentPlaylistId,
  } = useAudioContext();

  useEffect(() => {
    // if (!isValidToken) {
    AuthService.isValideToken(navigate).then((result) => {
      if (!result) {
        setIsValidToken(false);
        return;
      }
    });

    // console.log(AuthService.isAuthenticated());
    // console.log(localStorage.getItem("token"));
    // }

    setLastStateKey();

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setToCurrentPlaylistId(id);

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

      setToCurrentPlaylistId(-5);
      // setPlaylistId(-5);
    };
  }, [id]);

  useEffect(() => {
    if (currentPlaylistId === -2 || id !== currentPlaylistId) {
      setIsUploadedAudioFile(false);
    }

    if (id === currentPlaylistId && isClickOnPlaylistPlayButton) {
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(!isPlaying);
        togglePlay();
      }
      setIsClickOnPlaylistPlayButton(false);
    }

    if (id === currentPlaylistId && !isUploadedAudioFile) {
      setIsPlaylistDownloading(false);
      clearLocalPlaylist();
      setLocalAudioFiles(playlistData.audioFiles);
      setLocalPlaylistData(playlistData);
      return;
    }

    if (
      (id &&
        typeof id === "string" &&
        playlistId !== currentPlaylistId &&
        currentPlaylistId !== prevCurrentPlaylistIdRef.current) ||
      isUploadedAudioFile
    ) {
      prevCurrentPlaylistIdRef.current = currentPlaylistId;

      clearLocalPlaylist();

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsPlaylistDownloading(true);
      fetch(`http://localhost:8080/api/playlists/${id}`, {
        headers: {
          Authorization: `Bearer ${AuthService.getAuthToken()}`,
        },
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
              fetchedPlaylistData.audioFiles.length > 0) ||
            (isUploadedAudioFile && id === currentPlaylistId)
          ) {
            updatePlaylist(fetchedPlaylistData);
            // if (currentPlaylistId !== -2) {
            //   setIsUploadedAudioFile(true);
            // }
          }

          setIsPlaylistDownloading(false);

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
          setIsPlaylistDownloading(true);
          if (error.name === "AbortError") {
            console.log("Request aborted");
          } else {
            console.error("Error fetching data:", error);
          }
          setIsUploadedAudioFile(true);
        });

      return () => {
        if (playlistId === prevPlaylistId && abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }
  }, [playlistId]);

  const deleteFromPlaylist = async (audioFile) => {
    console.log(audioFile.id);
    setIsDeleting(true);

    clearLocalPlaylist();

    const updatedLocalAudioFiles = localAudioFiles.filter(
      (file) => file.id !== audioFile.id
    );

    const updatedLocalPlaylistData = {
      ...localPlaylistData,
      countOfAudio: localPlaylistData.countOfAudio - 1,
      duration: localPlaylistData.duration - audioFile.duration,
      audioFiles: updatedLocalAudioFiles,
    };

    setIsDragDroped(true);

    setLocalAudioFiles(
      Array.isArray(updatedLocalPlaylistData.audioFiles)
        ? updatedLocalPlaylistData.audioFiles
        : []
    );

    setLocalPlaylistData(updatedLocalPlaylistData);

    const currentTrackId = currentTrack ? currentTrack.id : null;
    const newCurrentTrackIndex = updatedLocalAudioFiles.findIndex(
      (file) => file.id === currentTrackId
    );
    if (!isDragDroped && currentPlaylistId !== -2) {
      setIsDragDroped(true);
    }
    if (newCurrentTrackIndex === -1) {
      setCurrentTrackIndex(-1);
      // setCurrentTrackIndex(currentTrackIndex);
      setCurrentTrack(null);
      setIsDragDroped(false);
      audioRef.current.pause();
    } else {
      setCurrentTrackIndex(newCurrentTrackIndex);
    }

    if (!isDragDroped && currentPlaylistId !== -2) {
      setIsDragDroped(true);
    }

    updatePlaylist(updatedLocalPlaylistData);

    try {
      const response = await fetch(
        `http://localhost:8080/api/playlists/${id}/delete/${audioFile.id}`,
        {
          headers: {
            Authorization: `Bearer ${AuthService.getAuthToken()}`,
          },
          method: "DELETE",
        }
      );

      if (
        // !response.ok
        response.status === 500
      ) {
        setIsDeleting(false);
        throw new Error("Failed to delete audio file from playlist");
      }

      if (response.ok) {
        // console.log("Audio file deleted from playlist successfully");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting audio file from playlist:", error);
      setIsDeleting(false);
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

  const handleDragStart = (initial) => {
    setIsUpdating(true);
    setIsDragging(true);
    setDraggingItemId(initial.draggableId);
  };

  const handleDragEnd = (result) => {
    setIsDragging(false);
    setDraggingItemId(null);

    if (
      !result.destination ||
      result.source.index === result.destination.index
    ) {
      setIsUpdating(false);
      return;
    }

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

    if (
      ((currentTrackIndex === -1 || newCurrentTrackIndex !== -1) &&
        (result.source.index !== newCurrentTrackIndex ||
          newCurrentTrackIndex !== currentTrackIndex ||
          currentTrackIndex === result.source.index)) ||
      currentPlaylistId === -2
    ) {
      if (currentPlaylistId !== -2 && id === currentPlaylistId) {
        setCurrentTrackIndex(newCurrentTrackIndex);
      } else {
        setIsDragDroped(false);
      }

      if (!isDragDroped && currentPlaylistId !== -2) {
        setIsDragDroped(true);
      }

      setLocalPlaylistData(updatedPlaylistData);
      setLocalAudioFiles(reorderedAudioFiles);

      if (id === currentPlaylistId) {
        updatePlaylist(updatedPlaylistData);
      }
    }

    const updateAudioFiles = async (id, updatedAudioFiles) => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/playlists/${id}/update`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${AuthService.getAuthToken()}`,
            },
            method: "PUT",
            body: JSON.stringify(updatedAudioFiles),
          }
        );

        // setIsUpdating(false);

        if (
          // !response.ok
          response.status === 500
        ) {
          setIsUpdating(false);
          throw new Error("Failed to update playlist");
        }

        if (response.ok) {
          setIsUpdating(false);
          // console.log("all");
        }
      } catch (error) {
        console.error("Error updating playlist:", error);
        setIsUpdating(false);
        throw error;
      }
    };

    updateAudioFiles(id, reorderedAudioFiles);
  };

  useEffect(() => {
    if (isDragging) {
      const audioListContainer = audioListContainerRef.current;
      if (audioListContainer) {
        audioListContainer.classList.add("dragging-started");
      }
    }

    return () => {
      const audioListContainer = audioListContainerRef.current;
      if (audioListContainer) {
        audioListContainer.classList.remove("dragging-started");
      }
    };
  }, [isDragging]);

  const handleImageShowMenu = () => {
    setIsShowImageMenu(!isShowImageMenu);
  };

  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      uploadPlaylistImage(selectedFile);
    }
  };

  const uploadPlaylistImage = (playlistImage) => {
    const formData = new FormData();
    formData.append("playlistImage", playlistImage);

    fetch(`http://localhost:8080/api/playlists/${id}/image/update`, {
      headers: {
        Authorization: `Bearer ${AuthService.getAuthToken()}`,
      },
      method: "PUT",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to upload playlist image");
        }
      })
      .then((data) => {
        setLocalPlaylistData((prevState) => ({
          ...prevState,
          image: data.playlistImage,
        }));
      })
      .catch((error) => {
        // Обработка ошибки загрузки фотографии
      });
  };

  return (
    <>
      {isAuthenticated && (
        // isValidToken
        <div className="audio-list-container" ref={audioListContainerRef}>
          <div
            className="playlist-info"
            onMouseLeave={() => setIsShowImageMenu(false)}
            onClick={() => {
              isShowImageMenu && setIsShowImageMenu(false);
            }}
          >
            <div className="playlist-image-wrapper">
              {localPlaylistData.image ? (
                <img
                  src={`data:image/jpeg;base64,${localPlaylistData.image.data}`}
                  alt=""
                  onClick={() => handleImageShowMenu()}
                />
              ) : (
                <div className="alt-img"></div>
              )}
              {isAdminRole && localPlaylistData.image && (
                <div
                  className={`playlist-edit-overlay ${
                    isShowImageMenu && "hovered"
                  }`}
                  onClick={() =>
                    !localPlaylistData.image
                      ? openFilePicker()
                      : handleImageShowMenu()
                  }
                >
                  Изменить
                </div>
              )}
            </div>

            {isAdminRole && isShowImageMenu && (
              <div className="playlist-image-menu">
                <div
                  className="playlist-image-menu-item"
                  onClick={openFilePicker}
                >
                  Загрузить фото
                </div>
              </div>
            )}
            {isAdminRole && (
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            )}
            <div className="playlist-details">
              {localPlaylistData.name &&
                (localPlaylistData.countOfAudio ||
                  localPlaylistData.countOfAudio === 0) && (
                  <>
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
                  </>
                )}
              {!localPlaylistData.name && !localPlaylistData.countOfAudio && (
                <div style={{ height: "75px" }}></div>
              )}
              {isAdminRole && (
                <div className="add-audio-button-container">
                  <Link to={`/playlists/${id}/upload`}>
                    <button className="add-audio-button">Добавить трек</button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          <DragDropContext
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
          >
            <Droppable droppableId="audioList">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="audio-list"
                >
                  {!isPlaylistDownloading && (<div className="playlist-header">
                    <div className="header-item" style={{ marginLeft: "108px",  }}>
                      Название
                    </div>
                    <div className="header-item" style={{ marginLeft: "310px" }}>
                      Альбом
                    </div>
                    <div className="header-item" style={{ marginLeft: "300px" }}>
                      Прослушивания
                    </div>
                    <div className="header-item" style={{ marginLeft: "183px" }}>
                      Время
                    </div>
                  </div>)}

                  <ul>
                    {Array.isArray(localAudioFiles) &&
                      localAudioFiles.map((audioFile, index) => (
                        <Draggable
                          key={audioFile.id}
                          draggableId={audioFile.id}
                          index={index}
                          isDragDisabled={
                            !isAdminRole
                            // isDeleting
                            //   // || isDragDisabled
                          }
                        >
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`li-item ${
                                currentTrackIndex === index &&
                                playlistId === currentPlaylistId
                                  ? "playing"
                                  : draggingItemId &&
                                    draggingItemId === audioFile.id //  && isDragging
                                  ? "dragging"
                                  : ""
                              }`}
                              onMouseEnter={() => handleMouseEnterLiItem(index)}
                              onMouseLeave={handleMouseLeaveLiItem}
                            >
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
                                <div
                                  className="title-author-container"
                                  // onMouseEnter={() => setIsDragDisabled(true)}
                                  // onMouseLeave={() => setIsDragDisabled(false)}
                                >
                                  <span className="title">
                                    {audioFile.title}
                                  </span>
                                  <span className="author">
                                    {audioFile.author}
                                  </span>
                                </div>

                                <div className="album-container">
                                  <span className="album">
                                    Альбом
                                  </span>
                                </div>

                                <div className="countOfAuditions-container">
                                  <span className="countOfAuditions">
                                    {audioFile.countOfAuditions}
                                  </span>
                                </div>

                                <div className="duration-container">
                                  <span className="duration">
                                    {formatDuration(audioFile.duration)}
                                  </span>
                                </div>
                                <div className="delete-from-playlist-button-container">
                                  {isAdminRole && hoveredIndex === index ? (
                                    <button
                                      className={`delete-from-playlist-button${
                                        // isUpdating
                                        false
                                          ? // не должно быть
                                            // || isDeleting

                                            " updating"
                                          : ""
                                      }`}
                                      id="delete-from-playlist-button"
                                      onClick={() =>
                                        deleteFromPlaylist(audioFile)
                                      }
                                      // disabled={
                                      //   isUpdating

                                      //   // не должно быть
                                      //   // || isDeleting
                                      // }
                                    >
                                      X
                                    </button>
                                  ) : (
                                    <div className="delete-from-playlist-button"></div>
                                  )}
                                  {!isUpdating && (
                                    <Tooltip
                                      anchorSelect="#delete-from-playlist-button"
                                      className="tooltip-class"
                                      delayShow={200}
                                    >
                                      <span id="title-delete-button">
                                        Удалить из плейлиста
                                      </span>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>
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
      )}
    </>
  );
};

export default AudioList;
