const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${cleanName}`);
  }
});

// File Filter (PDF, Word DOC/DOCX, Presentation PPT/PPTX, Images, Videos)
const fileFilter = (req, file, cb) => {
  const allowedExts = /\.(pdf|doc|docx|ppt|pptx|png|jpg|jpeg|mp4|webm)$/i;
  if (file.originalname.match(allowedExts)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, Word (.doc/.docx), Presentation (.ppt/.pptx), images, and videos are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter
});

// POST /api/v1/upload
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file was uploaded.' });
    }

    const relativeUrl = `/uploads/${req.file.filename}`;
    const host = req.get('host');
    const protocol = req.protocol;
    const fullUrl = `${protocol}://${host}${relativeUrl}`;

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: relativeUrl,
      fullUrl: fullUrl,
      fileName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (err) {
    console.error('File upload error:', err);
    return res.status(500).json({ success: false, message: err.message || 'File upload failed' });
  }
});

module.exports = router;
