import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "super-secret-key"
    );
    req.userId = decoded.userId ?? decoded.id;
    next();
  } catch (e) {
    res.status(400).json({ error: "Invalid Token" });
  }
};
