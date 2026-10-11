import { withAui } from "@assistant-ui/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["assistant-stream"],
};

export default withAui(nextConfig);
