import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token JWT não informado." });
  }

  const [, token] = authHeader.split(" ");

  try {
    const secret = process.env.JWT_SECRET || "default_secret";
    const decoded = jwt.verify(token, secret);

    const { sub } = decoded as { sub: string };

    req.user = {
      id: sub,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token JWT inválido ou expirado." });
  }
}
