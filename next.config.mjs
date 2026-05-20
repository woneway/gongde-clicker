const isGithubPages = process.env.GITHUB_PAGES === "1";
const isStaticExport =
  isGithubPages ||
  process.env.CF_PAGES === "1" ||
  process.env.STATIC_EXPORT === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isStaticExport
    ? {
        output: "export",
        images: {
          unoptimized: true,
        },
      }
    : {}),
  ...(isGithubPages
    ? {
        basePath: "/gongde-clicker",
        assetPrefix: "/gongde-clicker/",
      }
    : {}),
};

export default nextConfig;
