const fs = require("fs");
const { cloudinaryServices } = require("../services/cloudinary.service");

const isSafeCloudinarySegment = (value) =>
  /^[A-Za-z0-9_-]+$/.test(String(value || ""));

const isSafeCloudinaryFolder = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return false;
  const parts = raw.split("/").filter(Boolean);
  if (parts.length === 0) return false;
  return parts.every(isSafeCloudinarySegment);
};

// add image
const saveImageCloudinary = async (req, res,next) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({
        success: false,
        message: "No image provided",
      });
    }
    const result = await cloudinaryServices.cloudinaryImageUpload(
      req.file.buffer
    );
    res.status(200).json({
      success: true,
      message: "image uploaded successfully",
      data:{url:result.secure_url,id:result.public_id},
    });
  } catch (err) {
    next(err)
  }
};

// add image
const addMultipleImageCloudinary = async (req, res) => {
  try {
    const files = req.files;
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images provided",
      });
    }

    // Array to store Cloudinary image upload responses
    const uploadResults = [];

    for (const file of files) {
      // Upload image to Cloudinary
      const result = await cloudinaryServices.cloudinaryImageUpload(
        file.buffer || file.path
      );

      // Store the Cloudinary response in the array
      uploadResults.push(result);
    }

    // Delete temporary local files
    for (const file of files) {
      if (file?.path) {
        fs.unlinkSync(file.path);
      }
    }

    res.status(200).json({
      success: true,
      message: "image uploaded successfully",
      data:
        uploadResults.length > 0
          ? uploadResults.map((res) => ({
              url: res.secure_url,
              id: res.public_id,
            }))
          : [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to upload image",
    });
  }
};

// cloudinary ImageDelete
const cloudinaryDeleteController = async (req, res) => {
  try {
    const { folder_name, id } = req.query;
    if (!isSafeCloudinaryFolder(folder_name) || !isSafeCloudinarySegment(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image id",
      });
    }
    const public_id = `${folder_name}/${id}`;
    const result = await cloudinaryServices.cloudinaryImageDelete(public_id);
    res.status(200).json({
      success: true,
      message: "delete image successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
    });
  }
};

exports.cloudinaryController = {
  cloudinaryDeleteController,
  saveImageCloudinary,
  addMultipleImageCloudinary,
};
