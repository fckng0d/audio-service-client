import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAudioContext } from "../AudioContext";
import "./PlaylistContainer.css";
import { useHistoryContext } from "../../App";
import { Tooltip } from "react-tooltip";

const PlaylistContainer = () => {
  const { setLastStateKey } = useHistoryContext();

  const [playlists, setPlaylists] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const {
    setIsClickOnPlaylistPlayButton,
    playlistId,
    setPlaylistId,
    clearLocalPlaylist,
  } = useAudioContext();

  useEffect(() => {
    setLastStateKey();

    fetch("http://localhost:8080/api/playlists")
      .then((response) => response.json())
      .then((data) => setPlaylists(data))
      .catch((error) => console.error("Error fetching playlists:", error));

    // setPlaylistId(-5);
    // console.log(playlistId)
  }, []);

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
      orderIndex: playlist.orderIndex
    }));

    const response = await fetch(
      `http://localhost:8080/api/playlists/updateOrder`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      }
    );

    if (
      response.status === 500
    ) {
      throw new Error("Failed to update playlist");
    }
  };

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
          <div
            key={playlist.id}
            className="playlist-item-wrapper"
            onMouseEnter={() => setHoveredIndex(playlist.orderIndex)}
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
            <div
              className="playlist-buttons"
              style={{
                display:
                  hoveredIndex === playlist.orderIndex ? "block" : "none",
              }}
            >
              <button
                className={playlist.orderIndex !== 0 ? "back" : "back disabled"}
                onClick={() => updatePlaylistsOrder(playlist.orderIndex, -1)}
                disabled={playlist.orderIndex === 0}
              >
                &lt;
              </button>
              <button
                className={playlist.orderIndex + 1 < playlists.length ? "forward" : "forward disabled"}
                onClick={() => updatePlaylistsOrder(playlist.orderIndex, 1)}
                disabled={playlist.orderIndex + 1 >= playlists.length}
              >
                &gt;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistContainer;
