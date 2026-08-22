import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/vendor-onboarding"],
  serverExternalPackages: ["pg"],
}

export default nextConfig
