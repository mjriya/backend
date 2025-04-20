import jwt from "jsonwebtoken";
import { environment } from "../loaders/environment.loader.js";


// Middleware to authenticate JWT
export const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Optional chaining
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, environment.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid or expired token",
        error: err.message // Optional: include error details
      });
    }

    // Ensure decoded token has required fields
    if (!decoded.userId || !decoded.roles) {
      return res.status(403).json({
        message: "Malformed token payload"
      });
    }

    // Attach complete user data to request object
    req.user = {
      userId: decoded.userId,
      roles: decoded.roles,
      // Add other relevant user data from token if needed
      ...decoded
    };

    next();
  });
};
// Middleware to check if the user is admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.roles.includes("admin")) {
    return next();
  }
  res.status(403).json({ message: "Forbidden: You are not authorized to access this resource" });
};

// Middleware to check user roles
export const checkRole = (roles) => {
  return (req, res, next) => {

    if (req.user && roles.some(role => req.user.roles.includes(role))) {

      return next();
    }
    res.status(403).json({ message: "Forbidden: You are not authorized to access this resource" });
  };
};
