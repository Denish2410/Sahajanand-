const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
// Extension and MIME type must agree; SVG and other active content is refused.
const ALLOWED = {
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.webp': ['image/webp'],
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(16).toString('hex');
    cb(null, `${name}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimes = ALLOWED[ext];

  if (mimes && mimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Only jpg, jpeg, png and webp images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 8 },
});

/**
 * If the request ends in an error (validation, missing product, ...), remove
 * the files it uploaded so rejected requests cannot fill the disk.
 */
const discardOnFailure = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode < 400) return;
    const files = [req.file, ...(Array.isArray(req.files) ? req.files : [])].filter(Boolean);
    for (const file of files) {
      fs.unlink(file.path, () => {}); // already gone is fine
    }
  });
  next();
};

/**
 * Upload single image middleware.
 * @param {string} fieldName - The form field name
 */
const uploadSingle = (fieldName) => [upload.single(fieldName), discardOnFailure];

/**
 * Upload multiple images middleware.
 * @param {string} fieldName - The form field name
 * @param {number} maxCount - Maximum number of files
 */
const uploadMultiple = (fieldName, maxCount = 8) => [upload.array(fieldName, maxCount), discardOnFailure];

module.exports = { uploadSingle, uploadMultiple, UPLOADS_DIR };
