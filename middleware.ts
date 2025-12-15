import { NextResponse, type NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  const authResponse = await auth0.middleware(request);
  const session = await auth0.getSession(request);
  const redirectPath = "/main";

  if (request.nextUrl.pathname.startsWith("/auth")) {
    return authResponse;
  }

  if (!session?.tokenSet.accessToken) {
    return NextResponse.redirect(
      new URL(`/auth/login?returnTo=${redirectPath}`, request.url)
    );
  }

  await auth0.getAccessToken(request, authResponse);

  return authResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
