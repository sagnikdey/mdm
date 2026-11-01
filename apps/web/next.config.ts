import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@sagui/ui", "@workspace/vendor-onboarding"],
}

export default nextConfig
