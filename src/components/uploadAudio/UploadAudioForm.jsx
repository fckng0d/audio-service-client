import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAudioContext } from "../AudioContext";
import { useHistoryContext } from "../../App";
import AuthService from "../../services/AuthService";
import { useAuthContext } from "../../auth/AuthContext";
import "./UploadAudioForm.css";

const apiUrl = process.env.REACT_APP_REST_API_URL;

const UploadAudioForm = () => {
  const { isAuthenticated, setIsAuthenticated, isValidToken, setIsValidToken, isAdminRole } =
    useAuthContext();

  const { setLastStateKey } = useHistoryContext();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genres, setGenres] = useState([]);
  const [duration, setDuration] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const { setIsUploadedAudioFile, currentPlaylistId } = useAudioContext();

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // if (!isValidToken) {
    AuthService.isValideToken(navigate).then((result) => {
      if (!result) {
        setIsValidToken(false);
        return;
      }
    });

    if (!AuthService.valideAdminRole(navigate)) {
      return;
    }
    // }

    setIsValidToken(true);

    setLastStateKey();
  }, []);

  const handleGenreChange = (e, index) => {
    const newGenres = [...genres];
    newGenres[index] = e.target.value;
    setGenres(newGenres);
  };

  const addGenreInput = () => {
    setGenres([...genres, ""]);
  };

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
    formData.append("title", title);
    formData.append("author", author);
    formData.append("audioFile", audioFile);
    formData.append("imageFile", imageFile);
    // formData.append("genres", JSON.stringify(genres));
    formData.append("duration", parseFloat(duration));
    console.log(title + " " + author + " " + audioFile + " " + imageFile);
    
    fetch(`${apiUrl}/api/playlists/${id}/upload`, {
      headers: {
        Authorization: `Bearer ${AuthService.getAuthToken()}`,
      },
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          console.log("Audio file uploaded successfully");
          setSuccessMessage("Аудиофайл успешно загружен!");
          setTimeout(() => {
            setIsUploadedAudioFile(true);
            navigate(`/playlists/${id}`);
          }, 2000);
        }
      })
      .catch((error) => {
        setSuccessMessage("Возникла ошибка при загрузке!");
        console.error("Error uploading audio file");
      });
  };

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    // setGenres([]);
    setDuration("");
    setAudioFile(null);
    setImageFile(null);
  };

  function getAudioDuration() {
    const audioFile = document.querySelector('input[name="audioFile"]')
      .files[0];

    const audio = new Audio();
    audio.src = URL.createObjectURL(audioFile);

    audio.addEventListener("loadedmetadata", function () {
      const duration = audio.duration;
      setDuration(duration);
    });
  }

  return (
    <>
      {isAuthenticated && isAdminRole && (
        // isValidToken
        <div className="container">
          <form className="form-data" onSubmit={handleSubmit} encType="multipart/form-data">
            <input
              className="input-field"
              type="text"
              name="title"
              placeholder="Название"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <br />
            <input
              className="input-field"
              type="text"
              name="author"
              placeholder="Автор"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
            <br />
            <br />
            {genres.map((genre, index) => (
              <input
                key={index}
                className="input-field"
                type="text"
                value={genre}
                onChange={(e) => handleGenreChange(e, index)}
                placeholder="Жанр"
              />
            ))}
            <input
              type="text"
              name="duration"
              id="durationInput"
              value={duration}
              onChange={(e) => null}
              hidden
            ></input>
            {/* <button className="add-genre-btn" type="button" onClick={addGenreInput}>
              Добавить жанр
            </button>
            <br />
            <br /> */}
            <div className="file-input-container">
              <label className="file-label" htmlFor="audioFile">
                Загрузите аудиофайл:
              </label>{" "}
              <br />
              <input
                className="file-input"
                type="file"
                name="audioFile"
                id="uploadAudio"
                onChange={handleFileChange}
              />
            </div>
            <br />
            <div className="file-input-container">
              <label className="file-label" htmlFor="imageFile">
                Загрузите изображение:
              </label>{" "}
              <br />
              <input
                className="file-input"
                type="file"
                name="imageFile"
                id="uploadImage"
                onChange={handleFileChange}
              />
              {imageFile && (
                <div className="image-preview">
                  <img
                    className="preview-img"
                    src={URL.createObjectURL(imageFile)}
                    alt="Uploaded Image"
                  />
                </div>
              )}
            </div>{" "}
            <br />
            <div className="submit-container">
              <input className="submit-btn" type="submit" value="Загрузить" />
            </div>
            <div className="success-message">
              <span className="message-text">{successMessage}</span>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default UploadAudioForm;
