import React, { useState } from "react";

const AudioUpload = ({
  setAudioFile,
  audioFile,
}: {
  setAudioFile: React.Dispatch<React.SetStateAction<File | null>>;
  audioFile: File | null;
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e.target.files && e.target.files[0]) || null;
    if (!file) return;
    setAudioFile(file);
  };

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      {audioFile && <audio controls src={URL.createObjectURL(audioFile)} />}
    </div>
  );
};

export default AudioUpload;
