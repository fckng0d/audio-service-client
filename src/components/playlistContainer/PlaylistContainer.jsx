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

  const playlistListRef = useRef(null);

  const [playlistContainerId, setPlaylistContainerId] = useState(containerId);
  const [playlists, setPlaylists] = useState(playlistsInContainer);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isHoveredAddPlaylistButton, setIsHoveredAddPlaylistButton] =
    useState(false);
  const [
    isHoveredAddPlaylistToFavoritesButton,
    setIsHoveredAddPlaylistToFavoritesButton,
  ] = useState(false);

  const [isScrollButtonClicked, setIsScrollButtonClicked] = useState(0);
  const [isLeftCrollButtonAvailable, setIsLeftCrollButtonAvailable] =
    useState(false);
  const [isRightCrollButtonAvailable, setIsRightCrollButtonAvailable] =
    useState(true);
  const [isLeftEdgeHovered, setIsLeftEdgeHovered] = useState(false);
  const [isRigthEdgeHovered, setIsRigthEdgeHovered] = useState(true);
  const [isScrollButtonHovered, setIsScrollButtonHovered] = useState(false);

  const [isScreenNarrowerThanPlaylists, setIsScreenNarrowerThanPlaylists] =
    useState(false);

  const {
    setIsClickOnPlaylistPlayButton,
    playlistId,
    setPlaylistId,
    clearLocalPlaylist,
    resetAudioContext,
    playlistData,
  } = useAudioContext();

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
      `${apiUrl}/api/playlistContainers/${playlistContainerId}/updateOrder`,
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

  const addToFavorites = async (playlist) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/favorites/playlists/add/${playlist.id}`,
        {
          headers: {
            Authorization: `Bearer ${AuthService.getAuthToken()}`,
          },
          method: "POST",
        }
      );

      if (response.status === 500) {
        throw new Error("Error adding playlist to favorites");
      }

      if (response.status === 409) {
        console.error("Playlist is already in favorites");
      }
    } catch (error) {
      console.error("Error adding playlist to favorites:", error);
      setIsDeleting(false);
    }
  };

  const deleteFromFavorites = async (playlist) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/favorites/playlists/delete/${playlist.id}`,
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

      const updatedPlaylists = playlists.filter(
        (list) => list.id !== playlist.id
      );

      if (playlistData.id === playlist.id) {
        resetAudioContext();
      }

      setPlaylists(updatedPlaylists);
    } catch (error) {}
  };

  useEffect(() => {
    if (playlistListRef.current) {
      const playlistList = playlistListRef.current;

      const handleResize = () => {
        const playlistList = playlistListRef.current;

        if (playlistList && playlistList.offsetWidth === null) {
          return;
        }

        const width = playlistList.offsetWidth;
        // const itemsCount = Math.floor(width / 218);

        const playlistsLength = playlists.length * 218;

        if (
          ((isAdminRole || isUserPlaylistContainer) &&
            playlistsLength >= width - 218) ||
          (!isAdminRole && !isUserPlaylistContainer && playlistsLength >= width)
        ) {
          setIsScreenNarrowerThanPlaylists(true);
        } else {
          setIsScreenNarrowerThanPlaylists(false);
        }
      };

      window.addEventListener("resize", handleResize);

      const edgeThreshold = 150;

      playlistList.addEventListener("mousemove", (event) => {
        const playlistListRect = playlistList.getBoundingClientRect();
        const mouseXRelativeToPlaylistList =
          event.clientX - playlistListRect.left;

        if (mouseXRelativeToPlaylistList <= edgeThreshold) {
          setIsLeftEdgeHovered(true);
          setIsRigthEdgeHovered(false);
        } else if (
          mouseXRelativeToPlaylistList >=
          playlistListRect.width - edgeThreshold
        ) {
          setIsRigthEdgeHovered(true);
          setIsLeftEdgeHovered(false);
        } else {
          setIsLeftEdgeHovered(false);
          setIsRigthEdgeHovered(false);
        }
      });
    }
  }, [playlistListRef]);

  const scrollPlaylistToLeft = (playlistList) => {
    if (playlistList && !isScrollButtonClicked) {
      const width = playlistList.offsetWidth;
      const itemsCount = Math.floor(width / 218);
      const scrollAmount = itemsCount = 1 ? 218 : 218 * (itemsCount / 2);

      setIsScrollButtonClicked(true);
      setIsRightCrollButtonAvailable(true);
      const { scrollLeft } = playlistList;

      if (scrollLeft > 0) {
        const newScrollLeft = Math.max(scrollLeft - scrollAmount, 0);

        playlistList.scrollTo({
          left: newScrollLeft,
          behavior: "smooth",
        });

        if (newScrollLeft === 0) {
          setIsLeftCrollButtonAvailable(false);
        }
      } else {
        setIsLeftCrollButtonAvailable(false);
      }

      setTimeout(() => {
        setIsScrollButtonClicked(false);
      }, 500);
    }
  };

  const scrollPlaylistToRight = (playlistList) => {
    if (playlistList && !isScrollButtonClicked) {
      const width = playlistList.offsetWidth;
      const itemsCount = Math.floor(width / 218);
      const scrollAmount = 218 * (itemsCount / 2);

      setIsScrollButtonClicked(true);
      setIsLeftCrollButtonAvailable(true);
      const { scrollLeft, scrollWidth, clientWidth } = playlistList;

      if (scrollLeft + clientWidth < scrollWidth) {
        const newScrollLeft = Math.min(
          scrollLeft + scrollAmount,
          scrollWidth - clientWidth
        );

        playlistList.scrollTo({
          left: newScrollLeft,
          behavior: "smooth",
        });

        if (newScrollLeft > scrollWidth - clientWidth - 5) {
          setIsRightCrollButtonAvailable(false);
        }
      } else {
        setIsRightCrollButtonAvailable(false);
      }
      setTimeout(() => {
        setIsScrollButtonClicked(false);
      }, 500);
    }
  };

  return (
    <>
      {isAuthenticated && (
        <div
          className="playlist-list-container"
          onMouseLeave={() => {
            setIsLeftEdgeHovered(false);
            setIsRigthEdgeHovered(false);
          }}
        >
          {/* <button className="show-all-button">Показать все</button> */}
          <div
            id="playlist-list"
            className="playlist-list"
            ref={playlistListRef}
            // style={{
            //   overflowX: isScreenNarrowerThanPlaylists ? "auto" : "hidden",
            // }}
          >
            {((isUserPlaylistContainer && playlists.length < 100) ||
              (isAdminRole && playlists.length < 30)) &&
              playlists && (
                // (isUserPlaylistContainer ||
                // (isAdminRole && playlists.length < 6))
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
              playlists
                // .slice(leftCliceIndex, sliceCount + 1)
                .map((playlist, index) => (
                  <div
                    key={playlist.id}
                    className="playlist-item-wrapper"
                    onMouseEnter={() => {
                      const index = playlists.indexOf(playlist);
                      setHoveredIndex(index);
                    }}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{
                      position: "relative",
                      marginRight: index === playlists.length - 1 && "18px",
                    }}
                  >
                    <Link
                      to={`/playlists/${playlist.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                      onClick={() => {
                        clearLocalPlaylist();
                        setOpenFromPlaylistContainerId(containerId);
                      }}
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
                    {playlist.playlistOwnerRole === "PUBLIC" && (
                      <div
                        className="add-to-favorites-container"
                        id="add-to-favorites-container"
                        style={{
                          display:
                            hoveredIndex === playlists.indexOf(playlist)
                              ? "block"
                              : "none",
                        }}
                        onMouseEnter={() =>
                          setIsHoveredAddPlaylistToFavoritesButton(true)
                        }
                        onMouseLeave={() =>
                          setIsHoveredAddPlaylistToFavoritesButton(false)
                        }
                      >
                        <button
                          onClick={() => {
                            isUserPlaylistContainer
                              ? deleteFromFavorites(playlist)
                              : addToFavorites(playlist);
                          }}
                        >
                          <h2
                            className={`${
                              isHoveredAddPlaylistToFavoritesButton
                                ? "hovered"
                                : ""
                            }`}
                            style={
                              isUserPlaylistContainer
                                ? {
                                    transform: "scale(0.8, 0.50)",
                                    fontWeight: "500",
                                    marginBottom: "-0px",
                                  }
                                : null
                            }
                          >
                            {isUserPlaylistContainer ? "X" : "+"}
                          </h2>
                        </button>
                      </div>
                    )}
                    <Tooltip
                      anchorSelect="#add-to-favorites-container"
                      className="tooltip-class"
                      delayShow={200}
                    >
                      <span>
                        {isUserPlaylistContainer
                          ? "Удалить из избранного"
                          : "Добавить в избранное"}
                      </span>
                    </Tooltip>

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
          {(((isAdminRole || isUserPlaylistContainer) &&
            (playlists.length > 5 || isScreenNarrowerThanPlaylists)) ||
            (!isAdminRole &&
              !isUserPlaylistContainer &&
              (playlists.length > 6 || isScreenNarrowerThanPlaylists))) && (
            <>
              {isLeftCrollButtonAvailable && isLeftEdgeHovered && (
                <button
                  className="scroll-button left"
                  onClick={() => scrollPlaylistToLeft(playlistListRef.current)}
                  onMouseEnter={() => setIsScrollButtonHovered(true)}
                  onMouseLeave={() => setIsScrollButtonHovered(false)}
                >
                  <p className="scroll-arrow">&lt;</p>
                </button>
              )}
              {isRightCrollButtonAvailable && isRigthEdgeHovered && (
                <button
                  className="scroll-button right"
                  onClick={() => scrollPlaylistToRight(playlistListRef.current)}
                  onMouseEnter={() => setIsScrollButtonHovered(true)}
                  onMouseLeave={() => setIsScrollButtonHovered(false)}
                >
                  <p className="scroll-arrow">&gt;</p>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default PlaylistContainer;
