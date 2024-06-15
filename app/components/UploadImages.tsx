import React, { useEffect, useRef, useState } from "react";
import { Scene } from "../utils/interfaces";

interface UploadImagesProps {
  scenes: Scene[];
  onAddScene: (sceneIndex: number, image: string | File) => void;
  images: File[];
  setImages: (images: File[]) => void;
  selectedSene: Scene;
  sceneIndex: number; // Add this line
}

const UploadImages: React.FC<UploadImagesProps> = ({
  onAddScene,
  scenes,
  images,
  setImages,
  sceneIndex,
}) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [url, setUrl] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newImages = Array.from(event.target.files || []);
    const invalidImages = newImages.filter(
      (image) => !image.type.startsWith("image/")
    );

    if (invalidImages.length > 0) {
      setErrorMessage("Please upload valid image files.");
      return;
    }

    setImages([...images, ...newImages]);
    setErrorMessage(null);
  };

  const handleAddImageUrl = () => {
    if (!url) {
      setErrorMessage("Please enter a valid URL.");
      return;
    }

    setImageUrls((prevUrls) => [...prevUrls, url]);
    setUrl("");
    setErrorMessage(null);
  };

  return (
    <div className="upload-images">
      <h3>Upload Images</h3>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
      />
      <div className="url-input">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter image URL"
        />
        <button onClick={handleAddImageUrl}>Add Image by URL</button>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="image-list">
        <div className="flex flex-wrap gap-2">
          {images.map((image, index) => (
            <div
              key={index}
              className="image-item w-40"
              onClick={() => onAddScene(sceneIndex, image)}
            >
              <img
                src={URL.createObjectURL(image)}
                alt={`Image ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
      <p className="progress-message">{progressMessage}</p>
    </div>
  );
};

export default UploadImages;
