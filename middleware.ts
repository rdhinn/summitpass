import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve token from cookies
  const tokenCookie = request.cookies.get("summitpass_token");
  const token = tokenCookie?.value;

  // Helper to decode JWT payload safely in Next.js Edge Runtime (no Node.js crypto dependencies)
  let userPayload: { userId: string; role: string; exp: number } | null = null;
  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        // Decode base64 URL safe
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        userPayload = JSON.parse(jsonPayload);
      }
    } catch (e) {
      console.error("Error decoding token in middleware:", e);
    }
  }

  const isTokenExpired = userPayload ? Date.now() >= userPayload.exp * 1000 : true;

  // 1. Protection for Hiker Dashboard (/dashboard)
  if (pathname.startsWith("/dashboard")) {
    if (!token || isTokenExpired || userPayload?.role !== "user") {
      // Clear invalid cookie if present
      const response = NextResponse.redirect(new URL("/register", request.url));
      if (token) response.cookies.delete("summitpass_token");
      return response;
    }
  }

  // 2. Protection for Admin Dashboard (/admin/dashboard)
  if (pathname.startsWith("/admin/dashboard")) {
    if (!token || isTokenExpired || userPayload?.role !== "admin") {
      const response = NextResponse.redirect(new URL("/admin", request.url));
      if (token) response.cookies.delete("summitpass_token");
      return response;
    }
  }

  return NextResponse.next();
}

// Apply middleware only to the hiker and admin dashboard routes
export const config = {
  matcher: ["/dashboard/:path*", "/admin/dashboard/:path*"],
};
