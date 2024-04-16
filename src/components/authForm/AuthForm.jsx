import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHistoryContext } from "../../App";
import AuthService from "../../services/AuthService";
import { useAuthContext } from "../../auth/AuthContext";
import { useAudioContext } from "../AudioContext";
import "./AuthForm.css";

const AuthForm = () => {
  const { setLastStateKey, setIsAuthFormOpen } = useHistoryContext();

  const {
    isAuthenticated,
    setIsAuthenticated,
    isValidToken,
    setIsValidToken,
    isAdminRole,
    setIsAdminRole,
    profileImage,
    setProfileImage,
  } = useAuthContext();

  const {
    setCurrentTrack,
    setIsPlaying,
    setCurrentTrackIndex,
    audioRef,
    setPlaylistId,
    setCurrentPlaylistId,
    setLocalPlaylistData,
    clearLocalPlaylist,
    setToCurrentPlaylistId,
  } = useAudioContext();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  //   const [imageFile, setImageFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [inputType, setInputType] = useState("password");

  const navigate = useNavigate();

  useEffect(() => {
    setIsAuthFormOpen(true);
    setLastStateKey();

    return () => {
      setIsAuthFormOpen(false);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setSuccessMessage("");
    }, 4000);
  }, [successMessage]);

  //   const handleFileChange = (e) => {
  //     if (e.target.name === "audioFile") {
  //       setAudioFile(e.target.files[0]);
  //       getAudioDuration();
  //     } else if (e.target.name === "imageFile") {
  //       setImageFile(e.target.files[0]);
  //     }
  //   };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("identifier", identifier);
    formData.append("password", password);
    // formData.append("imageFile", imageFile);

    AuthService.signIn(identifier, password)
      .then((isSignedIn) => {
        if (isSignedIn) {
          resetAudioContext();
          setSuccessMessage("Авторизация успешна!");
          setTimeout(() => {
            setIsAuthenticated(true);
            setIsValidToken(true);
            console.log("token is valid");
            setIsAdminRole(AuthService.isAdminRole());
            navigate(`/playlistContainers`);
          }, 2000);
        } else {
          setSuccessMessage("Ошибка авторизации!");
        }
      })
      .catch((error) => {
        // Обработка ошибки аутентификации
      });
  };

  const resetAudioContext = () => {
    setCurrentTrack(null);
    setIsPlaying(false);
    audioRef.current.src = null;
    // audioRef = null;
    setPlaylistId(-1);
    setCurrentTrackIndex(-1);
    setCurrentPlaylistId(-2);
    setLocalPlaylistData(null);
    clearLocalPlaylist();
    setToCurrentPlaylistId(-1);
  };

  const resetForm = () => {
    setName("");
    setAuthor("");
    setImageFile(null);
  };

  const toggleHidePassword = () => {
    setInputType(inputType === "password" ? "text" : "password");
  };

  const labelStyles = {
    backgroundImage: `url(${
      inputType === "text" ? "/show-password.png" : "/hide-password.png"
    })`,
  };

  return (
    <div className="container">
      <form
        className="form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <h3>Авторизация</h3>
        <input
          className="input"
          type="text"
          name="name"
          placeholder="Электронная почта / имя пользователя"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <br />
        <div className="input-password">
          <input
            className="input"
            type={inputType}
            name="author"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            id="show-password"
            type="checkbox"
            checked={inputType === "text"}
            onChange={toggleHidePassword}
          />
          <label htmlFor="show-password" style={labelStyles}></label>
        </div>
        <br />
        <br />
        <div className="submit-button-container">
          <input className="submit-button" type="submit" value="Войти" />
        </div>
        <div className="success-message">
          <span>{successMessage}</span>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
