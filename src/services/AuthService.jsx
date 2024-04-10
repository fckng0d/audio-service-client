import { useNavigate } from "react-router-dom";

const AuthService = {
  async signIn(username, password) {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/sign-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        throw new Error("Ошибка аутентификации");
      }
      const data = await response.json();
      const token = data.token;
      localStorage.setItem("token", token);
      //   return token;
      return true;
    } catch (error) {
      throw new Error("Ошибка аутентификации");
    }
  },

  getAuthToken() {
    // console.log(localStorage.getItem("token"));
    return localStorage.getItem("token");
  },

  signOut() {
    localStorage.removeItem("token");
  },

  isAuthenticated() {
    return localStorage.getItem("token") !== null;
  },

  isValideToken(navigate) {
    setTimeout(() => {
      const token = localStorage.getItem("token");
      // if (!token) {
      //   navigate("/auth/sign-in");
      //   return false;
      // }
      async function validateToken() {
        try {
          const response = await fetch(
            `http://localhost:8080/api/auth/validate-token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ token }),
            }
          );
          if (!response.ok) {
            navigate("/auth/sign-in");
            return false;
          }
          return true;
        } catch (error) {
          console.error("Ошибка валидации токена:", error);
          navigate("/auth/sign-in");
          return false;
        }
      }
      return validateToken();
    }, 0);
  },
};

export default AuthService;
