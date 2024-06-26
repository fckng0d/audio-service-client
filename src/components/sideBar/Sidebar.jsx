import React, { useEffect, useState } from "react";
import { useAudioContext } from "../AudioContext";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useHistoryContext } from "../../App";
import { useAuthContext } from "../../auth/AuthContext";

const Sidebar = () => {
  const apiUrl = process.env.REACT_APP_REST_API_URL;

  const {
    isBackAvailable,
    isForwardAvailable,
    setIsPressedNavButton,
    isAuthFormOpen,
    isFavoritesOpen,
    setIsFavoritesOpen,
  } = useHistoryContext();

  const {
    isAuthenticated,
    setIsAuthenticated,
    isValidToken,
    setIsValidToken,
    isAdminRole,
    setIsAdminRole,
  } = useAuthContext();

  const { currentPlaylistId, toCurrentPlaylistId, playlistId, playlistData } =
    useAudioContext();

  const navigate = useNavigate();

  const handleNavigateToCurrentPlaylist = () => {
    if (
      currentPlaylistId !== -2 &&
      currentPlaylistId !== -1 &&
      toCurrentPlaylistId !== currentPlaylistId
    ) {
      if (currentPlaylistId === -10) {
        handleNavigateToFavorites();
      } else {
        navigate(`/playlists/${currentPlaylistId}`);
      }
    }
  };

  const handleNavigateToFavorites = () => {
    navigate("/favorites");
  };

  useEffect(() => {
    const initialState = { isFirstPage: true, idx: 0 };
    window.history.replaceState(
      initialState,
      document.title,
      window.location.href
    );
  }, []);

  const handleForwardNavigate = () => {
    setIsPressedNavButton(true);

    window.history.forward();
  };

  const handleBackNavigate = () => {
    setIsPressedNavButton(true);

    const isFirstPage = window.history.state?.isFirstPage;
    if (!isFirstPage) {
      window.history.back();
    }
  };

  return (
    <div
      className="sidebar"
      style={{ height: `${!isAuthenticated ? "91.9%" : "80.2%"}` }}
    >
      {/* <form className="d-flex">
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search"
              aria-label="Search"
              style={{width: "200px"}}
            ></input>
            <button className="btn btn-outline-success" type="submit">
              Search
            </button>
          </form> */}
      <div className="navigaton-container">
        <div className="toCurrentPlaylist-button-container">
          {currentPlaylistId !== -2 && (
            <button
              className={
                currentPlaylistId === -2 || playlistId === -1
                  ? "toCurrentPlaylist-button disabled"
                  : toCurrentPlaylistId === currentPlaylistId ||
                    (window.location.href.includes("/favorites") &&
                      currentPlaylistId === -10)
                  ? "toCurrentPlaylist-button hovered"
                  : "toCurrentPlaylist-button"
              }
              onClick={handleNavigateToCurrentPlaylist}
              disabled={
                currentPlaylistId === -2 ||
                toCurrentPlaylistId === currentPlaylistId ||
                playlistId === -1 ||
                (window.location.href.includes("/favorites") &&
                  currentPlaylistId === -10)
              }
            >
              <span>В текущий плейлист</span>
            </button>
          )}
        </div>

        <button
          className={
            isBackAvailable && isAuthenticated
              ? "back-button"
              : "back-button disabled"
          }
          onClick={() => handleBackNavigate()}
          disabled={!isBackAvailable || !isAuthenticated}
        >
          <p>&lt;</p>
        </button>
        <button
          className={
            isForwardAvailable && isAuthenticated
              ? "forward-button"
              : "forward-button disabled"
          }
          onClick={() => handleForwardNavigate()}
          disabled={!isForwardAvailable || !isAuthenticated}
        >
          <p>&gt;</p>
        </button>
      </div>
      <div className="functional-buttons-container">
        {isAuthenticated && (
          <div className="favourites-button-container">
            <button
              className={`favourites-button ${
                isFavoritesOpen ? "hovered" : ""
              }`}
              onClick={handleNavigateToFavorites}
            >
              <span>Избранное</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
