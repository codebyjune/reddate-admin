import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "red-date-system-secret-key-2024";
const JWT_EXPIRES_IN = "7d";

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
};

export { JWT_SECRET };
