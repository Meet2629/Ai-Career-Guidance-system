const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post(
  "/resume-analysis",
  upload.single("resume"),
  async (req, res) => {
    try {
      const formData = new FormData();

      // Pass original filename and mimetype so FastAPI can identify the file type
      formData.append("resume", fs.createReadStream(req.file.path), {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      formData.append("job_description", req.body.jobDescription);

      const response = await axios.post(
        "http://localhost:8000/analyze",  // FastAPI port, not 3000
        formData,
        { headers: formData.getHeaders() }
      );

      res.json(response.data);

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Analysis failed" });

    } finally {
      // Always delete the temp file multer created
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  }
);

module.exports = router;