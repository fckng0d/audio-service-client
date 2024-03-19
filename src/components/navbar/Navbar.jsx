import React from "react";
import { Link } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "react-bootstrap";
 import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-dark"> {/* Заменяем bg-light на bg-secondary */}
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
        {/* <li className="nav-item">
          <Link className="nav-link" to="/audio">
            <span>Songs</span>
          </Link>
        </li> */}
        <li className="nav-item">
          <Link className="nav-link" to="/audio/upload">
            <span>Upload</span>
          </Link>
        </li>
        <li className="nav-item">
          <a className="nav-link disabled">Disabled</a>
        </li>
      </ul>
    </div>
  </div>
</nav>

  );
};

export default Navbar;
