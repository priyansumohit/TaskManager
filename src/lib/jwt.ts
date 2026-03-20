import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";

export function generateAccessToken(userId: number): string {
  return jwt.sign({ id: userId }, ACCESS_SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(userId: number): string {
  return jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): { id: number } | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as { id: number };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { id: number } | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { id: number };
  } catch {
    return null;
  }
}
