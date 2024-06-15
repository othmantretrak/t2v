// videoProcessing.js
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const path = require("path");
const utils = require("./utils");
const sharp = require("sharp");

ffmpeg.setFfprobePath(path.join("C:", "ffmpeg", "bin", "ffprobe.exe"));

ffmpeg.setFfmpegPath(ffmpegStatic);

exports.generateSceneVideos = async (scenes, tempDir, req) => {
  const sceneVideos = [];
  for (let i = 0; i < scenes.length; i++) {
    const { paragraph, videoUrlOrImageFile, duration } = scenes[i];
    const sceneVideoPath = path.join(tempDir, `scene_${i}.mp4`);
    sceneVideos.push(sceneVideoPath);

    if (typeof videoUrlOrImageFile === "string") {
      // Download the video file first
      const downloadedFilePath = path.join(tempDir, `downloaded_${i}.mp4`);
      await utils.downloadVideo(videoUrlOrImageFile, downloadedFilePath);

      // Process the downloaded video
      await new Promise((resolve, reject) => {
        ffmpeg(downloadedFilePath)
          .noAudio()
          .duration(duration)
          .outputOptions(["-vcodec", "libx264"])
          .output(sceneVideoPath)
          .on("end", resolve)
          .on("error", reject)
          .run();
      });
    } else {
      // If videoUrlOrImageFile is a file, process the uploaded image
      const imageFile = req.files.find(
        (file) => file.fieldname === `imageFile-${i}`
      );
      if (imageFile) {
        const imageFilePath = path.join("uploads", imageFile.filename);
        await processImage(imageFilePath, sceneVideoPath, duration);
      } else {
        console.error(`No file found for imageFile-${i}`);
        continue; // Skip the scene with invalid data
      }
    }
  }
  return sceneVideos;
};

const processImage = async (imageFilePath, sceneVideoPath, duration) => {
  const { width, height } = await sharp(imageFilePath).metadata();
  const outputWidth = 1280;
  const outputHeight = 720;

  const lumaRadius = Math.min(outputWidth, outputHeight) / 20;
  const chromaRadius = Math.min(outputWidth, outputHeight) / 20;

  await new Promise((resolve, reject) => {
    const command = ffmpeg(imageFilePath)
      .input(imageFilePath)
      .outputOptions([
        "-vf",
        `scale=1280:720:force_original_aspect_ratio=decrease:flags=fast_bilinear,split[original][copy];[copy]scale=32:18:force_original_aspect_ratio=increase:flags=fast_bilinear,gblur=sigma=2,scale=1280:720:flags=fast_bilinear[blurred];[blurred][original]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2,setsar=1`,
      ])
      .output(sceneVideoPath)
      .on("end", resolve)
      .on("error", reject);

    command.run();
  });
};
exports.mergeSceneVideos = async (sceneVideos, tempDir, outputPath) => {
  const concatFilePath = utils.createConcatFile(sceneVideos, tempDir);

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatFilePath)
      .inputOptions(["-f", "concat", "-safe", "0"])
      .outputOptions(["-c", "copy"])
      .output(outputPath)
      .on("error", reject)
      .on("end", resolve)
      .run();
  });
};

exports.mergeAudioWithVideo = async (videoPath, audioFilePath, outputPath) => {
  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .input(audioFilePath)
      .outputOptions(["-c:v", "copy", "-c:a", "aac"])
      .on("start", (commandLine) => {
        console.log("Merging audio with video:", commandLine);
      })
      .on("error", reject)
      .on("end", resolve)
      .save(outputPath);
  });
};
