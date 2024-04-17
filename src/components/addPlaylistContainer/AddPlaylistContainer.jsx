import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHistoryContext } from "../../App";
import AuthService from "../../services/AuthService";
import { useAuthContext } from "../../auth/AuthContext";

const AddPlaylistContainer = () => {
  const { isAuthenticated, setIsAuthenticated, isValidToken, setIsValidToken, isAdminRole } =
    useAuthContext();

  const { setLastStateKey } = useHistoryContext();

  const { id } = useParams();
  
  const [name, setName] = useState("");
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

      if (!AuthService.valideAdminRole(navigate)) {
        return;
      }
    // }

    setIsValidToken(true);

    setLastStateKey();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);

    fetch(`http://localhost:8080/api/public/playlistContainers/create`, {
      headers: {
        Authorization: `Bearer ${AuthService.getAuthToken()}`,
      },
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          setSuccessMessage("Контейнер успешно создан!");
          setTimeout(() => {
            navigate(`/`);
          }, 2000);
        }
      })
      .catch((error) => {
        console.error("Error creating playlist");
      });
  };

  return (
    <>
      {isAuthenticated && isAdminRole && (
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "20px"
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

export default AddPlaylistContainer;
