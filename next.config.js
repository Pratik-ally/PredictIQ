/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Prevent Next.js from bundling the MongoDB driver — it must run in Node.js
  serverExternalPackages: ["mongodb"],
  allowedDevOrigins: ["192.168.31.232", "localhost:3000"],
};

module.exports = nextConfig;
