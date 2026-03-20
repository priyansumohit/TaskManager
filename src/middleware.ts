import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessTokenEdge } from "@/lib/jwt-edge";

const protectedPaths = ["/dashboard"];
const authPaths = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  let isAuthenticated = false;
  if (token) {
    const payload = await verifyAccessTokenEdge(token);
    isAuthenticated = !!payload;
  }

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAuthPath = authPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !isAuthenticated) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  if (isAuthPath && isAuthenticated) {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
