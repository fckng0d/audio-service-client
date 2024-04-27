const apiUrl = process.env.REACT_APP_REST_API_URL;

const ImageService = {
  compressImage(file, maxSize) {
    const maxSizeKB = maxSize;
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = (event) => {
        const fileSizeKB = event.total / maxSizeKB;

        if (fileSizeKB > maxSizeKB) {
          console.log("Сжатие изображения...");
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
              resolve(compressedFile);
            }, file.type);
          };
          img.src = event.target.result;
        } else {
          resolve(file);
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  },
};

export default ImageService;
