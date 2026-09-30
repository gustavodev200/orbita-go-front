import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Avatar do Google (Supabase OAuth) em user_metadata.avatar_url.
    remotePatterns: [new URL("https://lh3.googleusercontent.com/**")],
  },
};

export default nextConfig;
