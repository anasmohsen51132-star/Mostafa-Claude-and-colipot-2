import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const payload = jwt.verify(token, JWT_SECRET) as any;

    // Check if user exists and not deleted
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || user.deletedAt) return res.status(401).json({ error: "Unauthorized" });

    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
