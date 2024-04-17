import React, { useEffect, useState } from "react";
import PlaylistContainer from "../playlistContainer/PlaylistContainer";
import "./PlaylistContainerCollection.css";
import AuthService from "../../services/AuthService";
import { useAuthContext } from "../../auth/AuthContext";
import { useHistoryContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const PlaylistContainerCollection = () => {
  const {
    isAuthenticated,
    setIsAuthenticated,
    isValidToken,
    setIsValidToken,
    isAdminRole,
    setIsAdminRole,
  } = useAuthContext();

  const { setLastStateKey } = useHistoryContext();
  const navigate = useNavigate();

  const [playlistContainers, setPlaylistContainers] = useState([]);

  useEffect(() => {
    AuthService.isValideToken(navigate).then((result) => {
      if (!result) {
        setIsValidToken(false);
        return;
      }
    });
    setIsValidToken(true);

    setLastStateKey();

    fetch(`http://localhost:8080/api/public/playlistContainers`, {
      headers: {
        Authorization: `Bearer ${AuthService.getAuthToken()}`,
      },
      method: "GET",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to fetch playlist containers");
        }
      })
      .then((data) => {
        setPlaylistContainers(data);
      })
      .catch((error) => {
        console.error("Error fetching playlists:", error);
      });
  }, []);

  return (
    <div className="playlist-container-collection">
      {playlistContainers && isAdminRole && (
        <div className="add-playlistContainer-button-container">
          <Link to={`/sections/create`}>
            <button className="add-playlistContainer-button">Добавить секцию</button>
          </Link>
        </div>
      )}
      {playlistContainers &&
        playlistContainers.map((playlistContainer) => (
          <div key={playlistContainer.id} className="playlist-container">
            <div className="meta-container">
              <h2>
                {playlistContainer.name}
                {/* {isAdminRole && (
                  <Link to={`/section/${playlistContainer.id}/add`}>
                    <button className="add-button">
                      <span>+</span>
                    </button>
                  </Link>
                )} */}
              </h2>

              {playlistContainer.playlists.length > 6 && (
                <Link to={`/sections/${playlistContainer.id}`}>
                  <button className="show-all-button">Показать все</button>
                </Link>
              )}
            </div>
            {/* <span className="description">{playlistContainer.description}</span> */}
            <PlaylistContainer
              key={playlistContainer.id}
              containerId={playlistContainer.id}
              playlistsInContainer={playlistContainer.playlists}
            />
          </div>
        ))}
    </div>
  );
};

export default PlaylistContainerCollection;
