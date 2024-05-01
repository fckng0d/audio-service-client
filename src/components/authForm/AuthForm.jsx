import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useHistoryContext } from "../../App";
import AuthService from "../../services/AuthService";
import { useAuthContext } from "../../auth/AuthContext";
import { useAudioContext } from "../AudioContext";
import { Tooltip } from "react-tooltip";
import { Link } from "react-router-dom";
import "./AuthForm.css";
const apiUrl = process.env.REACT_APP_REST_API_URL;

const AuthForm = () => {
  const { setLastStateKey, setIsAuthFormOpen } = useHistoryContext();

  const {
    setIsAuthenticated,
    setIsValidToken,
    setIsAdminRole,
    fetchProfileData,
    setProfileData,
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

  const timerIdRef = useRef(null);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccessSignIn, setIsSuccessSignIn] = useState(false);

  const [inputType, setInputType] = useState("password");

  const [userIdentifierAvailableMessage, setUserIdentifierAvailableMessage] =
    useState("");
  const [passwordAvailableMessage, setPasswordAvailableMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    AuthService.isValideToken(navigate).then((result) => {
      if (!result) {
        setIsValidToken(false);
        setProfileData(null);
        setIsAuthenticated(false);
      }
    });

    setIsAuthFormOpen(true);
    setLastStateKey();

    return () => {
      setIsAuthFormOpen(false);
      timerIdRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current);
    }

    timerIdRef.current = setTimeout(() => {
      setSuccessMessage("");
      setIsSuccessSignIn(false);
    }, 4000);

    return () => clearTimeout(timerIdRef.current);
  }, [successMessage]);

  const handleSignOut = () => {
    AuthService.signOut();
    setIsAuthenticated(false);
    setIsValidToken(false);
    setIsAdminRole(false);
    setProfileData(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isUserIdentifierAvailable = validateUserIdentifier(identifier);
    const isPasswordAvailable = validatePassword(password);

    if (isUserIdentifierAvailable && isPasswordAvailable) {
      const formData = new FormData();
      formData.append("identifier", identifier);
      formData.append("password", password);

      if (AuthService.isAuthenticated()) {
        handleSignOut();
      }

      // fetchProfileData();

      AuthService.signIn(identifier, password)
        .then((isSignedIn) => {
          if (isSignedIn) {
            setIsAuthenticated(false);
            setIsAdminRole(false);
            fetchProfileData();

            setIsSuccessSignIn(true);
            resetAudioContext();
            setSuccessMessage("Авторизация успешна!");

            setTimeout(() => {
              setIsAuthenticated(true);
              setIsValidToken(true);
              setIsAdminRole(AuthService.isAdminRole());
              navigate(`/`, { replace: true });
            }, 1000);
          } else {
            setSuccessMessage("Неверный идентификатор или пароль");
            setIsSuccessSignIn(false);
          }
        })
        .catch((error) => {
          setSuccessMessage("Ошибка авторизации");
          setIsSuccessSignIn(false);
        });
    }
  };

  const validateUserIdentifier = (identifier) => {
    if (identifier.length === 0) {
      setUserIdentifierAvailableMessage("Заполните поле");
      return false;
    } else {
      setUserIdentifierAvailableMessage("");
      return true;
    }
  };

  const validatePassword = (password) => {
    if (password.length === 0) {
      setPasswordAvailableMessage("Заполните поле");
      return false;
    } else {
      setPasswordAvailableMessage("");
      return true;
    }
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
      inputType === "text"
        ? "/image/show-password.png"
        : "/image/hide-password.png"
    })`,
  };

  return (
    <div className="sing-in-container">
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
          onChange={(e) => {
            setIdentifier(e.target.value);
            validateUserIdentifier(e.target.value);
          }}
        />
        <span className="error-message">{userIdentifierAvailableMessage}</span>

        <br />
        <div className="input-password">
          <input
            className="input"
            type={inputType}
            name="author"
            placeholder="Пароль"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
            }}
          />

          <input
            tabIndex="-1"
            id="show-password"
            type="checkbox"
            checked={inputType === "text"}
            onChange={toggleHidePassword}
          />
          <label
            id="show-password-icon"
            htmlFor="show-password"
            style={labelStyles}
          ></label>
        </div>
        <span className="error-message">{passwordAvailableMessage}</span>

        <Tooltip
          anchorSelect="#show-password-icon"
          className="tooltip-class"
          delayShow={200}
        >
          <span>
            {inputType === "text" ? "Скрыть пароль" : "Показать пароль"}
          </span>
        </Tooltip>

        <br />
        <br />
        <div className="success-message">
          <span style={{ color: `${isSuccessSignIn ? "white" : "red"}` }}>
            {successMessage}
          </span>
        </div>
        <div className="submit-button-container">
          <input className="submit-button" type="submit" value="Войти" />
        </div>
        <div className="to-registarion">
          <span className="to-registration-label">Еще нет аккаунта?</span>
          <Link to="/auth/sign-up">
            <button className="to-registarion-button">
              Зарегистрироваться
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
