const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract token

  if (!token) return res.status(401).json({ error: "Access Denied. No Token Provided" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Attach decoded user data to request
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid Token" });
  }
};
