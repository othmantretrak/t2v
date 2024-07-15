// app.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { mergeVideos, jobStatus } = require("./routes/mergeVideos");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(cors());

app.post("/merge-videos", upload.any(), mergeVideos);
app.get("/job-status/:jobId", jobStatus);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
