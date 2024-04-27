import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useHistoryContext } from "../../App";
import AuthService from "../../services/AuthService";
import { useAuthContext } from "../../auth/AuthContext";
import { useAudioContext } from "../AudioContext";
import { Tooltip } from "react-tooltip";
import { Link } from "react-router-dom";
import "./RegistrationForm.css";

const RegistrationForm = () => {
  const apiUrl = process.env.REACT_APP_REST_API_URL;

  const { setLastStateKey, setIsRegistrarionFormOpen } = useHistoryContext();

  const { setIsAuthenticated, setIsValidToken, setIsAdminRole } =
    useAuthContext();

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

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  //   const [imageFile, setImageFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccessRegistration, setIsSuccessRegistration] = useState(false);

  const [usernameAvailableMessage, setUsernameAvailableMessage] = useState("");
  const [emailAvailableMessage, setEmailAvailableMessage] = useState("");
  const [passwordAvailableMessage, setPasswordAvailableMessage] = useState("");
  const [confirmPasswordAvailableMessage, setConfirmPasswordAvailableMessage] =
    useState("");

  const [passwordInputType, setPasswordInputType] = useState("password");
  const [confirmPasswordInputType, setConfirmPasswordInputType] =
    useState("password");

  const navigate = useNavigate();
  const timerIdRef = useRef(null);

  useEffect(() => {
    setIsRegistrarionFormOpen(true);
    setLastStateKey();

    return () => {
      setIsRegistrarionFormOpen(false);
      timerIdRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current);
    }

    timerIdRef.current = setTimeout(() => {
      setSuccessMessage("");
      setIsSuccessRegistration(false);
    }, 4000);

    return () => clearTimeout(timerIdRef.current);
  }, [successMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const isUsernameAvailable = await checkUsernameAvailability(username);
      const isEmailAvailable = await checkEmailAvailability(email);
      const isPasswordAvailable = validatePassword(password);
      const isConfirmPasswordAvailable =
        validateConfirmPassword(confirmPassword);

      if (
        isUsernameAvailable &&
        isEmailAvailable &&
        isPasswordAvailable &&
        isConfirmPasswordAvailable
      ) {
        const formData = new FormData();
        formData.append("username", username.trim());
        formData.append("email", email.trim());
        formData.append("password", password.trim());

        AuthService.signUp(username, email, password)
          .then((isSignedUp) => {
            if (isSignedUp) {
              setIsSuccessRegistration(true);
              resetAudioContext();
              setSuccessMessage("Регистрация успешна!");
              setTimeout(() => {
                setIsAuthenticated(true);
                setIsValidToken(true);
                setIsAdminRole(AuthService.isAdminRole());
                navigate(`/`);
              }, 2000);
            } else {
              setSuccessMessage("Ошибка регистрации");
              setIsSuccessRegistration(false);
            }
          })
          .catch((error) => {
            setSuccessMessage("Ошибка регистрации");
            setIsSuccessRegistration(false);
          });
      } else {
        console.log("Имя пользователя или адрес электронной почты уже заняты");
      }
    } catch (error) {
      console.error(
        "Ошибка при проверке доступности имени пользователя или адреса электронной почты:",
        error
      );
      setSuccessMessage("Ошибка регистрации");
      setIsSuccessRegistration(false);
    }
  };

  const checkUsernameAvailability = async (username) => {
    if (!validateUsername(username)) {
      return false;
    }

    try {
      const formData = new FormData();
      formData.append("username", username.trim());
      const response = await fetch(
        `${apiUrl}/api/auth/sign-up/is-exists/username`,
        {
          method: "POST",
          // headers: {
          //   Authorization: `Bearer ${AuthService.getAuthToken()}`,
          // },
          body: formData,
        }
      );

      if (response.status === 409) {
        setUsernameAvailableMessage("Имя пользователя уже занято");
        return false;
      }

      return true;
    } catch (error) {
      console.error(
        "Ошибка при проверке доступности имени пользователя:",
        error
      );
      setSuccessMessage("Ошибка регистрации");
      return false;
    }
  };

  const checkEmailAvailability = async (email) => {
    if (!validateEmail(email)) {
      return false;
    }

    try {
      const formData = new FormData();
      formData.append("email", email.trim());

      console.log(email);

      const response = await fetch(
        `${apiUrl}/api/auth/sign-up/is-exists/email`,
        {
          method: "POST",
          // headers: {
          //   Authorization: `Bearer ${AuthService.getAuthToken()}`,
          // },
          body: formData,
        }
      );

      if (response.status === 409) {
        setEmailAvailableMessage("Электронный адрес уже занят");
        return false;
      }

      return true;
    } catch (error) {
      setSuccessMessage("Ошибка регистрации");
      return false;
    }
  };

  const validateUsername = (username) => {
    let regUsernmae = /^[a-zA-Z0-9]+$/;

    if (username.length === 0) {
      setUsernameAvailableMessage("Заполните поле");
      return false;
    } else if (username.length < 5 || username.length > 255) {
      setUsernameAvailableMessage("Поле должно содержать от 5 до 50 символов");
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

  const validateEmail = (email) => {
    let regEmail = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]{2,}\.[A-Za-z]{2,})$/;

    if (email.length === 0) {
      setEmailAvailableMessage("Заполните поле");
      return false;
    } else if (!regEmail.test(email)) {
      setEmailAvailableMessage(
        "Электронная почта должна быть в формете 'user@example.com'"
      );
      return false;
    } else if (email.length > 255) {
      setEmailAvailableMessage("Поле должно содержать до 255 символов");
      return false;
    } else {
      setEmailAvailableMessage("");
      return true;
    }
  };

  const validatePassword = (password) => {
    if (password === confirmPassword) {
      setConfirmPasswordAvailableMessage("");
    } else {
      setConfirmPasswordAvailableMessage("Пароли не совпадают");
    }

    if (password.length === 0) {
      setPasswordAvailableMessage("Заполните поле");
      return false;
    } else if (password.length < 8 || password.length > 255) {
      setPasswordAvailableMessage("Поле должно содержать от 8 до 255 символов");
      return false;
    } else {
      setPasswordAvailableMessage("");
      return true;
    }
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (password !== confirmPassword) {
      setConfirmPasswordAvailableMessage("Пароли не совпадают");
      return false;
    } else {
      setConfirmPasswordAvailableMessage("");
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

  const toggleHidePassword = () => {
    setPasswordInputType(
      passwordInputType === "password" ? "text" : "password"
    );
  };

  const toggleHideConfirmPassword = () => {
    setConfirmPasswordInputType(
      confirmPasswordInputType === "password" ? "text" : "password"
    );
  };

  const passwordLabelStyles = {
    backgroundImage: `url(${
      passwordInputType === "text" ? "/image/show-password.png" : "/image/hide-password.png"
    })`,
  };

  const confirmPassworddLabelStyles = {
    backgroundImage: `url(${
      confirmPasswordInputType === "text"
        ? "/image/show-password.png"
        : "/image/hide-password.png"
    })`,
  };

  return (
    <div className="registration-container">
      <form
        className="form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <h3>Регистрация</h3>
        <input
          className="input"
          type="text"
          name="username"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            validateUsername(e.target.value);
          }}
        />
        <span className="error-message">{usernameAvailableMessage}</span>

        <br />
        <input
          className="input"
          type="text"
          name="email"
          placeholder="Электронная почта"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            validateEmail(e.target.value);
          }}
        />
        <span className="error-message">{emailAvailableMessage}</span>

        <br />
        <div className="input-password">
          <input
            className="input"
            type={passwordInputType}
            name="password"
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
            name="password"
            type="checkbox"
            checked={passwordInputType === "text"}
            onChange={toggleHidePassword}
          />
          <label
            id="show-password-icon"
            htmlFor="show-password"
            style={passwordLabelStyles}
          ></label>
        </div>
        <span className="error-message">{passwordAvailableMessage}</span>
        <Tooltip
          anchorSelect="#show-password-icon"
          className="tooltip-class"
          delayShow={200}
        >
          <span>{passwordInputType === "text" ? "Скрыть пароль" : "Показать пароль"}</span>
        </Tooltip>
        
        <br />
        <div className="input-password">
          <input
            className="input"
            type={confirmPasswordInputType}
            name="confirmPassword"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              validateConfirmPassword(e.target.value);
            }}
          />

          <input
            tabIndex="-1"
            id="show-confirm-password"
            name="confirmPassword"
            type="checkbox"
            checked={confirmPasswordInputType === "text"}
            onChange={toggleHideConfirmPassword}
          />
          <label
            id="show-confirm-password-icon"
            htmlFor="show-confirm-password"
            style={confirmPassworddLabelStyles}
          ></label>
        </div>
        <span className="error-message">{confirmPasswordAvailableMessage}</span>

        <Tooltip
          anchorSelect="#show-confirm-password-icon"
          className="tooltip-class"
          delayShow={200}
        >
          <span>{confirmPasswordInputType === "text" ? "Скрыть пароль" : "Показать пароль"}</span>
        </Tooltip>

        <br />
        <div className="success-message">
          <span style={{color: `${isSuccessRegistration ? 'white' : 'red'}`}}>{successMessage}</span>
        </div>
        <div className="submit-button-container">
          <input
            className="submit-button"
            type="submit"
            value="Зарегистрироваться"
          />
        </div>
        <div className="to-sing-in">
          <span className="to-sing-in-label">Уже есть аккаунт?</span>
          <Link to="/auth/sign-in">
            <button className="to-sing-in-button">Войти</button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
