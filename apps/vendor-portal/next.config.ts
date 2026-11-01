import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@sagui/ui", "@workspace/vendor-onboarding"],
  serverExternalPackages: ["pg", "xlsx"],
}

export default nextConfig
