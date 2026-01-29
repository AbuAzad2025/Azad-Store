exports.fileUpload = async (req, res,next) => {
  try {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file provided",
    });
  }

  const filename = req.file.filename;
  const urlPath = filename ? `/images/${filename}` : undefined;

  res.status(200).json({
    success: true,
    file: {
      filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: urlPath,
    },
  })
    
  } catch (error) {
    next(error)
  }
}
