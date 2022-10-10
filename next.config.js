// /** @type {import('next').NextConfig} */
// let config = {
//   reactStrictMode: true,
//   productionBrowserSourceMaps: true,
// };

// // // to connect to local chain in dev
// if (process.env.NEXT_PUBLIC_CHAIN_ID === "testing") {
//   config.rewrites = async () => {
//     return [
//       {
//         source: "/api/:path*",
//         destination: "http://localhost:26657/:path*", // Proxy to Backend
//       },
//     ];
//   };
// }


// module.exports = config;
module.exports = {
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  }
};