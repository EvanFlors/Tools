const errorMiddleware = (err, req, res, next) => {

  console.error(err);

  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  // Invalid Mongo ObjectId
  if (err.name === "CastError") {
    status = 400;
    message = "Invalid resource id";
  }

  // Mongo duplicate key
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map(e => e.message)
      .join(", ");
  }

  // Production message protection
  if (process.env.NODE_ENV === "production" && status === 500) {
    message = "Internal Server Error";
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });

};

export default errorMiddleware;