import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAudioContext } from "../AudioContext";
import "./AudioControls.css";

const AudioControls = () => {
  // const { id } = useParams();

  const {
    currentTrack,
    isPlaying,
    togglePlay,
    volume,
    audioRef,
    setVolume,
    debouncedPlayNextTrack,
    debouncedPlayPreviousTrack,
    currentTrackIndex,
    playlistData,
    // currentPlaylistId,
    // setCurrentPlaylistId,
    playlistId,
    setPlaylistId,
  } = useAudioContext();
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const prevAudioUrl = useRef(null);

  // useEffect(() => {
  //   // Запрос и обновление данных выполняются только при начале воспроизведения аудио
  //   if (currentTrackIndex !== -1 && playlistId !== id) {
  //     // Если текущий плейлист изменился, но воспроизведение не начато
  //     setPlaylistId(id); // Обновляем текущий плейлист
  //   }
  // }, [currentTrackIndex, playlistId, id]);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(audioRef.current.currentTime);
    };

    const interval = setInterval(updateTime, 100); // Обновляем текущее время каждые 100 миллисекунд

    return () => clearInterval(interval);
  }, [audioRef]);

  useEffect(() => {
    if (currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
    }
  }, [currentTrack]);

  const handleTogglePlay = () => {
    if (currentTrackIndex !== -1) {
      if (isPlaying) {
        audioRef.current.pause(); 
      } else {
        audioRef.current.play(); 
      }
      togglePlay();
    }
  };

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const handleAudioEnded = () => {
      // Проверяем, является ли текущий трек последним в списке треков
      if (
        playlistData &&
        playlistData.audioFiles &&
        currentTrackIndex === playlistData.audioFiles.length - 1
      ) {
        togglePlay();
      } else {
        debouncedPlayNextTrack();
        console.log("next " + currentTrackIndex);
      }
    };

    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.addEventListener("ended", handleAudioEnded);

      return () => {
        audioElement.removeEventListener("ended", handleAudioEnded);
      };
    }
    // audioRef.current.addEventListener("ended", handleAudioEnded);

    // return () => {
    //   audioRef.current.removeEventListener("ended", handleAudioEnded);
    // };
  }, [
    debouncedPlayNextTrack,
    togglePlay,
    audioRef,
    currentTrackIndex,
    playlistData,
  ]);

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

  const handleTimeChange = (e) => {
    const newTime = e.target.value * currentTrack.duration;
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
    audioRef.current.pause(); // При начале перемотки останавливаем аудио
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
    if (isPlaying) {
      audioRef.current.play(); // Если аудио было воспроизведено до перемотки, возобновляем воспроизведение после перемотки
    }
  };
  return (
    <div className="audio-controls">
      <div className="custom-controls">
        <div className="meta-data">
          {currentTrack ? (
            <>
              <img
                id="audioImage2"
                src={currentTrack.imageUrl}
                alt={currentTrack.trackName}
              />
              <div className="title-author">
                <span className="title">{currentTrack.trackName}</span>
                <span className="author">{currentTrack.author}</span>
              </div>
            </>
          ) : (
            <>
              <img id="audioImage2" src="note.png" alt="Track" />
              <div className="title-author">
                <span className="title">Track Name</span>
                <span className="author">Author</span>
              </div>
            </>
          )}
        </div>
        <div className="controls-container">
          <button
            className="previous"
            onClick={debouncedPlayPreviousTrack}
            disabled={currentTrackIndex === 0}
          >
            <i className="fas fa-backward"></i>
          </button>
          <button className="play-pause" onClick={handleTogglePlay}>
            {currentTrackIndex !== -1 && isPlaying ? "||" : ">"}
          </button>
          <button
            className="next"
            onClick={debouncedPlayNextTrack}
            disabled={currentTrackIndex === -1}
          >
            <i className="fas fa-forward"></i>
          </button>
        </div>
        <div className="timeline-container">
          <div className="current-time">
            <span>{currentTrack ? formatDuration(currentTime) : "0:00"}</span>
          </div>
          <audio
            id="customAudioPlayer"
            // controls
            ref={audioRef}
            autoPlay={isPlaying}
            type="audio/mpeg"
          >
            Your browser does not support the audio element.
          </audio>
          {currentTrack ? (
            <div className="custom-timeline">
              <input
                className="input-timeline"
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={currentTrack ? currentTime / currentTrack.duration : 0}
                onChange={handleTimeChange}
                onMouseDown={handleSeekStart}
                onMouseUp={handleSeekEnd}
              />
            </div>
          ) : (
            <div className="custom-timeline">
              <input
                className="input-timeline"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={currentTrack ? currentTime / currentTrack.duration : 0}
              />
            </div>
          )}

          <div className="duration">
            <span>
              {currentTrack ? formatDuration(currentTrack.duration) : "0:00"}
            </span>
          </div>
        </div>
        <div className="volume-container">
          <input
            className="volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioControls;
