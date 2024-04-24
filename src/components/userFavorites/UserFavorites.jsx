import React, { useEffect, useState } from "react";
import PlaylistContainer from "../playlistContainer/PlaylistContainer";
import "./UserFavorites.css";
import AuthService from "../../services/AuthService";
import { useAuthContext } from "../../auth/AuthContext";
import { useAudioContext } from "../AudioContext";
import { useHistoryContext } from "../../App";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import AudioList from "../audioList/AudioList";

const UserFavorites = () => {
  const apiUrl = process.env.REACT_APP_REST_API_URL;

  const {
    isAuthenticated,
    setIsAuthenticated,
    isValidToken,
    setIsValidToken,
    isAdminRole,
    setIsAdminRole,
    setFavoriteContainerId,
  } = useAuthContext();

  const {
    setPlaylistId,
    localAudioFiles,
    setLocalAudioFiles,
    updatePlaylist,
    currentPlaylistId,
    setCurrentPlaylistId,
    localPlaylistData,
    setLocalPlaylistData,
    clearLocalPlaylist,
    toCurrentPlaylistId,
    updatePlaylistMultiFetch,
  } = useAudioContext();

  const { setLastStateKey, setIsFavoritesOpen } = useHistoryContext();
  const navigate = useNavigate();

  const [playlistContainer, setPlaylistContainer] = useState();

  useEffect(() => {
    AuthService.isValideToken(navigate).then((result) => {
      if (!result) {
        setIsValidToken(false);
        return;
      }
    });
    setIsValidToken(true);

    setIsFavoritesOpen(true);
    setLastStateKey();

    // clearLocalPlaylist();

    fetch(`${apiUrl}/api/favorites/playlists`, {
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
        setPlaylistContainer(data);
        setFavoriteContainerId(data.id);
      })
      .catch((error) => {
        console.error("Error fetching playlists:", error);
      });

    return () => {
      setIsFavoritesOpen(false);
    };
  }, []);

  return (
    <div className="playlist-container-collection">
      {playlistContainer && (
        <div className="playlist-container">
          <div className="meta-container">
            {playlistContainer && (
              <>
                <h2>{playlistContainer.name}</h2>
                {playlistContainer.playlists.length > 5 && (
                  <Link to={`/favorites/playlists`}>
                    <button className="show-all-button" onClick={() => {setIsFavoritesOpen(true);}}>Показать все</button>
                  </Link>
                )}
              </>
            )}
          </div>
          {/* <span className="description">{playlistContainer.description}</span> */}
          <PlaylistContainer
            key={playlistContainer.id}
            containerId={playlistContainer.id}
            playlistsInContainer={playlistContainer.playlists}
            isUserPlaylistContainer={true}
            sliceCount={5}
          />

          <br />
          <br />

          <div className="meta-container">
            {/* {playlistContainer && ( */}
            <>
              <h2>Избранные треки</h2>
            </>
            {/* )} */}
          </div>
          <AudioList
            className="favorite-audio-list"
            isFavoriteAudioFiles={true}
          />
        </div>
      )}
    </div>
  );
};

export default UserFavorites;
