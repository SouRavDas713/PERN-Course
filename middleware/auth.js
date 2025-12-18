import { prisma } from "../src/database/prisma.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const secretKey = process.env.JWT_SECRET;

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized - no header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized - no token" });
  }

  try {
    // verify token
    const decoded = jwt.verify(token, secretKey);

    // find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - user not found" });
    }
    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized - invalid token", error: err });
  }
};
