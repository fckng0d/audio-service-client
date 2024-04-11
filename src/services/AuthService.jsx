import { useNavigate } from "react-router-dom";

const AuthService = {
  async signIn(identifier, password) {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/sign-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });
      if (!response.ok) {
        // throw new Error("Ошибка аутентификации");
        return false;
      }
      if (response.ok) {
        // localStorage.removeItem("token");
        // localStorage.removeItem("role");
        const data = await response.json();
        const token = data.token;
        const role = data.role;
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        //   return token;
        return true;
      }
    } catch (error) {
      throw new Error("Ошибка аутентификации");
    }
  },

  getAuthToken() {
    // console.log(localStorage.getItem("token"));
    return localStorage.getItem("token");
  },

  isAdminRole() {
    // console.log(localStorage.getItem("role") === "ROLE_ADMIN")
    return localStorage.getItem("role") == "ROLE_ADMIN";
  },

  signOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
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
