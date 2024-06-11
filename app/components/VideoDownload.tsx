import React, { useState } from "react";

const VideoDownload = ({ videoBlob }: { videoBlob: Blob }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    const url = URL.createObjectURL(videoBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "storyboard.mp4";
    link.click();
    URL.revokeObjectURL(url);
    setDownloading(false);
  };

  return (
    <button onClick={handleDownload} disabled={downloading}>
      {downloading ? "Downloading..." : "Download Video"}
    </button>
  );
};

export default VideoDownload;
