import React, { createContext, useEffect, useState, useContext } from "react";
import PropTypes from "prop-types"; // Импортируем PropTypes
import AuthService from "../services/AuthService";

const AuthContext = createContext();
export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    AuthService.isAuthenticated()
  );
  const [isValidToken, setIsValidToken] = useState(
    AuthService.isAuthenticated()
  );

  useEffect(() => {
    setIsAuthenticated(AuthService.isAuthenticated());
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        isValidToken,
        setIsValidToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
