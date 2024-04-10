import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHistoryContext } from "../../App";

const AddGlobalPlaylist = () => {
  const { setLastStateKey } = useHistoryContext();

  const [name, setName] = useState("");
  const [author, setAuthor] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setLastStateKey();
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

    const token = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiUk9MRV9VU0VSIiwiaWQiOjUsImVtYWlsIjoidXNlcjJAbWFpbC5ydSIsInN1YiI6InVzZXIyIiwiaWF0IjoxNzEyNjk1NDU1LCJleHAiOjE3MTI2OTU3NTV9.x_r_jXLKEscoPIj2oTuD2DcJaXn53Eb-9_6x8uYcqO4";

    fetch("http://localhost:8080/api/playlists/create", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          setSuccessMessage("Плейлист успешно создан!");
          setTimeout(() => {
            navigate(`/playlists`);
          }, 2000);
        }
      })
      .catch((error) => {
        console.error("Error creating playlist");
      });
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
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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

export default AddGlobalPlaylist;
