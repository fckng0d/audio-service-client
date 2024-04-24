import React, { createContext, useEffect, useState, useContext } from "react";
import PropTypes from "prop-types";
import AuthService from "../services/AuthService";
// import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
const apiUrl = process.env.REACT_APP_REST_API_URL;

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    AuthService.isAuthenticated()
  );
  const [isValidToken, setIsValidToken] = useState(
    AuthService.isAuthenticated()
  );
  const [isAdminRole, setIsAdminRole] = useState(AuthService.isAdminRole());
  const [isTokenExists, setIsTokenExists] = useState(
    AuthService.isAuthenticated()
  );

  const [profileImage, setProfileImage] = useState(null);
  const [isProfileImageUpdated, setIsProfileImageUpdated] = useState(false);
  const [isProfileImageDeleted, setIsProfileImageDeleted] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const [favoriteContainerId, setFavoriteContainerId] = useState(null);

  useEffect(() => {
    setIsAuthenticated(AuthService.isAuthenticated());
    setIsProfileImageUpdated(false);
    // setTimeout(() => {
    AuthService.isValideToken2().then((result) => {
      setIsAuthenticated(result);
      if (!result) {
        AuthService.signOut();
        document.title = "Audio Service";
      } else {
        fetchProfileData();
      }
    });
  }, [isAuthenticated, isProfileImageUpdated]);

  const fetchProfileData = () => {
    fetch(`${apiUrl}/api/profile`, {
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
  };

  return (
    <AuthContext.Provider
      value={{
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
        setIsProfileImageUpdated,
        setIsProfileImageDeleted,
        fetchProfileData,
        favoriteContainerId,
        setFavoriteContainerId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
