const isGithubPages = process.env.GITHUB_PAGES === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isGithubPages
    ? {
        output: "export",
        basePath: "/gongde-clicker",
        assetPrefix: "/gongde-clicker/",
        images: {
          unoptimized: true,
        },
      }
    : {}),
};

export default nextConfig;
