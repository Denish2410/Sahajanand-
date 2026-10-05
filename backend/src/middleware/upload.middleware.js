const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = /jpeg|jpg|png|webp/;

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
  const extname = ALLOWED_TYPES.test(path.extname(file.originalname).toLowerCase());
  const mimetype = ALLOWED_TYPES.test(file.mimetype.split('/')[1]);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only jpg, jpeg, png and webp images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

/**
 * Upload single image middleware.
 * @param {string} fieldName - The form field name
 */
const uploadSingle = (fieldName) => upload.single(fieldName);

/**
 * Upload multiple images middleware.
 * @param {string} fieldName - The form field name
 * @param {number} maxCount - Maximum number of files
 */
const uploadMultiple = (fieldName, maxCount = 8) => upload.array(fieldName, maxCount);

module.exports = { uploadSingle, uploadMultiple, UPLOADS_DIR };
