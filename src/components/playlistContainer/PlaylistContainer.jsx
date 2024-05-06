import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { useHistoryContext } from "../../App";
import { useAuthContext } from "../../auth/AuthContext";
import AuthService from "../../services/AuthService";
import { useAudioContext } from "../AudioContext";
import "./PlaylistContainer.css";

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
  const [isLeftCrollButtonAvailable, setIsLeftScrollButtonAvailable] =
    useState(false);
  const [isRightCrollButtonAvailable, setIsRightScrollButtonAvailable] =
    useState(true);
  const [isLeftEdgeHovered, setIsLeftEdgeHovered] = useState(false);
  const [isRightEdgeHovered, setIsRightEdgeHovered] = useState(true);
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

    const updatedData = updatedWithIndexes.map(playlist => ({
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

  const addToFavorites = async playlist => {
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

  const deleteFromFavorites = async playlist => {
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
        list => list.id !== playlist.id
      );

      if (playlistData.id === playlist.id) {
        resetAudioContext();
      }

      setPlaylists(updatedPlaylists);
    } catch (error) {}
  };

  const playlistItemWidth = 221.6;

  useEffect(() => {
    const handleResize = () => {
      if (playlistListRef.current) {
        const playlistList = playlistListRef.current;

        if (playlistList && playlistList.offsetWidth === null) {
          return;
        }

        if (playlistList && playlistList.offsetWidth) {
          const width = playlistList.offsetWidth;

          const playlistsLength = playlists.length * playlistItemWidth;

          if (
            ((isAdminRole || isUserPlaylistContainer) &&
              playlistsLength >= width - playlistItemWidth) ||
            (!isAdminRole &&
              !isUserPlaylistContainer &&
              playlistsLength >= width)
          ) {
            setIsScreenNarrowerThanPlaylists(true);
          } else {
            setIsScreenNarrowerThanPlaylists(false);
          }
        } else {
          setTimeout(() => {
            handleResize();
          }, 500);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    if (playlistListRef.current) {
      const playlistList = playlistListRef.current;

      const edgeThreshold = 150;

      playlistList.addEventListener("mousemove", event => {
        const playlistListRect = playlistList.getBoundingClientRect();
        const mouseXRelativeToPlaylistList =
          event.clientX - playlistListRect.left;

        if (mouseXRelativeToPlaylistList <= edgeThreshold) {
          setIsLeftEdgeHovered(true);
          setIsRightEdgeHovered(false);
        } else if (
          mouseXRelativeToPlaylistList >=
          playlistListRect.width - edgeThreshold
        ) {
          setIsRightEdgeHovered(true);
          setIsLeftEdgeHovered(false);
        } else {
          setIsLeftEdgeHovered(false);
          setIsRightEdgeHovered(false);
        }
      });
    }
  }, [playlistListRef]);

  const scrollPlaylist = (direction, playlistList) => {
    if (playlistList && !isScrollButtonClicked) {
      let width = playlistList.offsetWidth;
      let itemsCount = Math.floor(width / playlistItemWidth);
      let scrollAmount =
        itemsCount <= 0
          ? playlistItemWidth
          : playlistItemWidth * Math.ceil(itemsCount / 2);

      setIsScrollButtonClicked(true);
      const { scrollLeft } = playlistList;

      if (direction === "left") {
        scrollPlaylistToLeft(playlistList, scrollLeft, scrollAmount);
      } else if (direction === "right") {
        scrollPlaylistToRight(playlistList, scrollLeft, scrollAmount);
      }
    }
  };

  const scrollPlaylistToLeft = (playlistList, scrollLeft, scrollAmount) => {
    setIsRightScrollButtonAvailable(true);

    if (scrollLeft > 0) {
      const newScrollLeft = Math.max(scrollLeft - scrollAmount, 0);

      playlistList.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });

      if (newScrollLeft === 0) {
        setIsLeftScrollButtonAvailable(false);
      }
    } else {
      setIsLeftScrollButtonAvailable(false);
    }

    setTimeout(() => {
      setIsScrollButtonClicked(false);
    }, 100);
  };

  const scrollPlaylistToRight = (playlistList, scrollLeft, scrollAmount) => {
    setIsLeftScrollButtonAvailable(true);
    const { scrollWidth, clientWidth } = playlistList;

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
        setIsRightScrollButtonAvailable(false);
      }
    } else {
      setIsRightScrollButtonAvailable(false);
    }
    setTimeout(() => {
      setIsScrollButtonClicked(false);
    }, 100);
  };

  return (
    <>
      {isAuthenticated && (
        <div
          className="playlist-list-container"
          onMouseLeave={() => {
            setIsLeftEdgeHovered(false);
            setIsRightEdgeHovered(false);
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
                      marginRight: index === playlists.length - 1 && "14px",
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
                          onClick={e => {
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
                  onClick={() =>
                    scrollPlaylist("left", playlistListRef.current)
                  }
                  onMouseEnter={() => setIsScrollButtonHovered(true)}
                  onMouseLeave={() => setIsScrollButtonHovered(false)}
                >
                  <p className="scroll-arrow">&lt;</p>
                </button>
              )}
              {isRightCrollButtonAvailable && isRightEdgeHovered && (
                <button
                  className="scroll-button right"
                  onClick={() =>
                    scrollPlaylist("right", playlistListRef.current)
                  }
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
