import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHistoryContext } from "../../App";
import AuthService from "../../services/AuthService";
import { useAuthContext } from "../../auth/AuthContext";

const AuthForm = () => {
  const { setLastStateKey } = useHistoryContext();

  const { isAuthenticated, setIsAuthenticated, isValidToken, setIsValidToken } =
    useAuthContext();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  //   const [imageFile, setImageFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setLastStateKey();
  }, []);

  //   const handleFileChange = (e) => {
  //     if (e.target.name === "audioFile") {
  //       setAudioFile(e.target.files[0]);
  //       getAudioDuration();
  //     } else if (e.target.name === "imageFile") {
  //       setImageFile(e.target.files[0]);
  //     }
  //   };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    // formData.append("imageFile", imageFile);

    if (AuthService.signIn(username, password)) {
      setSuccessMessage("Авторизация успешна!");
      setTimeout(() => {
        setIsAuthenticated(true);
        setIsValidToken(true);
        navigate(`/playlists`);
      }, 2000);
    }
  };

  const resetForm = () => {
    setName("");
    setAuthor("");
    setImageFile(null);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "10px",
        color: "whitesmoke",
      }}
    >
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          style={{ width: "100%" }}
          type="text"
          name="name"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          style={{ width: "100%", marginTop: "10px" }}
          type="text"
          name="author"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <br />
        {/* <div>
          <label htmlFor="imageFile">Загрузите изображение:</label> <br />
          <input
            type="file"
            name="imageFile"
            id="uploadImage"
            onChange={handleFileChange}
          />
          {imageFile && (
            <div
              style={{
                marginTop: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                style={{ width: 200 }}
                src={URL.createObjectURL(imageFile)}
                alt="Uploaded Image"
              />
            </div>
          )}
        </div>{" "}
        <br /> */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <input type="submit" value="Create" />
        </div>
        <div
          className="success-message"
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 18, marginLeft: 7 }}>{successMessage}</span>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
