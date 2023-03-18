const { VANA_API_URL } = require("./config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  rewrites: rewritesApi,
  images: {
    domains: ["tenor.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.com",
      },
      {
        protocol: "https",
        hostname: "tenor.com",
      },
      {
        protocol: "https",
        port: "",
        hostname: "replicate.delivery",
      },
    ],
  },
};

function rewritesApi() {
  return [
    {
      source: "/api/v0/:path*",
      destination: `${VANA_API_URL}/:path*`,
    },
  ];
}

module.exports = nextConfig;
