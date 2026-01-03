import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swMinify: true,
  disable: process.env.NODE_ENV === "development", // Disable in dev to avoid caching issues
  workboxOptions: {
    disableDevLogs: true,
  },
});

export default withPWA({
  // Your existing Next.js config goes here
  reactStrictMode: true,
});