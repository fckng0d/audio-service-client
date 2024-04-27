import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAudioContext } from "../AudioContext";
import { useHistoryContext } from "../../App";
import AuthService from "../../services/AuthService";
import { useAuthContext } from "../../auth/AuthContext";
import "./UploadAudioForm.css";

const apiUrl = process.env.REACT_APP_REST_API_URL;

const UploadAudioForm = () => {
  const {
    isAuthenticated,
    setIsAuthenticated,
    isValidToken,
    setIsValidToken,
    isAdminRole,
  } = useAuthContext();

  const { setLastStateKey } = useHistoryContext();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genres, setGenres] = useState([]);
  const [duration, setDuration] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    setIsUploadedAudioFile,
    currentPlaylistId,
    playlistData,
    updatePlaylist,
    setCurrentTrackIndex,
    currentTrack,
  } = useAudioContext();

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
    loadDefaultImage();
  }, []);

  const handleGenreChange = (e, index) => {
    const newGenres = [...genres];
    newGenres[index] = e.target.value;
    setGenres(newGenres);
  };

  const addGenreInput = () => {
    setGenres([...genres, ""]);
  };

  const loadDefaultImage = () => {
    const imageToBlob = (image, callback) => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, image.width, image.height);

      canvas.toBlob((blob) => {
        callback(blob);
      }, "image/jpeg");
    };

    const image = new Image();
    image.onload = () => {
      imageToBlob(image, (blob) => {
        const file = new File([blob], "default-image.jpg", {
          type: "image/jpeg",
        });
        setImageFile(file);
      });
    };
    image.src = "/image/note.png";
    image.alt = "default image";
  };

  const handleFileChange = (e) => {
    if (e.target.name === "audioFile" && e.target.files[0] instanceof File) {
      const file = e.target.files[0];

      const audio = new Audio();
      audio.src = URL.createObjectURL(file);

      audio.addEventListener("error", () => {
        setAudioFile(null);
        setSuccessMessage("Аудиофайл поврежден");
      });

      audio.addEventListener("canplaythrough", () => {
        setAudioFile(file);
        getAudioDuration();
        setSuccessMessage("");
      });
    } else if (
      e.target.name === "imageFile" &&
      e.target.files[0] instanceof File
    ) {
      const file = e.target.files[0];
      const maxSizeKB = 1024;

      const reader = new FileReader();

      reader.onload = (event) => {
        const fileSizeKB = event.total / maxSizeKB;

        if (fileSizeKB > maxSizeKB) {
          console.log("Сжатие файла");
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const scaleFactor = maxSizeKB / fileSizeKB;
            canvas.width = img.width * scaleFactor;
            canvas.height = img.height * scaleFactor;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
              });
              setImageFile(compressedFile);
            }, file.type);
          };
          img.src = event.target.result;
        } else {
          setImageFile(file);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!audioFile || !imageFile || title === "" || author === "") {
      // setSuccessMessage("Заполните все поля!");
      return;
    }

    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("author", author.trim());
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
          return response.json();
        }
        return null;
      })
      .then((data) => {
        if (data) {
          console.log("Audio file uploaded successfully");
          setSuccessMessage("Аудиофайл успешно загружен!");

          console.log(data);
          if (playlistData.id === id) {
            const updatedAudioFiles = [...playlistData.audioFiles];
            updatedAudioFiles.unshift(data);

            for (let i = 0; i < updatedAudioFiles.length; i++) {
              updatedAudioFiles[i].indexInPlaylist = i;
            }

            let countOfAudioIncrement = 1;
            let audioDuration = data.duration;

            const updatedPlaylistData = {
              ...playlistData,
              countOfAudio: playlistData.countOfAudio + countOfAudioIncrement,
              duration: playlistData.duration + audioDuration,
              audioFiles: updatedAudioFiles,
            };

            setIsUploadedAudioFile(true);
            updatePlaylist(updatedPlaylistData);

            console.log(updatedPlaylistData);

            const currentTrackId = currentTrack ? currentTrack.id : null;
            const newCurrentTrackIndex =
              updatedPlaylistData.audioFiles.findIndex(
                (file) => file.id === currentTrackId
              );

            setCurrentTrackIndex(newCurrentTrackIndex);
          }

          setTimeout(() => {
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
          <form
            className="form-data"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >
            <input
              className="input-field"
              type="text"
              name="title"
              placeholder="Название"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              tabIndex={1}
            />
            <input
              className="input-field"
              type="text"
              name="author"
              placeholder="Автор"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              tabIndex={2}
            />
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
            </button> */}
            <div className="file-input-container">
              <input
                className="file-input"
                type="file"
                name="audioFile"
                id="uploadAudio"
                onChange={handleFileChange}
                accept="audio/*"
                style={{ display: "none" }}
              />
              <label
                className="file-input-label"
                htmlFor="uploadAudio"
                tabIndex={3}
              >
                Выберите аудиофайл
              </label>
              <p className="file-name">
                {audioFile ? audioFile.name : "Аудиофайл не выбран"}
              </p>
            </div>
            <div className="file-input-container">
              <label
                className="file-input-label"
                htmlFor="uploadImage"
                tabIndex={4}
              >
                Выберите изображение
              </label>
              <input
                className="file-input"
                type="file"
                name="imageFile"
                id="uploadImage"
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: "none" }}
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
              {/* <p className="file-name">{imageFile ? imageFile.name : "Изображение не выбрано"}</p> */}
            </div>
            <div className="submit-container">
              <input
                className="submit-btn"
                type="submit"
                value="Загрузить"
                tabIndex={5}
              />
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
