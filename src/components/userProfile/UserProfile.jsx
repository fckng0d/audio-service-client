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
    setIsProfileImageUpdated,
    setProfileData,
    setIsProfileImageDeleted,
  } = useAuthContext();

  const { setLastStateKey } = useHistoryContext();

  const { id } = useParams();
  const abortControllerRef = useRef(null);

  const [showMenu, setShowMenu] = useState(false);

  const fileInputRef = useRef(null);

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
  }, []);

  const handleImageShowMenu = () => {
    setShowMenu(!showMenu);
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      uploadProfileImage(selectedFile);
    }
  };

  const uploadProfileImage = (profileImage) => {
    const formData = new FormData();
    formData.append("profileImage", profileImage);

    fetch("http://localhost:8080/api/profile/image/upload", {
      headers: {
        Authorization: `Bearer ${AuthService.getAuthToken()}`,
      },
      method: "POST",
      body: formData,
    })
      .then((response) => {
        setIsProfileImageUpdated(true);
        setShowMenu(false);
      })
      .catch((error) => {
        // Обработка ошибки загрузки фотографии
      });
  };

  const deleteProfileImage = () => {
    fetch("http://localhost:8080/api/profile/image/delete", {
      headers: {
        Authorization: `Bearer ${AuthService.getAuthToken()}`,
      },
      method: "DELETE",
    })
      .then((response) => {
        // setTimeout(() => {
        // setIsProfileImageDeleted(true);
        setProfileImage(null);
        setShowMenu(false);
        // }, 500);
      })
      .catch((error) => {
        // Обработка ошибки удаления фотографии
      });
  };

  return (
    <>
      {isAuthenticated && (
        // isValidToken
        <div className="profile">
          <h2 className="title">Профиль</h2>
          <div
            className="profile-info"
            onMouseLeave={() => setShowMenu(false)}
            onClick={() => {
              showMenu && setShowMenu(false);
            }}
          >
            <div className="profile-dropdown-container">
              <div className="profile-image-wrapper">
                {profileImage ? (
                  <img
                    className="profile-image"
                    src={`data:image/jpeg;base64, ${profileImage.data}`}
                    alt="Profile"
                    onClick={() => handleImageShowMenu()}
                  />
                ) : (
                  <>
                    <div
                      className="profile-image-placeholder"
                      onClick={() => handleImageShowMenu()}
                    >
                      {profileData &&
                        profileData.username.charAt(0).toUpperCase()}
                    </div>
                  </>
                )}
                <div
                  className={`edit-overlay ${showMenu && "hovered"}`}
                  onClick={() =>
                    !profileImage ? openFilePicker() : handleImageShowMenu()
                  }
                >
                  {profileImage ? "Изменить" : "Загрузить фото"}
                </div>
              </div>

              {showMenu && (
                <div className="profile-image-menu">
                  <div
                    className="profile-image-menu-item"
                    onClick={openFilePicker}
                  >
                    Загрузить фото
                  </div>
                  {profileImage && (
                    <div
                      className="profile-image-menu-item"
                      onClick={() => deleteProfileImage()}
                    >
                      Удалить
                    </div>
                  )}
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
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
