import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  // Middleware için özelleştirilmiş fonksiyon
  function middleware(req) {
    // Gelen request
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-pathname", req.nextUrl.pathname);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  },
  {
    callbacks: {
      // Koruma koşulları
      authorized: ({ token }) => {
        return !!token;
      },
    },
    pages: {
      signIn: "/",
      error: "/",
    },
  }
);

// Hangi yolların korunacağını belirtin
export const config = {
  matcher: ["/panel/:path*", "/profile/:path*", "/admin/:path*"],
};