import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useAudioContext } from "../AudioContext";
import "./PlaylistContainer.css";
import { useHistoryContext } from "../../App";
import { Tooltip } from "react-tooltip";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/AuthService";
import { useAuthContext } from "../../auth/AuthContext";

const PlaylistContainer = ({
  containerId,
  playlistsInContainer,
  isUserPlaylistContainer,
  sliceCount,
}) => {
  PlaylistContainer.propTypes = {
    playlistsInContainer: PropTypes.array,
    containerId: PropTypes.any,
    isUserPlaylistContainer: PropTypes.bool,
    sliceCount: PropTypes.number,
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

  const playlistListRef = useRef(null);

  const [playlistContainerId, setPlaylistContainerId] = useState(containerId);
  const [playlists, setPlaylists] = useState(playlistsInContainer);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isHoveredAddPlaylistButton, setIsHoveredAddPlaylistButton] =
    useState(false);

  const {
    setIsClickOnPlaylistPlayButton,
    playlistId,
    setPlaylistId,
    clearLocalPlaylist,
  } = useAudioContext();

  // const scrollLeft = () => {
  //   if (playlistListRef.current) {
  //     playlistListRef.current.scrollBy({
  //       left: -500, // Прокрутить влево на 100px
  //       behavior: "smooth", // Добавить плавность
  //     });
  //   }
  // };

  // const scrollRight = () => {
  //   if (playlistListRef.current) {
  //     playlistListRef.current.scrollBy({
  //       left: 500, // Прокрутить вправо на 100px
  //       behavior: "smooth", // Добавить плавность
  //     });
  //   }
  // };

  const updatePlaylistsOrder = async (currentIndex, direction) => {
    if (
      currentIndex + direction < 0 ||
      currentIndex + direction >= playlists.length
    ) {
      return;
    }

    const updated = [...playlists];
    const playlistToMove = updated[currentIndex];
    updated.splice(currentIndex, 1);
    updated.splice(currentIndex + direction, 0, playlistToMove);
    setPlaylists(updated);

    const updatedWithIndexes = updated.map((playlist, index) => ({
      ...playlist,
      orderIndex: index,
    }));
    setPlaylists(updatedWithIndexes);

    const updatedData = updatedWithIndexes.map((playlist) => ({
      id: playlist.id,
      orderIndex: playlist.orderIndex,
    }));

    const response = await fetch(
      `http://localhost:8080/api/playlistContainers/${playlistContainerId}/updateOrder`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthService.getAuthToken()}`,
        },
        body: JSON.stringify(updatedData),
      }
    );

    if (response.status === 500) {
      throw new Error("Failed to update playlist");
    }
  };

  return (
    <>
      {isAuthenticated && (
        // isValidToken
        // <div className="playlist-container">
        /* <h2>
            Плейлисты
            {isAdminRole && (
              <Link to="/playlists/add">
                <button className="add-button">
                  <span>+</span>
                </button>
              </Link>
            )}
          </h2> */
        <div className="playlist-list-container">
          {/* <button className="show-all-button">Показать все</button> */}
          <div className="playlist-list" ref={playlistListRef}>
            {(isUserPlaylistContainer || isAdminRole) &&
              playlists &&
              playlists.length < 30 &&
              (isUserPlaylistContainer ||
                (isAdminRole && playlists.length < 5)) &&
              playlists.length < 30 && (
                <div
                  className="playlist-item-wrapper"
                  onMouseEnter={() => setIsHoveredAddPlaylistButton(true)}
                  onMouseLeave={() => setIsHoveredAddPlaylistButton(false)}
                >
                  <Link
                    to={
                      isUserPlaylistContainer
                        ? `/favorites/playlists/add`
                        : `/sections/${containerId}/add`
                    }
                    style={{ textDecoration: "none", color: "inherit" }}
                    className="playlist-link"
                  >
                    <div
                      className={`add-playlist-button-item ${
                        isHoveredAddPlaylistButton ? "hovered" : ""
                      }`}
                    >
                      <h2
                        className={`plus-button ${
                          isHoveredAddPlaylistButton ? "hovered" : ""
                        }`}
                      >
                        +
                      </h2>
                    </div>
                  </Link>
                </div>
              )}

            {playlists &&
              playlists.slice(0, sliceCount).map((playlist) => (
                <div
                  key={playlist.id}
                  className="playlist-item-wrapper"
                  onMouseEnter={() => {
                    const index = playlists.indexOf(playlist);
                    setHoveredIndex(index);
                  }}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ position: "relative" }}
                >
                  <Link
                    to={`/playlists/${playlist.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                    onClick={() => clearLocalPlaylist()}
                    className="playlist-link"
                  >
                    <div
                      className="playlist-item"
                      style={{
                        backgroundImage: `url(data:image/jpeg;base64,${playlist.image.data})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <h3>{playlist.name}</h3>
                      <p>Author: {playlist.author}</p>
                      <div
                        className="play-button"
                        onClick={(e) => {
                          setIsClickOnPlaylistPlayButton(true);
                          console.log("click");
                        }}
                      ></div>
                    </div>
                  </Link>
                  {(isAdminRole || isUserPlaylistContainer) && (
                    <div
                      className="playlist-buttons"
                      style={{
                        display:
                          hoveredIndex === playlists.indexOf(playlist)
                            ? "block"
                            : "none",
                      }}
                    >
                      <button
                        className={
                          playlists.indexOf(playlist) !== 0
                            ? "back"
                            : "back disabled"
                        }
                        onClick={() =>
                          updatePlaylistsOrder(playlists.indexOf(playlist), -1)
                        }
                        disabled={playlists.indexOf(playlist) === 0}
                      >
                        &lt;
                      </button>
                      <button
                        className={
                          playlists.indexOf(playlist) + 1 < playlists.length
                            ? "forward"
                            : "forward disabled"
                        }
                        onClick={() =>
                          updatePlaylistsOrder(playlists.indexOf(playlist), 1)
                        }
                        disabled={
                          playlists.indexOf(playlist) + 1 >= playlists.length
                        }
                      >
                        &gt;
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
          {/* <button className="scroll-button left" onClick={scrollLeft}>
            Влево
          </button>
          <button className="scroll-button right" onClick={scrollRight}>
            Вправо
          </button> */}
        </div>
      )}
    </>
  );
};

export default PlaylistContainer;
