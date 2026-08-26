"use generative";

import { defineToolkit } from "@assistant-ui/react";
import { z } from "zod";
import { getWeather } from "@/lib/weather";
import { WeatherToolUI } from "@/components/assistant-ui/weather-tool-ui";

export default defineToolkit({
  get_weather: {
    description:
      "获取指定城市或地区的实时天气。用户询问当前、今天或此刻的天气、温度、降雨或风力时调用。location 必须是明确的城市或地区名称；不要臆测天气。",
    parameters: z.object({
      location: z
        .string()
        .describe("要查询天气的城市或地区名称，例如：北京、上海浦东、Tokyo。"),
    }),
    execute: async ({ location }) => getWeather({ location }),
    render: WeatherToolUI,
  },
});
