import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: window.location.origin, // Dynamic: works from localhost, LAN, and tunnel
  plugins: [
    twoFactorClient(),
  ],
});
