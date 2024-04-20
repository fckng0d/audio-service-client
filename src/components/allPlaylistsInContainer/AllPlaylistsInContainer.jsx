import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useAudioContext } from "../AudioContext";
import "./AllPlaylistsInContainer.css";
import { useHistoryContext } from "../../App";
import { Tooltip } from "react-tooltip";
import { useParams, useNavigate } from "react-router-dom";
import AuthService from "../../services/AuthService";
import { useAuthContext } from "../../auth/AuthContext";

const AllPlaylistInContainer = () => {
  const navigate = useNavigate();

  const { id } = useParams();

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

  const [playlistContainer, setPlaylistContainer] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const [isUserPlaylistContainer, setIsUserPlaylistContainer] = useState(false);
  const [isHoveredAddPlaylistButton, setIsHoveredAddPlaylistButton] =
    useState(false);

  const {
    setIsClickOnPlaylistPlayButton,
    playlistId,
    setPlaylistId,
    clearLocalPlaylist,
  } = useAudioContext();

  useEffect(() => {
    AuthService.isValideToken(navigate).then((result) => {
      if (!result) {
        setIsValidToken(false);
        return;
      }
    });

    setIsValidToken(true);

    setLastStateKey();

    if (!isUserPlaylistContainer && id !== undefined) {
      fetch(`http://localhost:8080/api/playlistContainers/${id}`, {
        headers: {
          Authorization: `Bearer ${AuthService.getAuthToken()}`,
        },
        method: "GET",
      })
        .then((response) => {
          if (response.status === 403) {
            // localStorage.removeItem("token");
            // localStorage.removeItem("role");
            navigate("/auth/sign-in", { replace: true });
            return null;
          }
          return response.json();
        })
        .then((data) => {
          setPlaylistContainer(data);
          setPlaylists(data.playlists);
        })
        .catch((error) => console.error("Error fetching playlists:", error));
    } else {
      fetch(`http://localhost:8080/api/favorites/playlists`, {
        headers: {
          Authorization: `Bearer ${AuthService.getAuthToken()}`,
        },
        method: "GET",
      })
        .then((response) => {
          if (response.status === 403) {
            navigate("/auth/sign-in", { replace: true });
            return null;
          }
          return response.json();
        })
        .then((data) => {
          setPlaylistContainer(data);
          setPlaylists(data.playlists);
        })
        .catch((error) => console.error("Error fetching playlists:", error));
    }
  }, []);

  useEffect(() => {
    setIsUserPlaylistContainer(
      playlistContainer && playlistContainer.playlistOwner === "USER"
    );
  }, [playlistContainer]);

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

    if (!isUserPlaylistContainer && id !== undefined) {
      const response = await fetch(
        `http://localhost:8080/api/playlistContainers/${id}/updateOrder`,
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
    } else {
      const response = await fetch(
        `http://localhost:8080/api/favorites/playlists/updateOrder`,
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
    }
  };

  return (
    <>
      {isAuthenticated && (
        // isValidToken
        <div className="all-playlist-container">
          <h2>
            {playlistContainer && playlistContainer.name}
            {/* {(isAdminRole || isUserPlaylistContainer) &&
              playlistContainer &&
              playlists &&
              playlists.length < 30 && (
                <Link
                  to={
                    isUserPlaylistContainer
                      ? `/favorites/playlists/add`
                      : `/sections/${id}/add`
                  }
                >
                  <button className="add-button">
                    <span>Создать плейлист</span>
                  </button>
                </Link>
              )} */}
          </h2>
          <div className="all-playlist-list-container">
            <div className="all-playlist-list" ref={playlistListRef}>
              {(isUserPlaylistContainer || isAdminRole) &&
                playlistContainer &&
                playlists &&
                playlists.length < 30 && (
                  <div
                    className="playlist-item-wrapper"
                    onMouseEnter={() => setIsHoveredAddPlaylistButton(true)}
                    onMouseLeave={() => setIsHoveredAddPlaylistButton(false)}
                  >
                    <Link
                      to={
                        playlistContainer.playlistOwner === "USER"
                          ? `/favorites/playlists/add`
                          : `/sections/${id}/add`
                      }
                      style={{ textDecoration: "none", color: "inherit" }}
                      className="playlist-link"
                    >
                      <div
                        className={`add-playlist-button-item2 ${
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

              {playlists.length > 0 &&
                playlists.map((playlist) => (
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
                            updatePlaylistsOrder(
                              playlists.indexOf(playlist),
                              -1
                            )
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
          </div>
        </div>
      )}
    </>
  );
};

export default AllPlaylistInContainer;
