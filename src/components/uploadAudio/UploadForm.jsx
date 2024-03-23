import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const UploadForm = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genres, setGenres] = useState([]);
  const [duration, setDuration] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();

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
    formData.append("genres", JSON.stringify(genres));
    formData.append("duration", parseFloat(duration));
    console.log(title + " " + author + " " + audioFile + " " + imageFile);
    fetch(`http://localhost:8080/api/playlists/${id}/upload`, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          console.log("Audio file uploaded successfully");
          setSuccessMessage("Аудиофайл успешно загружен!");
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
    setGenres([]);
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "10px",
      }}
    >
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          style={{ width: "100%" }}
          type="text"
          name="title"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <input
          style={{ width: "100%", marginTop: "10px" }}
          type="text"
          name="author"
          placeholder="Enter author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <br />
        <br />
        {genres.map((genre, index) => (
          <input
            key={index}
            type="text"
            value={genre}
            onChange={(e) => handleGenreChange(e, index)}
            placeholder="Enter genre"
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
        <button type="button" onClick={addGenreInput}>
          Add Genre
        </button>
        <br />
        <br />
        <div>
          <label htmlFor="audioFile">Загрузите аудиофайл:</label> <br />
          <input
            type="file"
            name="audioFile"
            id="uploadAudio"
            onChange={handleFileChange}
          />
          <br /> <br />
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
          <input type="submit" value="Upload" />
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

export default UploadForm;
