import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHistoryContext } from "../../App";
import AuthService from "../../services/AuthService";
import { useAuthContext } from "../../auth/AuthContext";

const apiUrl = process.env.REACT_APP_REST_API_URL;

const AddUserPlaylist = () => {
  const {
    isAuthenticated,
    setIsAuthenticated,
    isValidToken,
    setIsValidToken,
    isAdminRole,
  } = useAuthContext();


  const { setLastStateKey, setIsFavoritesOpen } = useHistoryContext();

  //   const { id } = useParams();

  const [name, setName] = useState("");
  const [author, setAuthor] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // if (!isValidToken) {
    AuthService.isValideToken(navigate).then((result) => {
      if (!result) {
        setIsValidToken(false);
        return;
      }
    });

    // if (!AuthService.valideAdminRole(navigate)) {
    //   return;
    // }
    // }

    setIsValidToken(true);

    setIsFavoritesOpen(true);

    setLastStateKey();

    return () => {
      setIsFavoritesOpen(false);
    };
  }, []);

  const handleFileChange = (e) => {
    if (e.target.name === "audioFile") {
      setAudioFile(e.target.files[0]);
      getAudioDuration();
    } else if (e.target.name === "imageFile") {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("author", author);
    formData.append("imageFile", imageFile);

    fetch(`${apiUrl}/api/favorites/playlists/create`, {
      headers: {
        Authorization: `Bearer ${AuthService.getAuthToken()}`,
      },
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          setSuccessMessage("Плейлист успешно создан!");
          setTimeout(() => {
            navigate(`/favorites/playlists`);
          }, 2000);
        } else if (response.status === 409) {
          setSuccessMessage("Максимальное количество плейлистов в избранном - 100");
          setTimeout(() => {
            navigate(`/favorites/playlists`);
          }, 4000);
        }
      })
      .catch((error) => {
        console.error("Error creating playlist");
      });
  };

  return (
    <>
      {isAuthenticated && (
        // isValidToken
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
              placeholder="Название"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <br />
            <input
              style={{ width: "100%", marginTop: "10px" }}
              type="text"
              name="author"
              placeholder="Автор"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
            <br />
            <br />
            <div>
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
            <br />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <input type="submit" value="Создать" />
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
              <span style={{ fontSize: 18, marginLeft: 7 }}>
                {successMessage}
              </span>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AddUserPlaylist;
