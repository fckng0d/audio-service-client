import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAudioContext } from "../AudioContext";
import "./PlaylistContainer.css";

const PlaylistContainer = () => {
  const [playlists, setPlaylists] = useState([]);
  const [currentPLaylist, setCurrentPlaylist] = useState(null);

  const {
    currentPlaylistId,
    isClickOnPlaylistPlayButton,
    setIsClickOnPlaylistPlayButton,
  } = useAudioContext();

  useEffect(() => {
    // Здесь вы можете выполнить запрос к серверу для получения списка плейлистов
    // Пример:
    fetch("http://localhost:8080/api/playlists")
      .then((response) => response.json())
      .then((data) => setPlaylists(data))
      .catch((error) => console.error("Error fetching playlists:", error));
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
          >
            <div
              className="playlist-item"
              style={{
                backgroundImage: `url(data:image/jpeg;base64,${playlist.image.data})`,
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
