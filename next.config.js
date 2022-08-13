/** @type {import('next').NextConfig} */
let config = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
};

// to connect to local chain in dev
if (process.env.NEXT_PUBLIC_CHAIN_ID === "testing") {
  config.rewrites = async () => {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:26657/:path*", // Proxy to Backend
      },
    ];
  };
}

module.exports = config;
module.exports = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
}