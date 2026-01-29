const { secret } = require('../config/secret');
const ApiError = require('../errors/api-error');
const handleCastError = require('../errors/handle-cast-error');
const handleValidationError = require('../errors/handle-validation-error');


const globalErrorHandler = (error, req, res, next) => {
  let statusCode = 500
  let message = 'Something went wrong !'
  let errorMessages = []


  if (error?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(error)
    statusCode = simplifiedError.statusCode
    message = simplifiedError.message
    errorMessages = simplifiedError.errorMessages
  } else if (error?.name === 'CastError') {
    const simplifiedError = handleCastError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  } else if (error?.name === "MulterError") {
    const resolvedMessage =
      error?.code === "LIMIT_FILE_SIZE" ? "File too large" : "Invalid upload";
    statusCode = 400;
    message = resolvedMessage;
    errorMessages = [
      {
        path: "",
        message: resolvedMessage,
      },
    ];
  } else if (
    typeof error?.message === "string" &&
    /^CORS blocked for origin:/i.test(error.message)
  ) {
    statusCode = 403;
    message = "CORS origin not allowed";
    errorMessages = [
      {
        path: "",
        message,
      },
    ];
  } else if (
    typeof error?.message === "string" &&
    /Must be a png\/jpg\/jpeg\/webp image/i.test(error.message)
  ) {
    statusCode = 400;
    message = error.message;
    errorMessages = [
      {
        path: "",
        message,
      },
    ];
  } else if (error instanceof ApiError) {
    statusCode = error?.statusCode
    message = error.message
    errorMessages = error?.message
      ? [
          {
            path: '',
            message: error?.message,
          },
        ]
      : []
  } else if (error instanceof Error) {
    message = secret.env !== "production" ? error?.message : message
    errorMessages = error?.message
      ? [
          {
            path: '',
            message: secret.env !== "production" ? error?.message : message,
          },
        ]
      : []
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack:secret.env !== 'production' ? error?.stack : undefined,
  })
}

module.exports = globalErrorHandler;
