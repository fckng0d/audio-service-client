import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { useHistoryContext } from "../../App";
import { useAuthContext } from "../../auth/AuthContext";
import AuthService from "../../services/AuthService";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const {
    isAuthFormOpen,
    isRegistrationFormOpen,
    setIsRegistrationFormOpen,
    isMainPageOpen,
    setIsMainPageOpen,
  } = useHistoryContext();

  const {
    isAuthenticated,
    setIsAuthenticated,
    setIsValidToken,
    setIsAdminRole,
    setProfileImage,
    profileData,
    setProfileData,
  } = useAuthContext();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMainButtonHovered, setIsMainButtonHovered] = useState(false);

  const handleSignOut = () => {
    AuthService.signOut();
    setIsAuthenticated(false);
    setIsValidToken(false);
    setIsAdminRole(false);
    setProfileImage(null);
    setProfileData(null);
    navigate("/auth/sign-in");
  };

  const handleToProfile = () => {
    navigate("/profile");
  };

  useEffect(() => {
    setIsMainButtonHovered(isMainPageOpen);
  }, [isMainPageOpen]);

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{ backgroundColor: "#252525", height: "56px" }}
    >
      <div className="container-fluid">
        <Link
          className={`navbar-brand ${
            isMainButtonHovered
              ? isMainButtonHovered && isMainPageOpen
                ? " selected"
                : " hovered"
              : ""
          }`}
          to="/"
          onClick={isAuthenticated ? null : e => e.preventDefault()}
          onMouseEnter={() => setIsMainButtonHovered(true)}
          onMouseLeave={() => !isMainPageOpen && setIsMainButtonHovered(false)}
        >
          <span
            className={`main-page-span ${isMainButtonHovered && " hovered"}`}
          >
            Главная
          </span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
        // className="collapse navbar-collapse" id="navbarSupportedContent"
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link disabled"></a>
            </li>
            {!isAuthenticated && (
              <div className="auth-buttons-container">
                {/* <li className="nav-item" style={{ marginLeft: "1190px" }}> */}
                <Link
                  className={`auth-button ${
                    isRegistrationFormOpen && "hovered"
                  }`}
                  to="/auth/sign-up"
                >
                  <span>Зарегистрироваться</span>
                </Link>
                {/* </li> */}
                {/* <li className="nav-item" style={{ marginLeft: "30px" }}> */}
                <Link
                  className={`auth-button ${isAuthFormOpen && "hovered"}`}
                  to="/auth/sign-in"
                >
                  <span>Войти</span>
                </Link>
                {/* </li> */}
              </div>
            )}
            {isAuthenticated && profileData && (
              <li className="profile-icon">
                <Dropdown
                  align="end"
                  onToggle={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <Dropdown.Toggle
                    variant="link"
                    id="dropdown-basic"
                    className="nav-link"
                  >
                    {profileData.profileImage ? (
                      <img
                        className={`profile-img ${isMenuOpen && " hovered"}`}
                        id="profile-img"
                        src={`data:image/jpeg;base64, ${profileData.profileImage.data}`}
                        alt="Profile"
                      />
                    ) : (
                      <div
                        className="profile-img-placeholder"
                        id="profile-img-placeholder"
                      >
                        {profileData.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Dropdown.Toggle>
                  <Tooltip
                    anchorSelect={["#profile-img", "#profile-img-placeholder"]}
                    className="tooltip-class"
                    delayShow={200}
                    style={{ display: isMenuOpen ? "none" : "block" }}
                  >
                    {profileData.username}
                  </Tooltip>

                  <Dropdown.Menu className="profile-menu">
                    <Dropdown.Item
                      className="profile-menu-item"
                      href="#"
                      onClick={() => {
                        handleToProfile();
                      }}
                    >
                      Профиль
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="profile-menu-item"
                      href="#"
                      onClick={() => {
                        handleSignOut();
                      }}
                    >
                      Выйти
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
