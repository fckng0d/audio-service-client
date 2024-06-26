import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import { useAudioContext } from "../AudioContext";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import "./UserProfile.css";
import { useHistoryContext } from "../../App";
import AuthService from "../../services/AuthService";
import ImageService from "../../services/ImageService";
import { useAuthContext } from "../../auth/AuthContext";
import { Dropdown } from "react-bootstrap";

const UserProfile = () => {
  const apiUrl = process.env.REACT_APP_REST_API_URL;

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

  // const { id } = useParams();
  // const abortControllerRef = useRef(null);

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameAvailableMessage, setUsernameAvailableMessage] = useState("");
  const inputUsernameRef = useRef(null);

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
  }, []);

  useEffect(() => {
    if (profileData && profileData.username) {
      setUsername(profileData.username);
    }
  }, [profileData]);

  const handleImageShowMenu = () => {
    setShowMenu(!showMenu);
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    let selectedFile = event.target.files[0];
    if (selectedFile && selectedFile instanceof File) {
      const fileInput = event.target;
      const timestamp = new Date().getTime();
      const uniqueFilename = `${selectedFile.name}_${timestamp}`;
      selectedFile = new File([selectedFile], uniqueFilename, {
        type: selectedFile.type,
      });

      const maxSizeKB = 1024;
      ImageService.compressImage(selectedFile, maxSizeKB)
        .then((compressedFile) => {
          uploadProfileImage(compressedFile);
        })
        .catch((error) => {
          console.error("Ошибка при сжатии изображения:", error);
        });
      fileInput.value = "";
    }
  };

  const uploadProfileImage = (profileImage) => {
    const formData = new FormData();
    formData.append("profileImage", profileImage);

    fetch(`${apiUrl}/api/profile/image/upload`, {
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
    fetch(`${apiUrl}/api/profile/image/delete`, {
      headers: {
        Authorization: `Bearer ${AuthService.getAuthToken()}`,
      },
      method: "DELETE",
    })
      .then((response) => {
        // setTimeout(() => {
        // setIsProfileImageDeleted(true);
        setProfileImage(null);
        setProfileData((prevProfileData) => ({
          ...prevProfileData,
          profileImage: null,
        }));
        setShowMenu(false);
        // }, 500);
      })
      .catch((error) => {
        // Обработка ошибки удаления фотографии
      });
  };

  const handleEditUsernameClick = () => {
    setIsEditingUsername(true);
    setTimeout(() => {
      inputUsernameRef.current.focus();
    }, 1);
  };

  const handleInputUsernameChange = (e) => {
    validateUsername(e.target.value);
    setUsername(e.target.value);
    // setUsernameAvailableMessage("");
  };

  const handleUpdateUsername = () => {
    if (profileData.username === username) {
      setUsernameAvailableMessage("");
      setIsEditingUsername(false);
      return;
    }

    if (validateUsername(username)) {
      const formData = new FormData();
      formData.append("newUsername", username.trim());

      fetch(`${apiUrl}/api/profile/edit/username`, {
        headers: {
          Authorization: `Bearer ${AuthService.getAuthToken()}`,
        },
        method: "PUT",
        body: formData,
      })
        .then(async (response) => {
          if (response.ok) {
            setProfileData((prevProfileData) => ({
              ...prevProfileData,
              username: username.trim(),
            }));

            const data = await response.json();
            const token = data.token;
            const role = data.role;
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            setUsernameAvailableMessage("");
            setIsEditingUsername(false);
          } else if (response.status === 409) {
            setUsernameAvailableMessage("Имя пользователя уже занято");
          }
        })
        .catch((error) => {
          // Обработка ошибки загрузки фотографии
        });
    }
  };

  const cancelEditUsename = () => {
    setIsEditingUsername(false);
    setUsername(profileData.username);
    setUsernameAvailableMessage("");
  };

  const validateUsername = (username) => {
    let regUsernmae = /^[a-zA-Z0-9]+$/;

    if (username.length === 0) {
      setUsernameAvailableMessage("Заполните поле");
      return false;
    } else if (username.length < 5 || username.length > 30) {
      setUsernameAvailableMessage("Имя пользователя должно содержать от 5 до 30 символов");
      return false;
    } else if (!regUsernmae.test(username)) {
      setUsernameAvailableMessage(
        "Имя пользователя должно содержать только латинские буквы и цифры"
      );
      return false;
    } else {
      setUsernameAvailableMessage("");
      return true;
    }
  };
  
  const handleKeyPress = (event) => {
    handleEscapeKeyPress(event);
    handleEnterKeyPress(event);
  }

  const handleEscapeKeyPress = (event) => {
    if (event.key === "Escape") {
      setIsEditingUsername(false);
    }
  };

  const handleEnterKeyPress = (event) => {
    if (event.key === "Enter") {
      handleUpdateUsername();
    }
  };

  return (
    <>
      {isAuthenticated && profileData && (
        // isValidToken
        <div className="profile">
          <h2 className="title">Профиль</h2>
          <div
            className="profile-info"
            onMouseLeave={() => {
              setShowMenu(false);
              cancelEditUsename();
            }}
            onClick={() => {
              showMenu && setShowMenu(false);
            }}
          >
            <div className="profile-dropdown-container">
              <div className="profile-image-wrapper">
                {profileData.profileImage ? (
                  <img
                    className="profile-image"
                    src={`data:image/jpeg;base64, ${profileData.profileImage.data}`}
                    alt="Profile"
                    onClick={() => handleImageShowMenu()}
                  />
                ) : (
                  <>
                    <div
                      className="profile-image-placeholder"
                      onClick={() => handleImageShowMenu()}
                    >
                      {profileData.username.charAt(0).toUpperCase()}
                    </div>
                  </>
                )}
                <div
                  className={`edit-overlay ${showMenu && "hovered"}`}
                  onClick={() =>
                    !profileData.profileImage
                      ? openFilePicker()
                      : handleImageShowMenu()
                  }
                >
                  {profileData.profileImage ? "Изменить" : "Загрузить фото"}
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
                  {profileData.profileImage && (
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
                accept="image/*"
              />
            </div>
            <div className="profile-details">
              <div
                className="username-container"
                onKeyDown={handleKeyPress}
              >
                {isEditingUsername ? (
                  <>
                    <input
                      type="text"
                      value={username}
                      ref={inputUsernameRef}
                      onChange={handleInputUsernameChange}
                    />
                    <span className="error-message">
                      {usernameAvailableMessage}
                    </span>
                    <button
                      className="save-username-button"
                      onClick={handleUpdateUsername}
                    >
                      Сохранить
                    </button>
                    <button
                      className="cancel-editing-button"
                      id="cancel-editing-button"
                      onClick={cancelEditUsename}
                    >
                      X
                    </button>
                  </>
                ) : (
                  <>
                    <h2>{profileData.username}</h2>
                    <button
                      className="editing-button"
                      onClick={handleEditUsernameClick}
                    >
                      <img
                        className="edit-icon"
                        id="edit-icon"
                        src="/image/edit-icon.png"
                        alt="edit"
                      />
                    </button>
                    <Tooltip
                      anchorSelect="#edit-icon"
                      className="tooltip-class"
                      delayShow={200}
                    >
                      <span>Изменить имя пользователя</span>
                    </Tooltip>
                  </>
                )}
              </div>
              <p>{profileData.email}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;
