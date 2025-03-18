import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  console.log("Incoming request:", {
    method: req.method,
    url: req.nextUrl.pathname,
    headers: Object.fromEntries(req.headers.entries()),
  });

  const response = NextResponse.next();

  response.headers.set("Access-Control-Allow-Origin", "*"); // Allow all origins
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, DELETE, OPTIONS"
  );
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling preflight request");
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      status: 204, // No Content
    });
  }

  console.log(
    "Response headers set:",
    Object.fromEntries(response.headers.entries())
  );
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
