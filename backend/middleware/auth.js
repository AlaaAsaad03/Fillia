import jwt from "jsonwebtoken";

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.token;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Not Authorized. Login Again.",
    });
  }

  let token;
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    token = authHeader;
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = decodedToken.id; // Attach user ID to the request
    req.body.role = decodedToken.role; // Attach user role to the request
    console.log("userId:", req.body.userId, "role:", req.body.role);

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

// Authorization Middleware
const authorizationMiddleware = (roles) => {
  return (req, res, next) => {
    // Check if the user's role is allowed to access the route
    if (!roles.includes(req.body.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource.",
      });
    }
    next(); // User has the appropriate role

  };
};

export { authMiddleware, authorizationMiddleware };