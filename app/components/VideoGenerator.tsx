import React, { useEffect, useMemo, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { Scene } from "../utils/interfaces";

interface VideoGeneratorProps {
  scenes: Scene[];
  audioFile: File | null;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({
  scenes,
  audioFile,
}) => {
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const ffmpeg = useMemo(() => new FFmpeg(), []); // new FFmpeg({ log: true });

  useEffect(() => {
    const loadFFmpeg = async () => {
      await ffmpeg.load();
    };
    loadFFmpeg();
  }, [ffmpeg]);

  const generateVideo = async () => {
    if (!audioFile || scenes.length === 0) return;

    setIsGenerating(true);

    const videoBlob = await generateVideoWithFFmpeg(ffmpeg, scenes, audioFile);
    setVideoBlob(videoBlob);

    setIsGenerating(false);
  };

  const generateVideoWithFFmpeg = async (
    ffmpeg: FFmpeg,
    scenes: Scene[],
    audioFile: File
  ) => {
    await ffmpeg.writeFile("audio.mp3", await fetchFile(audioFile));

    let inputOptions = ["-i", "audio.mp3"];
    let filterOptions = [];
    let outputOptions = [];

    scenes.forEach((scene, index) => {
      if (scene.video) {
        inputOptions.push("-i", scene.video.url);
        filterOptions.push(
          `[${index + 1}:v]scale=1280:720[scaled${index}]`,
          `[scaled${index}][${index + 2}:v]overlay=x='(W-w)/2':y='(H-h)/2'[v${
            index + 1
          }]`,
          `[v${index + 1}][${
            index + 2
          }:v]drawtext=fontfile=/path/to/font.ttf:text='${
            scene.paragraph
          }':fontcolor=white:fontsize=24:x=(w-tw)/2:y=h-th-20[v${index + 1}]`
        );
      }
    });

    filterOptions.push(`[v${scenes.length}]scale=1280:720[v]`);
    outputOptions.push(
      "-map",
      "[v]",
      "-c:v",
      "libx264",
      "-c:a",
      "aac",
      "-movflags",
      "+faststart",
      "output.mp4"
    );

    await ffmpeg.exec([...inputOptions, ...filterOptions, ...outputOptions]);

    const data = (await ffmpeg.readFile("output.mp4")) as Uint8Array;
    const videoBlob = new Blob([data.buffer], { type: "video/mp4" });
    return videoBlob;
  };

  return (
    <div>
      <button onClick={generateVideo} disabled={isGenerating}>
        {isGenerating ? "Generating Video..." : "Generate Video"}
      </button>
      {videoBlob && (
        <video src={URL.createObjectURL(videoBlob)} controls autoPlay />
      )}
    </div>
  );
};

export default VideoGenerator;
