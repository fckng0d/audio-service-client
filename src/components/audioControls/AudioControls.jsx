import React, { useEffect, useRef, useState } from "react";
import { useAudioContext } from "../AudioContext";
import "./AudioControls.css";
import { Tooltip } from "react-tooltip";
import { useAuthContext } from "../../auth/AuthContext";
import { useHistoryContext } from "../../App";
import AuthService from "../../services/AuthService";

const apiUrl = process.env.REACT_APP_REST_API_URL;

const AudioControls = () => {
  const { isAuthenticated } = useAuthContext();

  const { isAuthFormOpen } = useHistoryContext();

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
    playlistSize,
    playlistId,
    currentPlaylistId,
    localAudioFiles,
    handlePlayAudio,
    toCurrentPlaylistId,
    isFetchingAudioFile,
    setIsFetchingAudioFile,
    currentTime,
    setCurrentTime,
  } = useAudioContext();

  // const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [savedVolume, setSavedVolume] = useState(1);
  const [isSoundOn, setIsSoundOn] = useState(true);

  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
  const [repeatableMode, setRepeatableMode] = useState(0);

  const [isUpdatedCountOfAudiotions, setIsUpdatedCountOfAudiotions] =
    useState(false);

  const prevAudioUrl = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(audioRef.current.currentTime);
    };

    const interval = setInterval(updateTime, 100);

    return () => clearInterval(interval);
  }, [audioRef]);

  useEffect(() => {
    if (currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
    }
  }, [currentTrack]);

  const handleTogglePlay = () => {
    if (
      toCurrentPlaylistId !== -5 &&
      currentPlaylistId === -2 &&
      currentTrackIndex === -1 &&
      localAudioFiles.length >= 1
    ) {
      handlePlayAudio(localAudioFiles[0], 0, true);
    }

    if (currentTrackIndex !== -1) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioPlay();
      }
      togglePlay();
    }
  };

  useEffect(() => {
    let shouldContinueExecution = true;

    const handleNextTrack = () => {
      if (!isSeeking && shouldContinueExecution) {
        if (
          isPlaying &&
          currentTrack &&
          currentTrack.duration &&
          // formatDuration(currentTime) === formatDuration(currentTrack.duration)
          currentTime > currentTrack.duration - 0.5 &&
          audioRef.current &&
          currentTrack
        ) {
          shouldContinueExecution = false;
          if (
            currentTrackIndex === playlistSize - 1 &&
            isPlaying &&
            repeatableMode !== 2
          ) {
            if (repeatableMode === 0) {
              togglePlay();
            } else if (repeatableMode === 1) {
              // setTimeout(() => {
              handlePlayAudio(playlistData.audioFiles[0], 0, false);
              audioRef.current.currentTime = 0;
              // }, 100);
            }
          } else {
            if (repeatableMode === 2) {
              // setTimeout(() => {
              audioPlay();
              // }, 100);
            } else {
              // setTimeout(() => {
              debouncedPlayNextTrack();
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
              // }, 100);
            }
          }
        }
      }

      if (shouldContinueExecution) {
        setTimeout(handleNextTrack, 100);
      }
    };

    handleNextTrack();

    return () => {
      shouldContinueExecution = false;
    };
  }, [currentTime, isSeeking]);

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
    if (!currentTrack) return;

    const newTime = e.target.value * currentTrack.duration;
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  };

  const handleSeekStart = () => {
    if (!isSeeking && audioRef.current && currentTrack) {
      setIsSeeking(true);
      audioRef.current.pause();
    }
  };

  const handleSeekEnd = () => {
    // setTimeout(() => {
    if (isSeeking) {
      setIsSeeking(false);
      if (isPlaying && currentTime < currentTrack.duration - 0.5) {
        try {
          audioPlay();
        } catch (error) {
          console.error("Failed to play audio:", error);
        }
      }
    }
    // }, 200);
  };

  const audioPlay = () => {
    const waitForAudioRef = async () => {
      while (!audioRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    };

    waitForAudioRef().then(() => {
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          //
        });
      }
    });
  };

  useEffect(() => {
    if (isDraggingVolume) {
      if (volume == 0) {
        setIsSoundOn(false);
        setSavedVolume(0.5);
      } else {
        setSavedVolume(volume);
        setIsSoundOn(true);
      }

      audioRef.current.volume = volume;
    }
  }, [volume, isDraggingVolume]);

  const renderVolumeIcon = (volume) => {
    const barsCount = 5;
    const range = 1 / barsCount;
    let currentBarsCount = 0;

    for (let i = 1; i <= barsCount; i++) {
      if (volume == 0) {
        currentBarsCount = 0;
        break;
      }

      if (volume >= range * (i - 1) && volume <= range * i) {
        currentBarsCount = i;
        break;
      }
    }

    const bars = [];
    for (let i = 0; i < barsCount; i++) {
      const height = 3 + i * 3;
      const barAngle =
        i === 0 ? 90 : i === 1 ? 50 : i === 2 ? 30 : i === 3 ? 20 : 17;
      bars.push(
        <div
          key={i}
          className="volume-bar"
          style={{
            height: `${i === 2 ? 9 : height}px`,
            opacity: i < currentBarsCount ? 1 : 0.2,
            clipPath: `polygon(100% 0%, 0% ${barAngle}%, 0% 100%, 100% 100%)`,
          }}
        />
      );
    }
    return (
      <div className="volume-bars">
        {bars}
        {volume == 0 && <span color="white">x</span>}
      </div>
    );
  };

  const switchSound = () => {
    if (isSoundOn) {
      audioRef.current.volume = 0;
      setVolume(0);
      setIsSoundOn(false);
    } else {
      audioRef.current.volume = savedVolume;
      setVolume(savedVolume);
      setIsSoundOn(true);
    }
  };

  useEffect(() => {
    if (currentTrack && currentTime && !isUpdatedCountOfAudiotions) {
      const percentage = (currentTime / currentTrack.duration) * 100;

      if (percentage >= 60) {
        setIsUpdatedCountOfAudiotions(true);
        fetch(
          `${apiUrl}/api/audio/${currentTrack.id}/incrementCountOfAuditions`,
          {
            headers: {
              Authorization: `Bearer ${AuthService.getAuthToken()}`,
            },
            method: "PUT",
          }
        )
          .then((response) => {})
          .catch((error) => {});
      }
    }
  }, [currentTime]);

  useEffect(() => {
    setIsUpdatedCountOfAudiotions(false);
  }, [currentTrack]);

  return (
    <div className="audio-controls">
      <div className={`custom-controls ${!isAuthenticated ? "blur" : ""}`}>
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
              <img id="audioImage2" src="/image/icon2.png" alt="Track" />
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
            onClick={() => {
              if (currentTime < 5) {
                debouncedPlayPreviousTrack();
              } else {
                audioRef.current.currentTime = 0;
              }
            }}
            disabled={currentTrackIndex === 0}
          >
            <i className="fas fa-backward"></i>
          </button>
          <button
            className="play-pause-button"
            onClick={handleTogglePlay}
            style={{
              transform:
                currentTrackIndex !== -1 && isPlaying ? "" : "scale(0.9, 2)",
              marginRight:
                currentTrackIndex !== -1 && isPlaying ? "17px" : "18px",
              marginLeft: currentTrackIndex !== -1 && isPlaying ? "" : "-1px",
            }}
            disabled={isFetchingAudioFile}
          >
            <p
              className={`play-pause ${isFetchingAudioFile ? "disabled" : ""}`}
            >
              {currentTrackIndex !== -1 && isPlaying ? "❙❙" : "►"}
            </p>
          </button>

          <button
            className="next"
            onClick={() => {
              if (currentTrackIndex === playlistSize - 1) {
                handlePlayAudio(playlistData.audioFiles[0], 0, false);
                audioRef.current.currentTime = 0;
              }
              debouncedPlayNextTrack();
            }}
            disabled={currentTrackIndex === -1}
          >
            <i className="fas fa-forward"></i>
          </button>
          <div className="repeat-button-container" id="repeat-button-container">
            <button
              className={
                isRepeatEnabled ? "repeat-button enabled" : "repeat-button"
              }
              onClick={() => {
                switch (repeatableMode) {
                  case 0:
                    setRepeatableMode(1);
                    setIsRepeatEnabled(true);
                    break;
                  case 1:
                    setRepeatableMode(2);
                    setIsRepeatEnabled(true);
                    break;
                  case 2:
                    setRepeatableMode(0);
                    setIsRepeatEnabled(false);
                    break;
                  default:
                    setRepeatableMode(0);
                    setIsRepeatEnabled(false);
                    break;
                }
              }}
            >
              ⟳
              {repeatableMode === 2 && <span className="repeat-number">1</span>}
            </button>
          </div>
          {/* <Tooltip anchorSelect="#repeat-button-container" delayShow={200}>
            <span>
              {isRepeatEnabled ? "Выключить повтор" : "Включить повтор"}
            </span>
          </Tooltip> */}
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
                className={`input-timeline ${
                  isFetchingAudioFile ? "disabled" : ""
                }`}
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={currentTrack ? currentTime / currentTrack.duration : 0}
                onChange={handleTimeChange}
                onMouseDown={() => {
                  if (!isSeeking) {
                    handleSeekStart();
                  }
                }}
                onMouseUp={handleSeekEnd}
                style={{
                  background: `linear-gradient(to right, rgb(157, 157, 235) 0%, rgb(157, 157, 235) ${`${
                    (currentTime / currentTrack.duration) * 100
                  }%`}, lightgray ${`${
                    (currentTime / currentTrack.duration) * 100
                  }%`}, lightgray 100%)`,
                }}
                disabled={isFetchingAudioFile}
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
                onChange={handleTimeChange}
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
          <div className="volume-icon" id="volume-icon" onClick={switchSound}>
            {renderVolumeIcon(volume)}
          </div>
          <input
            className="volume"
            id="volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => {
              setIsDraggingVolume(true);
              setVolume(e.target.value);
            }}
            onMouseUp={() => setIsDraggingVolume(false)}
            style={{
              background: `linear-gradient(to right, #6f6f6f 0%, #6f6f6f ${
                volume * 100
              }%, #c4c3c3 ${volume * 100}%, #c4c3c3 100%)`,
            }}
          />
          <Tooltip
            anchorSelect="#volume-icon"
            className="tooltip-class"
            delayShow={200}
          >
            <span id="sound-switch">
              {isSoundOn ? "Выключить звук" : "Включить звук"}
            </span>
          </Tooltip>

          <Tooltip
            anchorSelect="#volume"
            className="tooltip-class"
            delayShow={200}
          >
            <span id="sound-switch">Звук</span>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default AudioControls;
