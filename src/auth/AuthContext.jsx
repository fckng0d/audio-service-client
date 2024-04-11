import React, { createContext, useEffect, useState, useContext } from "react";
import PropTypes from "prop-types";
import AuthService from "../services/AuthService";
// import { useNavigate } from "react-router-dom";

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
  const [isTokenExists, setIsTokenExists] = useState(AuthService.isAuthenticated());

  // const navigate = useNavigate();

  useEffect(() => {
    // setIsAuthenticated(AuthService.isAuthenticated());
    // setTimeout(() => {
      AuthService.isValideToken2().then((result) => {
        setIsAuthenticated(result);
        if (!result) {
          AuthService.signOut();
          // setIsValidToken(false);
          // setIsAdminRole(false);
          // window.location.href = '/auth/sign-in';
        }
      });
    // }, 1000); // Задержка в 100 миллисекунд
    

    // console.log(AuthService.isValideToken2().PromiseResult);
    // if (!isAuthenticated) {
    //   AuthService.isValideToken2().then((result) => {
    //     setIsValidToken(result);
    //   });
    // }
  }, [
    isAuthenticated,
    // , isValidToken, isAdminRole
  ]);

  // useEffect(() => {
  //   AuthService.isValideToken2().then(result => {
  //     setIsValidToken(result);
  //   });;
  // }, [])

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
