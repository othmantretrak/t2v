import { useState, useEffect } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { Scene } from "../utils/interfaces";

interface VideoGeneratorProps {
  scenes: Scene[];
  audioFile: File | null;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({
  scenes,
  audioFile,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ffmpeg, setFfmpeg]: [any, any] = useState(null);

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
        console.log("FFmpeg loaded successfully:", ffmpegInstance);
        setFfmpeg(ffmpegInstance);
      } catch (error: any) {
        setErrorMessage(`Error loading FFmpeg: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadFFmpeg();
  }, []);

  const generateVideo = async () => {
    console.log("generating video");
    console.log({ audioFile, scenes, ffmpeg });
    if (!audioFile || scenes.length === 0 || !ffmpeg) return;

    setIsGenerating(true);
    setErrorMessage(null); // Clear any previous error message

    try {
      const videoPaths = scenes.map((scene, index) => ({
        url: scene.videoUrl,
        filename: `video${index}.mp4`,
      }));

      await Promise.all(
        videoPaths.map(async (video) => {
          const response = await fetch(video.url);
          const data = await response.arrayBuffer();
          await ffmpeg.FS("writeFile", video.filename, new Uint8Array(data));
        })
      );

      const fileList = videoPaths
        .map((video) => `file '${video.filename}'`)
        .join("\n");
      await ffmpeg.FS(
        "writeFile",
        "filelist.txt",
        new TextEncoder().encode(fileList)
      );

      await ffmpeg.run(
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        "filelist.txt",
        "-c",
        "copy",
        "output.mp4"
      );

      const data = await ffmpeg.FS("readFile", "output.mp4");
      setVideoBlob(new Blob([data.buffer], { type: "video/mp4" }));
    } catch (error) {
      console.error("Error generating video:", error);
      setErrorMessage(
        "An error occurred during video generation. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const isButtonDisabled =
    isLoading || isGenerating || !audioFile || scenes.length === 0;

  return (
    <div>
      <button
        onClick={generateVideo}
        disabled={isButtonDisabled}
        className={`bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded ${
          isButtonDisabled ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        {isGenerating ? "Generating Video..." : "Generate Video"}
      </button>
      {isLoading && (
        <span className="animate-spin ml-3">
          <svg /* Spinner component */ />
        </span>
      )}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      {videoBlob && (
        <div>
          <h3>Final Video</h3>
          <video controls width="600">
            <source src={URL.createObjectURL(videoBlob)} type="video/mp4" />
          </video>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;
