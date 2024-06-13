"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
// @ts-ignore
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useEffect, useRef, useState } from "react";
import { Scene } from "../utils/interfaces";
import { isImageUrl } from "../utils/timing";

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
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
  const [loaded, setLoaded] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const messageRef = useRef<HTMLParagraphElement | null>(null);

  const load = async () => {
    setIsLoading(true);
    setProgressMessage("Loading FFmpeg...");
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }: { message: string }) => {
      if (messageRef.current) {
        messageRef.current.innerText += message;
      }
    });
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });

    setFfmpeg(ffmpeg);
    setLoaded(true);
    setIsLoading(false);
    setProgressMessage(null);
  };

  useEffect(() => {
    load();
  }, []);

  const generateVideo = async () => {
    if (!audioFile || scenes.length === 0 || !ffmpeg) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      setProgressMessage("Downloading and processing videos...");

      const videoPaths = await Promise.all(
        scenes.map(async (scene, index) => {
          const filename = `video${index}.mp4`;
          const response = await fetch(scene.videoUrl);
          const data = await response.arrayBuffer();
          await ffmpeg.writeFile(filename, new Uint8Array(data));

          setProgressMessage(`Trimming video: ${filename}`);
          await ffmpeg.exec([
            "-i",
            filename,
            "-t",
            `${scene.endTime + 0.8}`,
            "-c",
            "copy",
            `trimmed_${filename}`,
          ]);

          return {
            url: scene.videoUrl,
            filename: `trimmed_${filename}`,
            endTime: scene.endTime,
          };
        })
      );

      const fileList = videoPaths
        .map((video) => `file '${video.filename}'`)
        .join("\n");

      setProgressMessage("Creating file list for concatenation...");
      await ffmpeg.writeFile(
        "filelist.txt",
        new TextEncoder().encode(fileList)
      );

      setProgressMessage("Loading audio file...");
      await ffmpeg.writeFile("audio.mp3", await fetchFile(audioFile));

      setProgressMessage("Merging video and audio...");
      await ffmpeg.exec([
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        "filelist.txt",
        "-i",
        "audio.mp3",
        "-c:v",
        "copy", // Copy the video codec without re-encoding
        "-c:a",
        "aac",
        "-strict",
        "experimental",
        "-shortest",
        "output.mp4",
      ]);

      const data = (await ffmpeg.readFile("output.mp4")) as Uint8Array;
      setVideoBlob(new Blob([data.buffer], { type: "video/mp4" }));
      setProgressMessage("Video generation completed.");
    } catch (error) {
      console.error("Error generating video:", error);
      setErrorMessage(
        "An error occurred during video generation. Please try again."
      );
      setProgressMessage(null);
    } finally {
      setIsGenerating(false);
      setProgressMessage(null);
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
      {progressMessage && <p>{progressMessage}</p>}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      {videoBlob && (
        <div>
          <h3>Final Video</h3>
          <video controls width="600">
            <source src={URL.createObjectURL(videoBlob)} type="video/mp4" />
          </video>
        </div>
      )}
      <p ref={messageRef} />
    </div>
  );
};

function formatTime(seconds: any) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default VideoGenerator;
