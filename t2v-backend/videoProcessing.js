// videoProcessing.js
const ffmpeg = require("fluent-ffmpeg");

const processVideo = async (inputPath, outputPath, duration) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setDuration(duration)
      .output(outputPath)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
};

const createVideoFromImage = async (
  imagePath,
  outputPath,
  duration,
  blurRadius = 10
) => {
  return new Promise((resolve, reject) => {
    ffmpeg(imagePath)
      .inputOptions([`-framerate 1/${duration}`])
      .complexFilter([
        {
          filter: "scale",
          options: {
            w: 1280,
            h: 720,
            force_original_aspect_ratio: "decrease",
            flags: "fast_bilinear",
          },
          outputs: "scaled",
        },
        {
          filter: "split",
          inputs: "scaled",
          outputs: ["original", "copy"],
        },
        {
          filter: "scale",
          inputs: "copy",
          options: {
            w: 32,
            h: 18,
            force_original_aspect_ratio: "increase",
            flags: "fast_bilinear",
          },
          outputs: "scaled_copy",
        },
        {
          filter: "gblur",
          options: {
            sigma: 10,
          },
          inputs: "scaled_copy",
          outputs: "blurred",
        },
        {
          filter: "scale",
          inputs: "blurred",
          options: {
            w: 1280,
            h: 720,
            flags: "fast_bilinear",
          },
          outputs: "blurred_copy",
        },
        {
          filter: "overlay",
          options: {
            x: "(main_w-overlay_w)/2",
            y: "(main_h-overlay_h)/2",
          },
          inputs: ["blurred_copy", "original"],
          outputs: "overlaid",
        },
        {
          filter: "setsar",
          inputs: "overlaid",
          options: "1",
        },
      ])
      .outputOptions(["-c:v libx264", "-r 30", "-pix_fmt yuv420p"])
      .on("start", (commandLine) => {
        console.log("Spawned FFmpeg with command: " + commandLine);
      })
      .on("progress", (progress) => {
        console.log("Processing: " + progress.percent + "% done");
      })
      .on("end", () => {
        console.log("Processing finished successfully");
        resolve();
      })
      .on("error", (err, stdout, stderr) => {
        console.error("Error: " + err.message);
        console.error("FFmpeg stderr: " + stderr);
        reject(err);
      })
      .save(outputPath);
  });
};

module.exports = { processVideo, createVideoFromImage };
