"use generative";

import { defineToolkit } from "@assistant-ui/react";
import { z } from "zod";
import { getChinaNevSales } from "@/tools/china-nev-sales";
import { ChinaNevSalesToolUI } from "@/components/assistant-ui/china-nev-sales-ui";

export default defineToolkit({
  get_china_nev_sales: {
    description:
      "查询中国新能源汽车近半年（或指定月数）批发销量示例数据。" +
      "返回 months（label、salesWan、yoyPercent）与 summary 汇总。" +
      "用户要看销量、趋势、dashboard、柱状图时：先调用本工具拿到真实数据，" +
      "再调用 `present`，用默认组件拼界面，例如 Card + Fact + " +
      '`Chart`（variant: "bar"，data 为 { label, value: salesWan }）。' +
      "不要编造销量数字；数据来自本应用演示接口，非实时官方统计。",
    parameters: z.object({
      months: z
        .number()
        .int()
        .min(1)
        .max(6)
        .optional()
        .describe("查询最近几个月，默认 6（半年）。"),
    }),
    execute: async ({ months }) => getChinaNevSales({ months: months ?? 6 }),
    render: ChinaNevSalesToolUI,
  },
});
