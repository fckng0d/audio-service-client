import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import { useAudioContext } from "../AudioContext";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import "./UserProfile.css";
import { useHistoryContext } from "../../App";
import AuthService from "../../services/AuthService";
import { useAuthContext } from "../../auth/AuthContext";
import { Dropdown } from "react-bootstrap";

const UserProfile = () => {
  const navigate = useNavigate();

  const {
    isAuthenticated,
    setIsAuthenticated,
    isValidToken,
    setIsValidToken,
    isAdminRole,
    setIsAdminRole,
    profileImage,
    setProfileImage,
    profileData,
    setProfileData,
  } = useAuthContext();

  const { setLastStateKey } = useHistoryContext();

  const { id } = useParams();
  const abortControllerRef = useRef(null);

  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    AuthService.isValideToken(navigate).then((result) => {
      if (!result) {
        setIsValidToken(false);
        return;
      }
    });

    setLastStateKey();

    fetch(`http://localhost:8080/api/profile`, {
      headers: {
        Authorization: `Bearer ${AuthService.getAuthToken()}`,
      },
      method: "GET",
      // signal: abortController.signal,
    })
      .then((response) => response.json())
      .then((data) => {
        setProfileData(data);
      });

    // const abortController = new AbortController();
    // abortControllerRef.current = abortController;

    // if (abortControllerRef.current) {
    //   abortControllerRef.current.abort();
    // }

    // return () => {
    //   if (abortControllerRef.current) {
    //     abortControllerRef.current.abort();
    //   }

    // };
  }, []);

  const handleImageShowMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <>
      {isAuthenticated && (
        // isValidToken
        <div className="profile">
          <h2 className="title">Профиль</h2>
          <div
            className="profile-info"
            onMouseLeave={() => handleImageShowMenu()}
          >
            <div className="profile-dropdown-container">
              <img
                className="profile-image"
                src={
                  profileImage !== null
                    ? `data:image/jpeg;base64, ${profileImage.data}`
                    : "/default-profile.png"
                }
                alt="Profile"
                onClick={() => handleImageShowMenu()}
              />

              {showMenu && (
                <div className="profile-image-menu">
                  <div className="profile-image-menu-item">Загрузить фото</div>
                  <div className="profile-image-menu-item">Удалить</div>
                </div>
              )}
            </div>
            <div className="profile-details">
              <h2>{profileData && profileData.username}</h2>
              <p>{profileData && profileData.email}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;
