import React, { createContext, useEffect, useState, useContext } from "react";
import PropTypes from "prop-types"; 
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
  const [isAdminRole, setIsAdminRole] = useState(AuthService.isAdminRole());

  useEffect(() => {
    setIsAuthenticated(AuthService.isAuthenticated());
    // setIsValidToken(AuthService.isValideToken());
    // setIsAdminRole(AuthService.isAdminRole());
  }, [isAuthenticated
    // , isValidToken, isAdminRole
  ]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        isValidToken,
        setIsValidToken,
        isAdminRole,
        setIsAdminRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
