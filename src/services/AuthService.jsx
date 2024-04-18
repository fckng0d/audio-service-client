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
        // const profileImage = data.profileImage;
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        // localStorage.setItem("profileImage", profileImage);
        //   return token;
        return true;
      }
    } catch (error) {
      throw new Error("Ошибка аутентификации");
    }
  },

  async signUp(username, email, password) {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/sign-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      if (!response.ok) {
        return false;
      }
      if (response.ok) {
        const data = await response.json();
        const token = data.token;
        const role = data.role;

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        return true;
      }
    } catch (error) {
      throw new Error("Ошибка регистрации");
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

  valideAdminRole(navigate) {
    console.log(localStorage.getItem("role") == "ROLE_ADMIN")
    if (this.isAdminRole()) {
      return true;
    } else {
      navigate("/auth/sign-in");
      return false;
    }
  },

  signOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    if (localStorage.getItem("token" !== null)) {
      window.location.href = "/auth/sign-in";
    }
  },

  isAuthenticated() {
    return localStorage.getItem("token") !== null;
    //  && this.isValideToken2();
    // return validateToken();
  },

  async isValideToken(navigate) {
    try {
      const token = localStorage.getItem("token");
      if (token === null) {
        localStorage.removeItem("token");
        navigate("/auth/sign-in");
        return false;
      }

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
        localStorage.removeItem("token");
        navigate("/auth/sign-in");
        // console.log("error");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Ошибка валидации токена:", error);
      localStorage.removeItem("token");
      navigate("/auth/sign-in");
      return false;
    }
  },

  async isValideToken2() {
    try {
      const token = localStorage.getItem("token");
      if (token === null) {
        localStorage.removeItem("token");
        return false;
      }

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
        localStorage.removeItem("token");
        console.log("error");
        return false;
      }

      return true;
    } catch (error) {
      localStorage.removeItem("token");
      console.error("Ошибка валидации токена:", error);
      return false;
    }
  },
};

export default AuthService;
