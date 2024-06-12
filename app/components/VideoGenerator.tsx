"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
// @ts-ignore
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useEffect, useRef, useState } from "react";
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
      if (messageRef.current) messageRef.current.innerHTML = message;
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

      const videoPaths = scenes.map((scene, index) => ({
        url: scene.videoUrl,
        filename: `video${index}.mp4`,
        endTime: scene.endTime,
      }));

      await Promise.all(
        videoPaths.map(async (video) => {
          setProgressMessage(`Downloading video: ${video.url}`);
          const response = await fetch(video.url);
          const data = await response.arrayBuffer();
          await ffmpeg.writeFile(video.filename, new Uint8Array(data));
          setProgressMessage(`Trimming video: ${video.filename}`);
          await ffmpeg.exec([
            "-i",
            video.filename,
            "-t",
            `${video.endTime}`,
            `trimmed_${video.filename}`,
          ]);
        })
      );

      const fileList = videoPaths
        .map((video) => `file 'trimmed_${video.filename}'`)
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
        "libx264",
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
    </div>
  );
};

export default VideoGenerator;
