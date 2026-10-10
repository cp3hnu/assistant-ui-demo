import { getChinaNevSales } from "@/tools/china-nev-sales";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const monthsParam = searchParams.get("months");
  const months = monthsParam ? Number.parseInt(monthsParam, 10) : 6;

  const result = await getChinaNevSales({ months: Number.isFinite(months) ? months : 6 });

  if ("error" in result) {
    return Response.json(result, { status: 400 });
  }

  return Response.json(result);
}
