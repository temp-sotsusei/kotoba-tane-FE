import { auth0 } from "@/lib/auth0";
import { getAccessToken } from "@auth0/nextjs-auth0";

export const isAuthenticatedUser = async () => {
  const executionContext = typeof window === "undefined" ? "server" : "client";
  if (executionContext === "server") {
    const { token } = await auth0.getAccessToken();
    return Boolean(token);
  } else {
    const token = await getAccessToken();
    return Boolean(token);
  }
};
