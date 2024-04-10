import React, { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "react-bootstrap";
import "./Navbar.css";
import AuthService from "../../services/AuthService";
import { useAuthContext } from "../../auth/AuthContext";

const Navbar = () => {
  const { isAuthenticated, setIsAuthenticated, isValidToken, setIsValidToken } = useAuthContext();

  const handleSignOut = () => {
    AuthService.signOut();
    setIsAuthenticated(false);
    setIsValidToken(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-dark">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          Navbar
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
                <span>Playlists</span>
              </Link>
            </li>
            <li className="nav-item">
              <a className="nav-link disabled"></a>
            </li>
            <li className="nav-item" style={{ marginLeft: "400px" }}>
              <Link className="nav-link" to="/auth/sign-in">
                <span>Sign In</span>
              </Link>
            </li>
            {isAuthenticated && (
              <li className="nav-item" style={{ marginLeft: "50px" }}>
                <Link
                  className="nav-link"
                  to="/auth/sign-in"
                  onClick={() => {
                    handleSignOut();
                  }}
                >
                  <span>Logout</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
