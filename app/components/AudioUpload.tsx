import React, { useState } from "react";

const AudioUpload = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null); // useState( );

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
