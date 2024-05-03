// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useHistoryContext } from "../../App";
// import AuthService from "../../services/AuthService";
// import ImageService from "../../services/ImageService";
// import { Tooltip } from "react-tooltip";
// import { useAuthContext } from "../../auth/AuthContext";

// const apiUrl = process.env.REACT_APP_REST_API_URL;

// const AddGlobalPlaylist = () => {
//   const {
//     isAuthenticated,
//     setIsAuthenticated,
//     isValidToken,
//     setIsValidToken,
//     isAdminRole,
//   } = useAuthContext();

//   const { setLastStateKey } = useHistoryContext();

//   const { id } = useParams();

//   const [name, setName] = useState("");
//   const [author, setAuthor] = useState("");
//   const [imageFile, setImageFile] = useState(null);
//   const [successMessage, setSuccessMessage] = useState("");

//   const [isVisibleTooltip, setIsVisibleTooltip] = useState(false);
//   const [isSelectedDefaultImg, setIsSelectedDefaultImg] = useState(true);

//   const [isAddButtonClicked, setIsAddButtonClicked] = useState(false);

//   const navigate = useNavigate();

//   useEffect(() => {
//     // if (!isValidToken) {
//     AuthService.isValideToken(navigate).then((result) => {
//       if (!result) {
//         setIsValidToken(false);
//         return;
//       }
//     });

//     if (!AuthService.valideAdminRole(navigate)) {
//       return;
//     }
//     // }

//     setIsValidToken(true);

//     setLastStateKey();
//     loadDefaultImage();
//   }, []);

//   const loadDefaultImage = () => {
//     const imageToBlob = (image, callback) => {
//       const canvas = document.createElement("canvas");
//       canvas.width = image.width;
//       canvas.height = image.height;

//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(image, 0, 0, image.width, image.height);

//       canvas.toBlob((blob) => {
//         callback(blob);
//       }, "image/jpeg");
//     };

//     const image = new Image();
//     image.onload = () => {
//       imageToBlob(image, (blob) => {
//         const file = new File([blob], "default-image.jpg", {
//           type: "image/jpeg",
//         });
//         setIsSelectedDefaultImg(true);
//         setImageFile(file);
//       });
//     };
//     image.src = "/image/note.png";
//     image.alt = "default image";
//   };

//   const handleChangeImgToDefault = () => {
//     setIsSelectedDefaultImg(true);
//     loadDefaultImage();
//   };

//   const handleFileChange = (e) => {
//     if (e.target.name === "imageFile" && e.target.files[0] instanceof File) {
//       const fileInput = e.target;
//       let file = e.target.files[0];
//       const timestamp = new Date().getTime();
//       const uniqueFilename = `${file.name}_${timestamp}`;
//       file = new File([file], uniqueFilename, { type: file.type });
//       fileInput.value = "";

//       const maxSizeKB = 1024;
//       ImageService.compressImage(file, maxSizeKB)
//         .then((compressedFile) => {
//           setImageFile(compressedFile);
//           setIsSelectedDefaultImg(false);
//         })
//         .catch((error) => {
//           console.error("Ошибка при сжатии изображения:", error);
//         });
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!imageFile || name === "" || author === "") {
//       setSuccessMessage("Заполните все поля!");
//       setTimeout(() => {
//         setSuccessMessage("");
//       }, 2000);
//       return;
//     }

//     setIsAddButtonClicked(true);

//     e.preventDefault();
//     const formData = new FormData();
//     formData.append("name", name.trim());
//     formData.append("author", author.trim());
//     formData.append("imageFile", imageFile);

//     fetch(`${apiUrl}/api/playlistContainers/${id}/add`, {
//       headers: {
//         Authorization: `Bearer ${AuthService.getAuthToken()}`,
//       },
//       method: "POST",
//       body: formData,
//     })
//       .then((response) => {
//         if (response.ok) {
//           setSuccessMessage("Плейлист успешно создан!");
//           setTimeout(() => {
//             navigate(`/sections/${id}`);
//           }, 2000);
//         } else if (response.status === 409) {
//           setSuccessMessage("Максимальное количество плейлистов в секции - 30");
//           setTimeout(() => {
//             navigate(`/sections/${id}`);
//           }, 4000);
//         }
//       })
//       .catch((error) => {
//         console.error("Error creating playlist");
//         setIsAddButtonClicked(false);
//       });
//   };

//   const resetForm = () => {
//     setName("");
//     setAuthor("");
//     setImageFile(null);
//   };

//   const handleLabelKeyPress = (e, fieldName) => {
//     if (e.key === "Enter") {
//       const input = document.getElementById(fieldName);
//       input.click();
//     }
//   };

//   return (
//     <>
//       {isAuthenticated && isAdminRole && (
//         // isValidToken
//         <div className="container">
//           <form
//             className="form-data"
//             onSubmit={handleSubmit}
//             encType="multipart/form-data"
//           >
//             <input
//               className="input-field"
//               type="text"
//               name="name"
//               placeholder="Название"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               tabIndex={1}
//             />
//             <input
//               className="input-field"
//               type="text"
//               name="author"
//               placeholder="Автор"
//               value={author}
//               onChange={(e) => setAuthor(e.target.value)}
//               tabIndex={2}
//             />
//             <div className="file-input-container">
//               <div style={{ display: "flex" }}>
//                 <label
//                   className="file-input-label"
//                   htmlFor="uploadImage"
//                   onKeyDown={(e) => handleLabelKeyPress(e, "uploadImage")}
//                   tabIndex={3}
//                 >
//                   Выберите изображение
//                 </label>
//                 {!isSelectedDefaultImg && (
//                   <button
//                     className="cancel-select-img-btn"
//                     id="cancel-select-img-btn"
//                     onMouseEnter={() => setIsVisibleTooltip(true)}
//                     onMouseLeave={() => setIsVisibleTooltip(true)}
//                     onClick={handleChangeImgToDefault}
//                   >
//                     X
//                   </button>
//                 )}
//                 <Tooltip
//                   anchorSelect="#cancel-select-img-btn"
//                   className="tooltip-class"
//                   delayShow={0}
//                   style={{
//                     marginTop: "20px",
//                     display: isVisibleTooltip ? "block" : "none",
//                   }}
//                 >
//                   <span>Удалить</span>
//                 </Tooltip>
//               </div>
//               <input
//                 className="file-input"
//                 type="file"
//                 name="imageFile"
//                 id="uploadImage"
//                 onChange={handleFileChange}
//                 accept="image/*"
//                 style={{ display: "none" }}
//               />
//               {imageFile && (
//                 <div className="image-preview">
//                   <img
//                     className="preview-img"
//                     src={URL.createObjectURL(imageFile)}
//                     alt="Uploaded Image"
//                   />
//                 </div>
//               )}
//               {/* <p className="file-name">{imageFile ? imageFile.name : "Изображение не выбрано"}</p> */}
//             </div>
//             <div className="submit-container">
//               <input
//                 className="submit-btn"
//                 type="submit"
//                 value="Создать плейлист"
//                 tabIndex={4}
//                 style={{ width: "180px" }}
//                 disabled={isAddButtonClicked}
//               />
//             </div>
//             <div className="success-message">
//               <span className="message-text">{successMessage}</span>
//             </div>
//           </form>
//         </div>
//       )}
//     </>
//   );
// };

// export default AddGlobalPlaylist;
