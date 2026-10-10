"use client";

import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { AlertCircleIcon, BarChart3Icon, LoaderIcon } from "lucide-react";
import type { ChinaNevSalesResult } from "@/tools/china-nev-sales";

type GetChinaNevSalesArgs = {
  months?: number;
};

/** `get_china_nev_sales` 的轻量 trace；正式看板由模型 `present` 拼出。 */
export const ChinaNevSalesToolUI: ToolCallMessagePartComponent<
  GetChinaNevSalesArgs,
  ChinaNevSalesResult
> = ({ status, result }) => {
  if (status.type === "running") {
    return (
      <div className="text-muted-foreground bg-muted/40 flex w-fit items-center gap-2 rounded-2xl border px-3 py-2 text-sm">
        <LoaderIcon className="size-4 animate-spin animation-duration-[0.6s]" />
        正在拉取中国新能源汽车销量…
      </div>
    );
  }

  if (!result) return null;

  if ("error" in result) {
    return (
      <div className="bg-muted/40 text-muted-foreground flex w-fit max-w-sm items-start gap-2 rounded-2xl border px-3 py-2 text-sm">
        <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
        <span>{result.error}</span>
      </div>
    );
  }

  return (
    <div className="text-muted-foreground bg-muted/40 flex w-fit max-w-sm items-center gap-2 rounded-2xl border px-3 py-2 text-sm">
      <BarChart3Icon className="size-4 shrink-0" />
      <span>
        已获取 {result.periodLabel} 销量（{result.months.length} 个月）
      </span>
    </div>
  );
};
