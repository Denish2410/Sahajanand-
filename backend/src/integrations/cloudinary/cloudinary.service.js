const cloudinary = require('../../config/cloudinary');
const fs = require('fs');
const logger = require('../../utils/logger');

/**
 * Upload a file to Cloudinary.
 * @param {string} filePath - Local file path
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<{url: string, publicId: string}>}
 */
async function uploadImage(filePath, folder = 'sahajanand') {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    // Delete temp file
    deleteTempFile(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (err) {
    // Always clean up temp file, even on error
    deleteTempFile(filePath);
    logger.error(`Cloudinary upload failed: ${err.message}`);
    throw err;
  }
}

/**
 * Upload multiple files to Cloudinary.
 * @param {string[]} filePaths - Array of local file paths
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<Array<{url: string, publicId: string}>>}
 */
async function uploadMultipleImages(filePaths, folder = 'sahajanand') {
  const results = [];
  for (const filePath of filePaths) {
    const result = await uploadImage(filePath, folder);
    results.push(result);
  }
  return results;
}

/**
 * Delete an image from Cloudinary by public ID.
 * @param {string} publicId
 */
async function deleteImage(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`Cloudinary image deleted: ${publicId}`);
  } catch (err) {
    logger.error(`Cloudinary delete failed for ${publicId}: ${err.message}`);
  }
}

/**
 * Delete multiple images from Cloudinary.
 * @param {string[]} publicIds
 */
async function deleteMultipleImages(publicIds) {
  for (const publicId of publicIds) {
    await deleteImage(publicId);
  }
}

/**
 * Delete a temp file from disk (non-blocking, never throws).
 * @param {string} filePath
 */
function deleteTempFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    logger.warn(`Failed to delete temp file ${filePath}: ${err.message}`);
  }
}

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  deleteTempFile,
};
