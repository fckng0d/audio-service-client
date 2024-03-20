import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAudioContext } from "../AudioContext";
import { Link } from "react-router-dom";
import "./AudioList.css";

const AudioList = () => {
  const { id } = useParams();

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
    playlistData,
    localPlaylistData,
    setLocalPlaylistData,
    clearLocalPlaylist,
  } = useAudioContext();

  useEffect(() => {
    if (id !== playlistId) {
      setPlaylistId(id);
    }
  }, [id]);

  useEffect(() => {
    if (id && typeof id === "string" && playlistId !== currentPlaylistId) {
      clearLocalPlaylist();

      fetch(`http://localhost:8080/api/playlists/${id}`, { method: "GET" })
        .then((response) => response.json())
        .then((fetchedPlaylistData) => {
          setLocalAudioFiles(
            Array.isArray(fetchedPlaylistData.audioFiles)
              ? fetchedPlaylistData.audioFiles
              : []
          );
          setLocalPlaylistData(fetchedPlaylistData);
          if (currentPlaylistId === -2) {
            updatePlaylist(fetchedPlaylistData);
          }
        })
        .catch((error) => console.error("Error fetching data:", error));
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
    console.log("handlePlayAudio:\n\ncurrentPlaylistId = " + currentPlaylistId);
    if (
      currentTrackIndex === index &&
      playlistId === currentPlaylistId &&
      currentPlaylistId
    ) {
      handleTogglePlay();
    } else {
      try {
        setCurrentPlaylistId(playlistId);

        updatePlaylist(localPlaylistData);

        const audioData = URL.createObjectURL(new Blob([audioFile.data]));

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

  const getTotalDuration = () => {
    const minutes = Math.floor(localPlaylistData.duration / 60);

    return minutes;
  };

  return (
    <div className="audio-list-container">
      <div className="playlist-info">
        <h2>
          {localPlaylistData.name}
          <Link to={`/playlists/${id}/upload`}>
            <button className="add-button">
              <span>+</span>
            </button>
          </Link>
        </h2>
        <p>
          {localPlaylistData.countOfAudio}{" "}
          {localPlaylistData.countOfAudio === 1
            ? "песня"
            : localPlaylistData.countOfAudio < 5 &&
              localPlaylistData.countOfAudio !== 0
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
