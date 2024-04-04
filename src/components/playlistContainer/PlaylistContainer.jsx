import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAudioContext } from "../AudioContext";
import "./PlaylistContainer.css";
import { useHistoryContext } from "../../App";

const PlaylistContainer = () => {
  const { setLastStateKey } = useHistoryContext();

  const [playlists, setPlaylists] = useState([]);

  const {
    setIsClickOnPlaylistPlayButton,
    playlistId,
    setPlaylistId,
    clearLocalPlaylist
  } = useAudioContext();

  useEffect(() => {
    setLastStateKey();

    fetch("http://localhost:8080/api/playlists")
      .then((response) => response.json())
      .then((data) => setPlaylists(data))
      .catch((error) => console.error("Error fetching playlists:", error));

      setPlaylistId(-5);
      // console.log(playlistId)
  }, []);

  return (
    <div className="playlist-container">
      <h2>
        Playlists
        <Link to="/playlists/add">
          <button className="add-button">
            <span>+</span>
          </button>
        </Link>
      </h2>
      <div className="playlist-list">
        {playlists.map((playlist) => (
          <Link
            to={`/playlists/${playlist.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
            key={playlist.id}
            onClick={() => clearLocalPlaylist()}
          >
            <div
              className="playlist-item"
              style={{
                backgroundImage: `url(data:image/jpeg;base64,${playlist.image.data})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
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
        ))}
      </div>
    </div>
  );
};

export default PlaylistContainer;
