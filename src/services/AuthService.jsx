const apiUrl = process.env.REACT_APP_REST_API_URL;

const AuthService = {
  async signIn(identifier, password) {
    try {
      const response = await fetch(`${apiUrl}/api/auth/sign-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });
      if (response.status === 409) {
        return false;
      }
      if (response.ok) {
        // localStorage.removeItem("token");
        const data = await response.json();
        const token = data.token;
        // const profileImage = data.profileImage;
        localStorage.setItem("token", token);
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
      const response = await fetch(`${apiUrl}/api/auth/sign-up`, {
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

        localStorage.setItem("token", token);
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
    try {
      const isAdmin = this.fetchCheckAdminRole();
      return isAdmin;
    } catch (error) {
      // console.error("Ошибка при проверке роли администратора:", error);
      return false;
    }
  },

  fetchCheckAdminRole() {
    try {
      return fetch(`${apiUrl}/api/auth/check-admin-role`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log("data = ", data);
          return data ?? false;
        })
        .catch((error) => {
          // console.error("Ошибка доступа:", error);
          return false;
        });
    } catch (error) {
      // console.error("Ошибка при выполнении запроса:", error);
      return false;
    }
  },

  async valideAdminRole(navigate) {
    try {
      const isAdmin = await this.isAdminRole();
      if (!isAdmin) {
        navigate("/auth/sign-in", { replace: true });
      }
      return isAdmin;
    } catch (error) {
      console.error("Ошибка доступа");
      return false;
    }
  },

  signOut() {
    localStorage.removeItem("token");
    if (localStorage.getItem("token" !== null)) {
      window.location.href = "/auth/sign-in";
    }
    document.title = "Audio Service";
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
        document.title = "Audio Service";
        navigate("/auth/sign-in");
        return false;
      }

      const response = await fetch(`${apiUrl}/api/auth/validate-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        navigate("/auth/sign-in");
        document.title = "Audio Service";
        localStorage.removeItem("token");
        // console.log("error");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Ошибка валидации токена:", error);
      localStorage.removeItem("token");
      document.title = "Audio Service";
      navigate("/auth/sign-in");
      return false;
    }
  },

  async isValideToken2() {
    try {
      const token = localStorage.getItem("token");
      if (token === null) {
        localStorage.removeItem("token");
        document.title = "Audio Service";
        return false;
      }

      const response = await fetch(`${apiUrl}/api/auth/validate-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        localStorage.removeItem("token");
        // console.log("error");
        return false;
      }

      return true;
    } catch (error) {
      localStorage.removeItem("token");
      document.title = "Audio Service";
      console.error("Ошибка валидации токена:", error);
      return false;
    }
  },
};

export default AuthService;
