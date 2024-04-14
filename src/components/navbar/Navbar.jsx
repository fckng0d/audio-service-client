import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";
import AuthService from "../../services/AuthService";
import { useAuthContext } from "../../auth/AuthContext";
import { Dropdown } from "react-bootstrap";
import { Tooltip } from "react-tooltip";

const Navbar = () => {
  const navigate = useNavigate();

  const {
    isAuthenticated,
    setIsAuthenticated,
    isValidToken,
    setIsValidToken,
    isAdminRole,
    setIsAdminRole,
    profileImage,
    profileData,
  } = useAuthContext();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = () => {
    AuthService.signOut();
    setIsAuthenticated(false);
    setIsValidToken(false);
    setIsAdminRole(false);
    navigate("/auth/sign-in");
  };

  const handleToProfile = () => {
    navigate("/profile");
  };

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{ backgroundColor: "#252525" }}
    >
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          Главная
        </a>
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
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/playlists">
                <span>Плейлисты</span>
              </Link>
            </li>
            <li className="nav-item">
              <a className="nav-link disabled"></a>
            </li>
            {!isAuthenticated && (
              <li className="nav-item" style={{ marginLeft: "1190px" }}>
                <Link className="nav-link" to="/auth/sign-in">
                  <span>Зарегестрироваться</span>
                </Link>
              </li>
            )}
            {!isAuthenticated && (
              <li className="nav-item" style={{ marginLeft: "30px" }}>
                <Link className="nav-link" to="/auth/sign-in">
                  <span>Войти</span>
                </Link>
              </li>
            )}
            {/* {isAuthenticated && (
              <li
                className="nav-item"
                style={{ marginLeft: `${isAuthenticated ? "1385px" : "30px"}` }}
              >
                <Link
                  className="nav-link"
                  to="/auth/sign-in"
                  onClick={() => {
                    handleSignOut();
                  }}
                >
                  <span>Выйти</span>
                </Link>
              </li>
            )} */}
            {isAuthenticated && (
              <li className="nav-item" style={{ marginLeft: "1448px" }}>
                <Dropdown align="end" onToggle={() => setIsMenuOpen(!isMenuOpen)}>
                  <Dropdown.Toggle
                    variant="link"
                    id="dropdown-basic"
                    className="nav-link"
                  >
                    {profileImage ? (
                      <img
                        className={`profile-img ${isMenuOpen && 'hovered'}`}
                        id="profile-img"
                        src={`data:image/jpeg;base64, ${profileImage.data}`}
                        alt="Profile"
                      />
                    ) : (
                      <div
                        className="profile-img-placeholder"
                        id="profile-img-placeholder"
                      >
                        {profileData &&
                          profileData.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Dropdown.Toggle>
                    <Tooltip
                      anchorSelect={[
                        "#profile-img",
                        "#profile-img-placeholder",
                      ]}
                      className="tooltip-class"
                      delayShow={200}
                      style={{ display: isMenuOpen ? "none" : "block" }}
                    >
                      Профиль
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
