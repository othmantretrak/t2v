// routes/mergeVideos.js
const path = require("path");
const fs = require("fs").promises;
const ffmpeg = require("fluent-ffmpeg");
const { v4: uuidv4 } = require("uuid");
const { processVideo, createVideoFromImage } = require("../videoProcessing");

const jobQueue = {}; // In-memory job queue

const mergeVideos = async (req, res) => {
  const jobId = uuidv4();
  jobQueue[jobId] = { status: "processing", progress: 0 };

  try {
    const scenes = JSON.parse(req.body.scenes);
    const audioFile = req.files.find((file) => file.fieldname === "audioFile");
    const imageFiles = req.files.filter((file) =>
      file.fieldname.startsWith("imageFile-")
    );

    if (!audioFile) {
      throw new Error("Audio file is required");
    }

    const outputDir = path.join(__dirname, "../output");
    await fs.mkdir(outputDir, { recursive: true });

    const processedVideos = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const outputPath = path.join(outputDir, `processed_${i}.mp4`);

      if (
        typeof scene.videoUrlOrImageFile === "string" &&
        scene.videoUrlOrImageFile.startsWith("http")
      ) {
        // Process video URL
        await processVideo(
          scene.videoUrlOrImageFile,
          outputPath,
          scene.duration
        );
      } else {
        // Process image file
        const imageFile = imageFiles.find(
          (file) => file.fieldname === `imageFile-${i}`
        );
        if (imageFile) {
          await createVideoFromImage(
            imageFile.path,
            outputPath,
            scene.duration
          );
        } else {
          throw new Error(`Image file not found for scene ${i}`);
        }
      }

      processedVideos.push(outputPath);
      jobQueue[jobId].progress = Math.round(((i + 1) / scenes.length) * 100);
    }

    // Merge all processed videos
    const mergedVideoPath = path.join(outputDir, `merged_${uuidv4()}.mp4`);
    const mergeCommand = ffmpeg();

    processedVideos.forEach((video) => {
      mergeCommand.input(video);
    });

    await new Promise((resolve, reject) => {
      mergeCommand
        .mergeToFile(mergedVideoPath, outputDir)
        .on("end", resolve)
        .on("error", reject);
    });

    // Add audio to the merged video
    const finalOutputPath = path.join(outputDir, `final_${uuidv4()}.mp4`);
    await new Promise((resolve, reject) => {
      ffmpeg(mergedVideoPath)
        .input(audioFile.path)
        .outputOptions("-c:v copy")
        .outputOptions("-c:a aac")
        .output(finalOutputPath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    // Clean up temporary files
    await Promise.all([
      ...processedVideos.map((video) => fs.unlink(video)),
      fs.unlink(mergedVideoPath),
      ...imageFiles.map((file) => fs.unlink(file.path)),
      fs.unlink(audioFile.path),
    ]);

    jobQueue[jobId].status = "completed";
    jobQueue[jobId].videoUrl = finalOutputPath;

    console.log("Video merged successfully" + finalOutputPath);

    res.json({
      statusUrl: `${req.protocol}://${req.get("host")}/job-status/${jobId}`,
    });
  } catch (error) {
    jobQueue[jobId].status = "failed";
    jobQueue[jobId].error = error.message;

    console.error("Error processing video:", error);
    res.status(500).json({ error: "Error processing video: " + error.message });
  }
};

const jobStatus = (req, res) => {
  const { jobId } = req.params;
  const job = jobQueue[jobId];

  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ error: "Job not found" });
  }
};

module.exports = { mergeVideos, jobStatus };
