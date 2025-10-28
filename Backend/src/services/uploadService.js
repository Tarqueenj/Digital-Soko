const fs = require('fs').promises;
const path = require('path');
const { AppError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Upload single image to local storage
 * @param {Object} file - Multer file object
 * @param {string} folder - Local folder name (unused for local storage)
 * @returns {Promise<Object>} Upload result with filename and url
 */
exports.uploadSingleImage = async (file, folder = 'products') => {
  try {
    if (!file) {
      throw new AppError('No file provided', 400);
    }

    // File is already saved by multer, just return the info
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const filename = path.basename(file.path);
    
    return {
      public_id: filename, // Use filename as public_id for consistency
      url: `${baseUrl}/uploads/${filename}`,
      filename: filename,
      path: file.path
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
 * Upload multiple images to local storage
 * @param {Array} files - Array of multer file objects
 * @param {string} folder - Local folder name (unused for local storage)
 * @returns {Promise<Array>} Array of upload results
 */
exports.uploadMultipleImages = async (files, folder = 'products') => {
  try {
    if (!files || files.length === 0) {
      throw new AppError('No files provided', 400);
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    
    const results = files.map((file) => {
      const filename = path.basename(file.path);
      return {
        public_id: filename, // Use filename as public_id for consistency
        url: `${baseUrl}/uploads/${filename}`,
        filename: filename,
        path: file.path
      };
    });

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
 * Delete image from local storage
 * @param {string} publicId - Filename or public ID
 * @returns {Promise<Object>} Delete result
 */
exports.deleteSingleImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new AppError('No public ID provided', 400);
    }

    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const filePath = path.join(uploadPath, publicId);
    
    // Check if file exists before trying to delete
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      return { result: 'ok', public_id: publicId };
    } catch (err) {
      if (err.code === 'ENOENT') {
        logger.warn(`File not found for deletion: ${publicId}`);
        return { result: 'not found', public_id: publicId };
      }
      throw err;
    }
  } catch (error) {
    throw new AppError(`Image deletion failed: ${error.message}`, 400);
  }
};

/**
 * Delete multiple images from local storage
 * @param {Array} publicIds - Array of filenames or public IDs
 * @returns {Promise<Array>} Array of delete results
 */
exports.deleteMultipleImages = async (publicIds) => {
  try {
    if (!publicIds || publicIds.length === 0) {
      return [];
    }

    const deletePromises = publicIds.map((publicId) => 
      this.deleteSingleImage(publicId).catch((error) => {
        logger.error(`Failed to delete image ${publicId}: ${error.message}`);
        return { result: 'error', public_id: publicId, error: error.message };
      })
    );
    
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    logger.error(`Multiple images deletion failed: ${error.message}`);
    // Don't throw error, just log it
    return [];
  }
};
