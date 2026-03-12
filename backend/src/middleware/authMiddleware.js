import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    console.log("Auth header found, verifying token...");
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token extracted, decoding...");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded, ID:", decoded.id);

      req.user = await User.findById(decoded.id).select("-password");
      console.log("User lookup result:", req.user ? "User Found" : "User NOT Found");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      return next();
    } catch (error) {
      console.error("JWT ERROR:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  console.log("No auth header found for", req.url);
  return res.status(401).json({ message: "Not authorized, no token" });
};
