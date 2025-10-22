const fs = require('fs').promises;
const { uploadImage, deleteImage } = require('../config/cloudinary');
const { AppError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Upload single image to Cloudinary
 * @param {Object} file - Multer file object
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Object>} Upload result with public_id and url
 */
exports.uploadSingleImage = async (file, folder = 'ecommerce') => {
  try {
    if (!file) {
      throw new AppError('No file provided', 400);
    }

    // Upload to Cloudinary
    const result = await uploadImage(file.path, folder);

    // Delete local file after upload
    await fs.unlink(file.path).catch((err) => {
      logger.warn(`Failed to delete local file: ${err.message}`);
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    // Clean up local file on error
    if (file?.path) {
      await fs.unlink(file.path).catch(() => {});
    }
    throw new AppError(`Image upload failed: ${error.message}`, 400);
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array} files - Array of multer file objects
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Array>} Array of upload results
 */
exports.uploadMultipleImages = async (files, folder = 'ecommerce') => {
  try {
    if (!files || files.length === 0) {
      throw new AppError('No files provided', 400);
    }

    const uploadPromises = files.map(async (file) => {
      const result = await uploadImage(file.path, folder);
      
      // Delete local file after upload
      await fs.unlink(file.path).catch((err) => {
        logger.warn(`Failed to delete local file: ${err.message}`);
      });

      return {
        public_id: result.public_id,
        url: result.secure_url,
      };
    });

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    // Clean up local files on error
    if (files) {
      await Promise.all(
        files.map((file) => fs.unlink(file.path).catch(() => {}))
      );
    }
    throw new AppError(`Images upload failed: ${error.message}`, 400);
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Delete result
 */
exports.deleteSingleImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new AppError('No public ID provided', 400);
    }

    const result = await deleteImage(publicId);
    return result;
  } catch (error) {
    throw new AppError(`Image deletion failed: ${error.message}`, 400);
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array} publicIds - Array of Cloudinary public IDs
 * @returns {Promise<Array>} Array of delete results
 */
exports.deleteMultipleImages = async (publicIds) => {
  try {
    if (!publicIds || publicIds.length === 0) {
      return [];
    }

    const deletePromises = publicIds.map((publicId) => deleteImage(publicId));
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    logger.error(`Multiple images deletion failed: ${error.message}`);
    // Don't throw error, just log it
    return [];
  }
};
