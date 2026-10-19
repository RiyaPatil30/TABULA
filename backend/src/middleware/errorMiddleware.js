export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "This record already exists."
    });
  }

  res.status(res.statusCode >= 400 ? res.statusCode : 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
};