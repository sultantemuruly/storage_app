import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  console.log(req);
  const response = NextResponse.next();

  response.headers.set("Access-Control-Allow-Origin", "http://localhost:3000"); // Allow frontend requests
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
