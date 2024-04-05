import React, { useEffect, useState } from "react";
import { useAudioContext } from "../AudioContext";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useHistoryContext } from "../../App";

const Sidebar = () => {
  const { isBackAvailable, isForwardAvailable, setIsPressedNavButton } =
    useHistoryContext();

  const { currentPlaylistId, playlistId } = useAudioContext();

  const navigate = useNavigate();

  const handleNavigateToCurrentPlaylist = () => {
    if (currentPlaylistId !== -2 && playlistId !== -1) {
      navigate(`/playlists/${currentPlaylistId}`);
    }
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
    <div className="sidebar">
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
        <button
          className={isBackAvailable ? "back-button" : "back-button disabled"}
          onClick={() => handleBackNavigate()}
          disabled={!isBackAvailable}
        >
          <p>&lt;</p>
        </button>
        <button
          className={
            isForwardAvailable ? "forward-button" : "forward-button disabled"
          }
          onClick={() => handleForwardNavigate()}
          disabled={!isForwardAvailable}
        >
          <p>&gt;</p>
        </button>
      </div>
      <div className="toCurrentPlaylist-button-container">
        <button
          className={
            currentPlaylistId === -2 || playlistId === currentPlaylistId
              ? "toCurrentPlaylist-button disabled"
              : "toCurrentPlaylist-button"
          }
          onClick={handleNavigateToCurrentPlaylist}
          disabled={
            currentPlaylistId === -2 || playlistId === currentPlaylistId
          }
        >
          <span>В текущий плейлист</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
