import React from "react";
import { useAudioContext } from "../AudioContext";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Sidebar = () => {
  const { currentPlaylistId, playlistId } = useAudioContext();

  const navigate = useNavigate();

  const handleNavigateToCurrentPlaylist = () => {
    if (currentPlaylistId !== -2 && playlistId !== -1) {
      navigate(`/playlists/${currentPlaylistId}`);
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
      <div className="toCurrentPlaylist-button">
        <button
          onClick={handleNavigateToCurrentPlaylist}
          hidden={currentPlaylistId === -2 || playlistId === -1}
        >
          <span>В текущий плейлист</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
