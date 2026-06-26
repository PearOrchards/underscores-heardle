/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // for docker
  allowedDevOrigins: ["192.168.178.73"],
  images: {
    localPatterns: [{ pathname: "/api/cover" }],
  },
};

export default nextConfig;
