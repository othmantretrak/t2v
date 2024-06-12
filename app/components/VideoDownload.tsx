import React, { useState, useEffect } from "react";
import { createFFmpeg } from "@ffmpeg/ffmpeg";

const VideoGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadFFmpeg = async () => {
      if (typeof SharedArrayBuffer === "undefined") {
        setErrorMessage(
          "SharedArrayBuffer is not supported in this environment."
        );
        return;
      }
      try {
        const ffmpegInstance = createFFmpeg({ log: true });
        await ffmpegInstance.load();
        console.log("FFmpeg loaded successfully");
      } catch (error: any) {
        setErrorMessage(`Error loading FFmpeg: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadFFmpeg();
  }, []);

  return (
    <div>
      {isLoading && <p>Loading FFmpeg...</p>}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </div>
  );
};

export default VideoGenerator;
