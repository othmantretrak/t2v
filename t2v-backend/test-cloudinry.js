const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

// Input and output file paths
const inputFile = "./uploads/thum3.jpeg";
const outputFile = "output.mp4";

// Define the FFmpeg command
ffmpeg(inputFile)
  .inputOptions(["-framerate 1/12"])
  .complexFilter([
    {
      filter: "scale",
      options: {
        w: 1280,
        h: 720,
        force_original_aspect_ratio: "decrease",
        flags: "fast_bilinear",
      },
    },
    {
      filter: "split",
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
    },
    {
      filter: "gblur",
      options: {
        sigma: 10,
      },
      inputs: "copy",
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
    },
    {
      filter: "overlay",
      options: {
        x: "(main_w-overlay_w)/2",
        y: "(main_h-overlay_h)/2",
      },
      inputs: ["blurred", "original"],
    },
    {
      filter: "setsar",
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
  })
  .on("error", (err, stdout, stderr) => {
    console.error("Error: " + err.message);
    console.error("FFmpeg stderr: " + stderr);
  })
  .save(outputFile);
