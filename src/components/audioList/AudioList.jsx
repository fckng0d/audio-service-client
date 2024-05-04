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
import ImageService from "../../services/ImageService";
import { useAuthContext } from "../../auth/AuthContext";

const AudioList = ({ isFavoriteAudioFiles }) => {
  AudioList.propTypes = {
    isFavoriteAudioFiles: PropTypes.bool,
  };

  const apiUrl = process.env.REACT_APP_REST_API_URL;

  const navigate = useNavigate();

  const {
    isAuthenticated,
    setIsAuthenticated,
    isValidToken,
    setIsValidToken,
    isAdminRole,
    setIsAdminRole,
  } = useAuthContext();

  const {
    setLastStateKey,
    openFromPlaylistContainerId,
    setOpenFromPlaylistContainerId,
  } = useHistoryContext();

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
    resetAudioContext,
    isFetchingAudioFile,
    setPlaylistData,
    currentTime,
    setIsUpdatePlaylistName,
  } = useAudioContext();

  // из-за бага обновления состояния контекста
  useEffect(() => {
    // console.log(isAdminRole);
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

  let isComponentUnmounted = false;

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

      isComponentUnmounted = true;
      clearLocalPlaylist();
      setToCurrentPlaylistId(-5);
      // setPlaylistId(-5);
      // setPlaylistId(id);

      setIsClickOnPlaylistPlayButton(false);
    };
  }, [id]);

  useEffect(() => {
    if (
      isClickOnPlaylistPlayButton &&
      id !== currentPlaylistId &&
      localAudioFiles.length > 0
    ) {
      handlePlayAudio(localAudioFiles[0], 0, true);
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

    if (id === currentPlaylistId || (currentPlaylistId === -10 && !id)) {
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
      !isUploadedAudioFile
    ) {
      prevCurrentPlaylistIdRef.current = currentPlaylistId;

      clearLocalPlaylist();

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsPlaylistDownloading(true);

      let isAborted = false;

      fetch(
        isFavoriteAudioFiles && !id
          ? `${apiUrl}/api/favorites/audioFiles`
          : `${apiUrl}/api/playlists/${id}`,
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
                    // throw new Error("Request aborted");
                    return;
                    // if (abortControllerRef.current.signal.aborted) {
                    //   console.log("Request aborted:", error);
                    //   return null;
                    // } else {
                    //   return;
                    // }
                  }
                })
              );

              const updatedAudioFiles = [...localPlaylistData.audioFiles];
              const updatedLocalAudioFiles = [...localAudioFiles];

              if (!isAborted) {
                responses.forEach((response) => {
                  if (isComponentUnmounted) {
                    setIsPlaylistDownloading(false);
                    return;
                  }
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

                    if (isComponentUnmounted) {
                      setIsPlaylistDownloading(false);
                      return;
                    }
                    setLocalPlaylistData((prevPlaylistData) => ({
                      ...prevPlaylistData,
                      audioFiles: updatedAudioFiles,
                    }));

                    updatedLocalAudioFiles.push(...uniqueAudioFiles);
                    updatedLocalAudioFiles.sort(
                      (a, b) => a.indexInPlaylist - b.indexInPlaylist
                    );
                    if (isComponentUnmounted) {
                      setIsPlaylistDownloading(false);
                      return;
                    }
                    setLocalAudioFiles(updatedLocalAudioFiles);
                  }
                });

                // if (
                //   id === currentPlaylistId ||
                //   (currentPlaylistId === -10 && !id) ||
                //   currentPlaylistId !== -2
                // ) {
                //   setLocalPlaylistData(playlistData);
                //   setLocalAudioFiles(playlistData.audioFiles);
                // }
              }

              setIsPlaylistDownloading(false);
            } catch (error) {
              setIsPlaylistDownloading(true);
              console.error("Error fetching data:", error);
              setIsUploadedAudioFile(true);
            }
          };

          fetchAllPartialPlaylistsParallel(id, totalCount, pageSize);
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

    const addAudioFileRequest = fetch(
      `${apiUrl}/api/favorites/audioFiles/add/${audioFile.id}`,
      {
        headers: {
          Authorization: `Bearer ${AuthService.getAuthToken()}`,
        },
        method: "POST",
      }
    );

    if (playlistData.id === null) {
      // if (playlistData.audioFiles.some((file) => file.id === audioFile.id)) {
      //   return;
      // }

      const filteredAudioFiles = playlistData.audioFiles.filter(
        (file) => file.id !== audioFile.id
      );

      const updatedAudioFiles = [audioFile, ...filteredAudioFiles];

      for (let i = 0; i < updatedAudioFiles.length; i++) {
        updatedAudioFiles[i].indexInPlaylist = i;
      }

      let countOfAudioIncrement = 1;
      let audioDuration = audioFile.duration;
      if (playlistData.audioFiles.some((file) => file.id === audioFile.id)) {
        countOfAudioIncrement = 0;
        audioDuration = 0;
      }

      const updatedPlaylistData = {
        ...playlistData,
        countOfAudio: playlistData.countOfAudio + countOfAudioIncrement,
        duration: playlistData.duration + audioDuration,
        audioFiles: updatedAudioFiles,
      };

      if (currentPlaylistId === -10) {
        updatePlaylist(updatedPlaylistData);
      }

      const currentTrackId = currentTrack ? currentTrack.id : null;
      const newCurrentTrackIndex = updatedPlaylistData.audioFiles.findIndex(
        (file) => file.id === currentTrackId
      );

      if (!isDragDroped && currentPlaylistId !== -2) {
        setIsDragDroped(false);
      }
      setCurrentTrackIndex(newCurrentTrackIndex);
    }

    try {
      const response = await addAudioFileRequest;

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

    for (let i = 0; i < updatedLocalAudioFiles.length; i++) {
      updatedLocalAudioFiles[i].indexInPlaylist = i;
    }

    const updatedLocalPlaylistData = {
      ...localPlaylistData,
      countOfAudio: localPlaylistData.countOfAudio - 1,
      duration: localPlaylistData.duration - audioFile.duration,
      audioFiles: updatedLocalAudioFiles,
    };

    // setIsDragDroped(true);

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

    if (id === currentPlaylistId || (currentPlaylistId === -10 && !id)) {
      if (newCurrentTrackIndex === -1) {
        setCurrentTrackIndex(-1);
        // setCurrentTrackIndex(currentTrackIndex);
        setCurrentTrack(null);
        // setCurrentPlaylistId(-2);
        setIsDragDroped(false);
        audioRef.current.pause();
      } else {
        setCurrentTrackIndex(newCurrentTrackIndex);
      }

      if (
        !isDragDroped &&
        currentPlaylistId !== -2 &&
        newCurrentTrackIndex !== -1
      ) {
        setIsDragDroped(true);
      }

      updatePlaylist(updatedLocalPlaylistData);
    }

    try {
      const response = await fetch(
        isFavoriteAudioFiles
          ? `${apiUrl}/api/favorites/audioFiles/delete/${audioFile.id}`
          : `${apiUrl}/api/playlists/${id}/delete/${audioFile.id}`,
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

  const dragAbortControllerRef = useRef(new AbortController());

  const handleDragEnd = (result) => {
    setIsDragging(false);
    setDraggingItemId(null);

    dragAbortControllerRef.current.abort();

    const dragAbortController = new AbortController();
    dragAbortControllerRef.current = dragAbortController;

    if (
      !result.destination ||
      result.source.index === result.destination.index
      // && (id === currentPlaylistId || (currentPlaylistId === -10 && !id))
    ) {
      setIsUpdating(false);
      return;
    }

    const reorderedAudioFiles = Array.from(localAudioFiles).map(
      (file, index) => ({
        ...file,
        indexInPlaylist: index,
      })
    );

    const [reorderedItem] = reorderedAudioFiles.splice(result.source.index, 1);
    reorderedAudioFiles.splice(result.destination.index, 0, reorderedItem);

    for (let i = 0; i < reorderedAudioFiles.length; i++) {
      reorderedAudioFiles[i].indexInPlaylist = i;
    }

    const updatedPlaylistData = {
      ...localPlaylistData,
      audioFiles: reorderedAudioFiles,
    };

    setLocalPlaylistData(updatedPlaylistData);
    setLocalAudioFiles(reorderedAudioFiles);

    if (id === currentPlaylistId || (currentPlaylistId === -10 && !id)) {
      updatePlaylist(updatedPlaylistData);
    }

    setIsDragDroped(true);

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
      if (
        currentPlaylistId !== -2 &&
        (id === currentPlaylistId || (currentPlaylistId === -10 && !id))
      ) {
        setCurrentTrackIndex(newCurrentTrackIndex);
      } else {
        setIsDragDroped(false);
      }

      if (!isDragDroped && currentPlaylistId !== -2) {
        setIsDragDroped(true);
      }
    }

    updateAudioFiles(id, reorderedAudioFiles);
  };

  const updateAudioFiles = async (id, updatedAudioFiles) => {
    try {
      const response = await fetch(
        isFavoriteAudioFiles
          ? `${apiUrl}/api/favorites/audioFiles/update`
          : `${apiUrl}/api/playlists/${id}/update`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AuthService.getAuthToken()}`,
          },
          method: "PUT",
          body: JSON.stringify(updatedAudioFiles),
          signal: dragAbortControllerRef.current.signal,
        }
      );

      setIsUpdating(false);

      if (!response.ok) {
        throw new Error("Failed to update playlist");
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        setIsUpdating(false);
        console.error("Error updating playlist:", error);
        throw error;
      }
    }
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
    let selectedFile = event.target.files[0];
    if (selectedFile && selectedFile instanceof File) {
      const fileInput = event.target;
      const timestamp = new Date().getTime();
      const uniqueFilename = `${selectedFile.name}_${timestamp}`;
      selectedFile = new File([selectedFile], uniqueFilename, {
        type: selectedFile.type,
      });

      const maxSizeKB = 1024;
      ImageService.compressImage(selectedFile, maxSizeKB)
        .then((compressedFile) => {
          uploadPlaylistImage(compressedFile);
        })
        .catch((error) => {
          console.error("Ошибка при сжатии изображения:", error);
        });
      fileInput.value = "";
    }
  };

  const uploadPlaylistImage = (playlistImage) => {
    const formData = new FormData();
    formData.append("playlistImage", playlistImage);

    fetch(`${apiUrl}/api/playlists/${id}/image/update`, {
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
    validatePlaylistName(e.target.value);
    setPlaylistName(e.target.value);
  };

  const validatePlaylistName = (playlistName) => {
    if (playlistName.length === 0) {
      setPlaylistNameAvailableMessage("Заполните поле");
      return false;
    } else if (playlistName.length < 3 || playlistName.length > 50) {
      setPlaylistNameAvailableMessage(
        "Название плейлиста должно содержать от 3 до 50 символов"
      );
      return false;
    } else {
      setPlaylistNameAvailableMessage("");
      return true;
    }
  };

  const handleUpdatePlaylistName = () => {
    if (localPlaylistData.name === playlistName) {
      setIsEditingPlaylistName(false);
      return;
    }

    if (validatePlaylistName(playlistName)) {
      const formData = new FormData();
      formData.append("newPlaylistName", playlistName.trim());

      fetch(`${apiUrl}/api/playlists/${id}/edit/name`, {
        headers: {
          Authorization: `Bearer ${AuthService.getAuthToken()}`,
        },
        method: "PUT",
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            setIsEditingPlaylistName(false);

            const newPlaylistData = {
              ...localPlaylistData,
              name: playlistName.trim(),
            };

            setLocalPlaylistData(newPlaylistData);

            if (id === playlistData.id) {
              setIsUpdatePlaylistName(true);
              setPlaylistData(newPlaylistData);
            }

            setPlaylistNameAvailableMessage("");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const cancelEditPlaylistName = () => {
    setIsEditingPlaylistName(false);
    setPlaylistName(localPlaylistData.name);
    setPlaylistNameAvailableMessage("");
  };

  const handleKeyPress = (event) => {
    handleEscapeKeyPress(event);
    handleEnterKeyPress(event);
  };

  const handleEscapeKeyPress = (event) => {
    if (event.key === "Escape") {
      setIsEditingPlaylistName(false);
      setShowAudioFileMenu(false);
    }
  };

  const handleEnterKeyPress = (event) => {
    if (event.key === "Enter") {
      handleUpdatePlaylistName();
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (playlistData.id === playlistId) {
      resetAudioContext();
      document.title = "Audio Service";
    }

    try {
      const response = await fetch(
        localPlaylistData.playlistOwnerRole === "USER"
          ? `${apiUrl}/api/favorites/playlists/delete/${playlistId}`
          : `${apiUrl}/api/playlists/delete/${playlistId}`,
        {
          headers: {
            Authorization: `Bearer ${AuthService.getAuthToken()}`,
          },
          method: "DELETE",
        }
      );

      if (response.status === 500) {
        throw new Error("Error deleting playlist from favorites");
      }

      if (localPlaylistData.playlistOwnerRole === "USER") {
        navigate("/favorites/playlists", { replace: true });
      } else {
        if (openFromPlaylistContainerId) {
          navigate(`/sections/${openFromPlaylistContainerId}`, {
            replace: true,
          });
        } else {
          navigate(`/`, { replace: true });
        }
      }
    } catch (error) {}
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
                {(isAdminRole ||
                  localPlaylistData.playlistOwnerRole === "USER") &&
                  localPlaylistData.image && (
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

              {(isAdminRole ||
                localPlaylistData.playlistOwnerRole === "USER") &&
                isShowImageMenu && (
                  <div className="playlist-image-menu">
                    <div
                      className="playlist-image-menu-item"
                      onClick={openFilePicker}
                    >
                      Загрузить фото
                    </div>
                  </div>
                )}
              {(isAdminRole ||
                localPlaylistData.playlistOwnerRole === "USER") && (
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept="image/*"
                />
              )}
              <div className="playlist-details">
                {localPlaylistData.name &&
                  (localPlaylistData.countOfAudio ||
                    localPlaylistData.countOfAudio === 0) && (
                    <>
                      <div
                        className="playlist-name-container"
                        onKeyDown={handleKeyPress}
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
                            {(isAdminRole ||
                              localPlaylistData.playlistOwnerRole ===
                                "USER") && (
                              <button
                                className="editing-button"
                                onClick={handleEditPlaylistNameClick}
                              >
                                <img
                                  className="edit-icon"
                                  id="edit-icon"
                                  src="/image/edit-icon.png"
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
                <div style={{ display: "flex", flexDirection: "row" }}>
                  {isAdminRole &&
                    localPlaylistData.playlistOwnerRole === "PUBLIC" && (
                      <div
                        className="add-audio-button-container"
                        style={{ marginRight: "20px" }}
                      >
                        <Link to={`/playlists/${id}/upload`}>
                          <button className="add-audio-button">
                            Добавить трек
                          </button>
                        </Link>
                      </div>
                    )}
                  {(isAdminRole ||
                    localPlaylistData.playlistOwnerRole === "USER") && (
                    <div className="add-audio-button-container">
                      <button
                        className="add-audio-button"
                        onClick={() => deletePlaylist(localPlaylistData.id)}
                      >
                        Удалить плейлист
                      </button>
                    </div>
                  )}
                </div>
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
                    {Array.isArray(localPlaylistData.audioFiles) &&
                      localPlaylistData.audioFiles.map((audioFile, index) => (
                        <Draggable
                          key={audioFile.id}
                          draggableId={audioFile.id}
                          index={index}
                          isDragDisabled={
                            (!isAdminRole && !isFavoriteAudioFiles) ||
                            isFetchingAudioFile
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
                                      handlePlayAudio(audioFile, index, true);
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
                                        {localPlaylistData &&
                                          (isFavoriteAudioFiles ||
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
                                        Действия
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
