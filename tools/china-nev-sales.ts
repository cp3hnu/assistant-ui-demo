/** 单月销量（万辆） */
export type ChinaNevMonthlySales = {
  month: string;
  label: string;
  salesWan: number;
  yoyPercent: number;
};

export type ChinaNevSalesSuccess = {
  source: string;
  title: string;
  periodLabel: string;
  unit: "万辆";
  months: ChinaNevMonthlySales[];
  summary: {
    totalWan: number;
    avgMonthlyWan: number;
    peakMonthLabel: string;
    peakSalesWan: number;
    avgYoyPercent: number;
  };
};

export type ChinaNevSalesError = {
  error: string;
};

export type ChinaNevSalesResult = ChinaNevSalesSuccess | ChinaNevSalesError;

/** 示例数据集：近半年中国新能源汽车批发销量（万辆），口径为演示用合成数据。 */
const SAMPLE_SERIES: Omit<ChinaNevMonthlySales, "month">[] = [
  { label: "4月", salesWan: 88.4, yoyPercent: 33.2 },
  { label: "5月", salesWan: 92.1, yoyPercent: 31.5 },
  { label: "6月", salesWan: 98.6, yoyPercent: 29.8 },
  { label: "7月", salesWan: 101.3, yoyPercent: 28.4 },
  { label: "8月", salesWan: 105.7, yoyPercent: 27.1 },
  { label: "9月", salesWan: 112.4, yoyPercent: 26.3 },
];

const buildPeriodLabel = (months: ChinaNevMonthlySales[]) => {
  if (months.length === 0) return "";
  const year = new Date().getFullYear();
  return `${year}年${months[0]!.label} – ${year}年${months[months.length - 1]!.label}`;
};

const summarize = (months: ChinaNevMonthlySales[]): ChinaNevSalesSuccess["summary"] => {
  const totalWan = months.reduce((sum, m) => sum + m.salesWan, 0);
  const peak = months.reduce((best, m) => (m.salesWan > best.salesWan ? m : best), months[0]!);
  const avgYoyPercent = months.reduce((sum, m) => sum + m.yoyPercent, 0) / months.length;

  return {
    totalWan: Math.round(totalWan * 10) / 10,
    avgMonthlyWan: Math.round((totalWan / months.length) * 10) / 10,
    peakMonthLabel: peak.label,
    peakSalesWan: peak.salesWan,
    avgYoyPercent: Math.round(avgYoyPercent * 10) / 10,
  };
};

/**
 * 查询中国新能源汽车近 N 个月销量（演示接口，返回固定示例序列的尾部 N 条）。
 */
export const getChinaNevSales = async ({
  months = 6,
}: {
  months?: number;
} = {}): Promise<ChinaNevSalesResult> => {
  const count = Math.min(6, Math.max(1, Math.floor(months)));

  if (count > SAMPLE_SERIES.length) {
    return { error: "目前示例数据最多提供 6 个月。" };
  }

  const slice = SAMPLE_SERIES.slice(-count);
  const year = new Date().getFullYear();
  const monthRows: ChinaNevMonthlySales[] = slice.map((row, index) => ({
    ...row,
    month: `${year}-${String(SAMPLE_SERIES.length - slice.length + index + 4).padStart(2, "0")}`,
  }));

  return {
    source: "Demo · 乘联会风格示例数据",
    title: "中国新能源汽车销量",
    periodLabel: buildPeriodLabel(monthRows),
    unit: "万辆",
    months: monthRows,
    summary: summarize(monthRows),
  };
};
