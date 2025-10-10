import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const token = req.cookies?.token || req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: "Not Authorised. Login again" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return res.status(401).json({ success: false, message: "Not Authorised. Login again" });

    // Ensure body exists for GET requests too
    if (!req.body) req.body = {};
    req.body.userId = decoded.id;

    // Also attach for convenience (no body dependency)
    req.userId = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

export default userAuth;