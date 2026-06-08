import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "summitpass-super-secret-jwt-key-2026";

interface DecodedToken {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

export function getAuthSession(request: Request): { userId: string; role: string } | null {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => c.trim().split("="))
    );
    const token = cookies["summitpass_token"];

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return {
      userId: decoded.userId,
      role: decoded.role,
    };
  } catch (err) {
    return null;
  }
}
