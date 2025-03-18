import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  console.log(req);
  const response = NextResponse.next();

  response.headers.set("Access-Control-Allow-Origin", "http://localhost:3000"); // Allow frontend requests
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, DELETE, OPTIONS"
  ); // Add DELETE
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      status: 204, // No Content
    });
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
