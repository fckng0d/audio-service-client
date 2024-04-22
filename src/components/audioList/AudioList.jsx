import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAudioContext } from "../AudioContext";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Tooltip } from "react-tooltip";
import "./AudioList.css";
import { useHistoryContext } from "../../App";
import AuthService from "../../services/AuthService";
import { useAuthContext } from "../../auth/AuthContext";

const AudioList = ({ isFavoriteAudioFiles }) => {
  AudioList.propTypes = {
    isFavoriteAudioFiles: PropTypes.bool,
  };
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

  const [isEditingPlaylistName, setIsEditingPlaylistName] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const inputPlaylistNameRef = useRef(null);
  const [playlistNameAvailableMessage, setPlaylistNameAvailableMessage] =
    useState("");

  const [isUserAudioFiles, setIsUserAudioFiles] = useState(false);

  const [showAudioFileMenu, setShowAudioFileMenu] = useState(false);

  const audioListRef = useRef(null);
  const audioListContainerRef = useRef(null);

  const handleMouseEnterLiItem = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeaveLiItem = () => {
    setHoveredIndex(null);
    setShowAudioFileMenu(false);
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
    updatePlaylistMultiFetch,
  } = useAudioContext();

  // из-за бага обновления состояния контекста
  useEffect(() => {
    if (isFavoriteAudioFiles) {
      clearLocalPlaylist();
    }
    if (!isFavoriteAudioFiles) {
      if (playlistId === -1) {
        navigate(`/playlist/null`, { replace: true });
        setTimeout(() => {
          navigate(`/playlists/${id}`, { replace: true });
        }, 1);
      }
    }
  }, []);

  useEffect(() => {
    if (id !== playlistId) {
      setPrevPlaylistId(playlistId);
      if (isFavoriteAudioFiles) {
        setPlaylistId(-10);
      } else {
        setPlaylistId(id);
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
    setToCurrentPlaylistId(id);
    AuthService.isValideToken(navigate).then((result) => {
      if (!result) {
        setIsValidToken(false);
        return;
      }
    });

    setLastStateKey();

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      clearLocalPlaylist();
      setToCurrentPlaylistId(-5);
      // setPlaylistId(-5);
      // setPlaylistId(id);
    };
  }, [id]);

  useEffect(() => {
    if (
      isClickOnPlaylistPlayButton &&
      id !== currentPlaylistId &&
      localAudioFiles.length > 0
    ) {
      handlePlayAudio(localAudioFiles[0], 0);
      setCurrentPlaylistId(id);
    }
  }, [isClickOnPlaylistPlayButton, localAudioFiles]);

  useEffect(() => {
    if (localPlaylistData && localPlaylistData.name) {
      setPlaylistName(localPlaylistData.name);
    }
  }, [localPlaylistData]);

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

    if (
      (id === currentPlaylistId || (currentPlaylistId === -10 && !id)) &&
      !isUploadedAudioFile
    ) {
      setIsPlaylistDownloading(false);
      clearLocalPlaylist();
      setLocalAudioFiles(playlistData.audioFiles);
      setLocalPlaylistData(playlistData);
      return;
    }

    if (
      (((id && typeof id === "string") || isFavoriteAudioFiles) &&
        // playlistId !== currentPlaylistId &&
        currentPlaylistId !== prevCurrentPlaylistIdRef.current) ||
      isUploadedAudioFile
    ) {
      prevCurrentPlaylistIdRef.current = currentPlaylistId;

      clearLocalPlaylist();

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsPlaylistDownloading(true);

      fetch(
        isFavoriteAudioFiles && !id
          ? `http://localhost:8080/api/favorites/audioFiles`
          : `http://localhost:8080/api/playlists/${id}`,
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
          // console.log(id)
          setIsPlaylistDownloading(false);
          return response.json();
        })
        .then((data) => {
          // console.log(data)
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

          clearLocalPlaylist();

          // updatePlaylist(initialPlaylistData);
          setLocalPlaylistData(initialPlaylistData);

          const totalCount = data.countOfAudio;
          const pageSize = 10;

          const fetchPartialPlaylists = async (id, startIndex, count) => {
            const response = await fetch(
              isFavoriteAudioFiles && !id
                ? `http://localhost:8080/api/favorites/audioFiles/partial?startIndex=${startIndex}&count=${count}`
                : `http://localhost:8080/api/playlists/${id}/audioFiles/partial?startIndex=${startIndex}&count=${count}`,
              {
                headers: {
                  Authorization: `Bearer ${AuthService.getAuthToken()}`,
                },
                method: "GET",
                signal: abortController.signal,
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
                fetchPartialPlaylists(id, page * pageSize, count)
              );
            }

            try {
              const responses = await Promise.all(fetchPromises);
              const updatedAudioFiles = [...localPlaylistData.audioFiles];
              const updatedLocalAudioFiles = [...localAudioFiles];

              responses.forEach((response) => {
                if (response && Array.isArray(response.audioFiles)) {
                  // Фильтруем только уникальные элементы по id
                  const uniqueAudioFiles = response.audioFiles.filter(
                    (audioFile) => {
                      return !updatedAudioFiles.some(
                        (existingFile) => existingFile.id === audioFile.id
                      );
                    }
                  );

                  // Добавляем только уникальные элементы в массивы
                  updatedAudioFiles.push(...uniqueAudioFiles);
                  updatedAudioFiles.sort(
                    (a, b) => a.indexInPlaylist - b.indexInPlaylist
                  );
                  setLocalPlaylistData((prevPlaylistData) => ({
                    ...prevPlaylistData,
                    audioFiles: updatedAudioFiles,
                  }));

                  updatedLocalAudioFiles.push(...uniqueAudioFiles);
                  updatedLocalAudioFiles.sort(
                    (a, b) => a.indexInPlaylist - b.indexInPlaylist
                  );
                  setLocalAudioFiles(updatedLocalAudioFiles);
                }
              });

              setIsPlaylistDownloading(false);
            } catch (error) {
              setIsPlaylistDownloading(true);
              console.error("Error fetching data:", error);
              setIsUploadedAudioFile(true);
            }
          };

          fetchAllPartialPlaylistsParallel(id, totalCount, pageSize);

          //   const fetchAllPartialPlaylistsRecursive = (
          //     id,
          //     totalCount,
          //     pageSize,
          //     currentPage = 0
          //   ) => {
          //     const count = Math.min(
          //       pageSize,
          //       totalCount - currentPage * pageSize
          //     );
          //     if (count <= 0) {
          //       setIsPlaylistDownloading(false);
          //       return;
          //     }

          //     fetchPartialPlaylists(id, currentPage * pageSize, count)
          //       .then((response) => {
          //         fetchAllPartialPlaylistsRecursive(
          //           id,
          //           totalCount,
          //           pageSize,
          //           currentPage + 1
          //         );

          //         currentCount += response.audioFiles.length;
          //         console.log(currentCount + " / " + totalCount);

          //         if (response && Array.isArray(response.audioFiles)) {
          //           setLocalAudioFiles((prevAudioFiles) => [
          //             ...prevAudioFiles,
          //             ...response.audioFiles,
          //           ]);
          //           setLocalPlaylistData((prevPlaylistData) => ({
          //             ...prevPlaylistData,
          //             audioFiles: [
          //               ...prevPlaylistData.audioFiles,
          //               ...response.audioFiles,
          //             ],
          //           }));
          //           if (
          //             currentPlaylistId === -2 ||
          //             (isClickOnPlaylistPlayButton &&
          //               id !== currentPlaylistId &&
          //               response.audioFiles.length > 0) ||
          //             (isUploadedAudioFile && id === currentPlaylistId)
          //           ) {
          //             const updatedPlaylistData = {
          //               ...localPlaylistData,
          //               audioFiles: [
          //                 ...localPlaylistData.audioFiles,
          //                 ...response.audioFiles,
          //               ],
          //             };

          //             updatePlaylistMultiFetch(updatedPlaylistData);
          //           }

          //           if (
          //             isClickOnPlaylistPlayButton &&
          //             response.audioFiles[0].index === 0 &&
          //             id !== currentPlaylistId
          //           ) {
          //             setCurrentTrack({
          //               id: response.audioFiles[0].id,
          //               audioUrl: null,
          //               trackName: response.audioFiles[0].title,
          //               author: response.audioFiles[0].author,
          //               imageUrl: response.audioFiles[0].image
          //                 ? `data:image/jpeg;base64,${response.audioFiles[0].image.data}`
          //                 : "",
          //               duration: response.audioFiles[0].duration,
          //               index: response.audioFiles[0].index,
          //             });
          //             setCurrentPlaylistId(id);
          //             setCurrentTrackIndex(response.audioFiles[0].index);

          //             setIsClickOnPlaylistPlayButton(false);
          //           }
          //         }
          //       })
          //       .catch((error) => {
          //         setIsPlaylistDownloading(true);
          //         if (error.name === "AbortError") {
          //           console.log("Request aborted");
          //         } else {
          //           console.error("Error fetching data:", error);
          //         }
          //         setIsUploadedAudioFile(true);
          //       });
          //   };

          //   fetchAllPartialPlaylistsRecursive(id, totalCount, pageSize);
        })
        .then((secondResponse) => {
          if (!secondResponse) return;

          if (secondResponse.status === 403) {
            navigate("/auth/sign-in", { replace: true });
            return null;
          }
          return secondResponse.json();
        })
        .then((fetchedPlaylistData) => {
          return;
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

  const addAudiofileToFavorites = async (audioFile) => {
    setShowAudioFileMenu(false);

    if (playlistData.id === null) {
      const updatedPlaylistData = {
        ...playlistData,
        countOfAudio: playlistData.countOfAudio + 1,
        duration: playlistData.duration + audioFile.duration,
        audioFiles: [audioFile, ...playlistData.audioFiles],
      };

      const currentTrackId = currentTrack ? currentTrack.id : null;
      const newCurrentTrackIndex = updatedPlaylistData.audioFiles.findIndex(
        (file) => file.id === currentTrackId
      );

      if (!isDragDroped && currentPlaylistId !== -2) {
        setIsDragDroped(true);
      }
      setCurrentTrackIndex(newCurrentTrackIndex);

      updatePlaylist(updatedPlaylistData);
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/favorites/audioFiles/add/${audioFile.id}`,
        {
          headers: {
            Authorization: `Bearer ${AuthService.getAuthToken()}`,
          },
          method: "POST",
        }
      );

      if (response.status === 500) {
        throw new Error("Error adding audio file to favorites");
      }

      if (response.status === 409) {
        console.error("AudioFile is already in favorites");
      }
    } catch (error) {
      console.error("Error adding audio file to favorites:", error);
      setIsDeleting(false);
    }
  };

  const deleteFromPlaylist = async (audioFile) => {
    // console.log(audioFile.id);
    setIsDeleting(true);
    setShowAudioFileMenu(false);

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
        isFavoriteAudioFiles
          ? `http://localhost:8080/api/favorites/audioFiles/delete/${audioFile.id}`
          : `http://localhost:8080/api/playlists/${id}/delete/${audioFile.id}`,
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
          isFavoriteAudioFiles
            ? `http://localhost:8080/api/favorites/audioFiles/update`
            : `http://localhost:8080/api/playlists/${id}/update`,
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

  // if (playlistId === -1) {
  //   navigate(`/playlists/${id}`)
  // }

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

  function truncateText(text, containerWidth, maxWidthPercentage) {
    const words = text.split(" ");
    const span = document.createElement("span");
    span.style.visibility = "hidden";
    span.style.position = "absolute";
    span.style.whiteSpace = "nowrap";

    document.body.appendChild(span);

    let truncatedText = "";
    let truncatedWidth = 0;
    let isTruncated = false;

    for (const word of words) {
      span.textContent = truncatedText + " " + word;
      const wordWidth = span.offsetWidth - truncatedWidth;

      if (
        truncatedWidth + wordWidth <=
        (containerWidth * maxWidthPercentage) / 100
      ) {
        truncatedText += " " + word;
        truncatedWidth += wordWidth;
      } else {
        isTruncated = true;
        break;
      }
    }

    document.body.removeChild(span);

    return isTruncated ? truncatedText.trim() + "..." : truncatedText.trim();
  }

  const handleEditPlaylistNameClick = () => {
    setIsEditingPlaylistName(true);
    setTimeout(() => {
      inputPlaylistNameRef.current.focus();
    }, 1);
  };

  const handleInputPlaylistNameChange = (e) => {
    if (e.target.value.length === 0) {
      setPlaylistNameAvailableMessage("Заполните поле");
    } else {
      setPlaylistNameAvailableMessage("");
    }
    setPlaylistName(e.target.value);
  };

  const handleUpdatePlaylistName = () => {
    if (localPlaylistData.name === playlistName) {
      setIsEditingPlaylistName(false);
      return;
    }

    if (playlistName.length === 0) {
      setPlaylistNameAvailableMessage("Заполните поле");
      return;
    }

    const formData = new FormData();
    formData.append("newPlaylistName", playlistName);

    fetch(`http://localhost:8080/api/playlists/${id}/edit/name`, {
      headers: {
        Authorization: `Bearer ${AuthService.getAuthToken()}`,
      },
      method: "PUT",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          setIsEditingPlaylistName(false);
          setLocalPlaylistData((prevLocalPlaylistData) => ({
            ...prevLocalPlaylistData,
            name: playlistName,
          }));
          setPlaylistNameAvailableMessage("");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const cancelEditPlaylistName = () => {
    setIsEditingPlaylistName(false);
    setPlaylistName(localPlaylistData.name);
    setPlaylistNameAvailableMessage("");
  };

  const handleEscapeKeyPress = (event) => {
    if (event.key === "Escape") {
      setIsEditingPlaylistName(false);
      setShowAudioFileMenu(false);
    }
  };

  return (
    <>
      {isAuthenticated && (
        // isValidToken
        <div
          className={`audio-list-container ${
            !isFavoriteAudioFiles ? "" : "favorite"
          }`}
          ref={audioListContainerRef}
        >
          {!isFavoriteAudioFiles && (
            <div
              className="playlist-info"
              onMouseLeave={() => {
                setIsShowImageMenu(false);
                cancelEditPlaylistName();
              }}
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
                      <div
                        className="playlist-name-container"
                        onKeyDown={handleEscapeKeyPress}
                      >
                        {isEditingPlaylistName ? (
                          <>
                            <input
                              type="text"
                              ref={inputPlaylistNameRef}
                              value={playlistName}
                              onChange={handleInputPlaylistNameChange}
                            />
                            <span className="error-message">
                              {playlistNameAvailableMessage}
                            </span>
                            <button
                              className="save-playlist-name-button"
                              onClick={handleUpdatePlaylistName}
                            >
                              Сохранить
                            </button>
                            <button
                              className="cancel-editing-button"
                              id="cancel-editing-button"
                              onClick={cancelEditPlaylistName}
                            >
                              X
                            </button>
                          </>
                        ) : (
                          <>
                            <h2>{localPlaylistData.name}</h2>
                            {isAdminRole && (
                              <button
                                className="editing-button"
                                onClick={handleEditPlaylistNameClick}
                              >
                                <img
                                  className="edit-icon"
                                  id="edit-icon"
                                  src="/edit-icon.png"
                                  alt="edit"
                                />
                              </button>
                            )}
                            <Tooltip
                              anchorSelect="#edit-icon"
                              className="tooltip-class"
                              delayShow={200}
                            >
                              <span>Изменить название</span>
                            </Tooltip>
                          </>
                        )}
                      </div>

                      <p className="count-of-audio-and-duration">
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
                {
                  // !isPlaylistDownloading &&
                  isAdminRole && (
                    <div className="add-audio-button-container">
                      <Link to={`/playlists/${id}/upload`}>
                        <button className="add-audio-button">
                          Добавить трек
                        </button>
                      </Link>
                    </div>
                  )
                }
              </div>
            </div>
          )}
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
                  {!isPlaylistDownloading && (
                    <div className="playlist-header">
                      <div
                        className="header-item"
                        style={{
                          width: "26.4%",
                          minWidth: "150px",
                          marginLeft: "108px",
                        }}
                      >
                        Название
                      </div>
                      <div
                        className="header-item"
                        style={{ width: "24.8%", marginLeft: "3.5%" }}
                      >
                        Альбом
                      </div>
                      <div
                        className="header-item"
                        style={{ width: "10.3%", marginLeft: "45px" }}
                      >
                        Прослушивания
                      </div>
                      <div
                        className="header-item"
                        style={{ marginLeft: "14.4%" }}
                      >
                        Время
                      </div>
                    </div>
                  )}

                  <ul>
                    {Array.isArray(localAudioFiles) &&
                      localPlaylistData.audioFiles.map((audioFile, index) => (
                        <Draggable
                          key={audioFile.id}
                          draggableId={audioFile.id}
                          index={index}
                          isDragDisabled={
                            !isAdminRole && !isFavoriteAudioFiles
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
                              onClick={() => {
                                if (showAudioFileMenu) {
                                  setShowAudioFileMenu(false);
                                }
                              }}
                              onKeyDown={handleEscapeKeyPress}
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
                                    onClick={() => {
                                      // setCurrentPlaylistId(id);
                                      handlePlayAudio(audioFile, index);
                                    }}
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
                                    {truncateText(audioFile.title, 1350, 20)}
                                  </span>
                                  <span className="author">
                                    {audioFile.author}
                                  </span>
                                </div>

                                <div className="album-container">
                                  <span className="album">Альбом</span>
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

                                <div className="audio-file-menu-button-container">
                                  {showAudioFileMenu &&
                                    hoveredIndex === index && (
                                      <div className="audio-file-menu">
                                        {!isFavoriteAudioFiles && (
                                          <div
                                            className="audio-file-menu-item"
                                            onClick={() => {
                                              addAudiofileToFavorites(
                                                audioFile
                                              );
                                            }}
                                          >
                                            Добавить в избранное
                                          </div>
                                        )}
                                        {(isFavoriteAudioFiles ||
                                          localPlaylistData.playlistOwnerRole ===
                                            "USER" ||
                                          isAdminRole) && (
                                          <div
                                            className="audio-file-menu-item"
                                            onClick={() =>
                                              deleteFromPlaylist(audioFile)
                                            }
                                          >
                                            {isFavoriteAudioFiles
                                              ? "Удалить из избранных"
                                              : localPlaylistData.playlistOwnerRole ===
                                                  "USER" || isAdminRole
                                              ? "Удалить из плейлиста"
                                              : ""}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  {hoveredIndex === index ? (
                                    <button
                                      className="audio-file-menu-button"
                                      id="audio-file-menu-button"
                                      onClick={() =>
                                        setShowAudioFileMenu(!showAudioFileMenu)
                                      }
                                    >
                                      ...
                                    </button>
                                  ) : (
                                    <div className="audio-file-menu-button"></div>
                                  )}
                                  {!isUpdating && !showAudioFileMenu && (
                                    <Tooltip
                                      anchorSelect="#audio-file-menu-button"
                                      className="tooltip-class"
                                      delayShow={200}
                                      style={{ marginTop: "30px" }}
                                    >
                                      <span id="title-audio-file-menu-button">
                                        Меню
                                      </span>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                    {Array.from(
                      {
                        length:
                          localPlaylistData.countOfAudio -
                          localPlaylistData.audioFiles.length,
                      },
                      (_, index) => (
                        <li key={`empty-${index}`} className="li-item">
                          <div className="audio-metadata-container">
                            <div className="alt-img"></div>
                          </div>
                        </li>
                      )
                    )}
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
