import { NextResponse } from "next/server";
import { clmDbHealth, clmDbMigrate } from "@/lib/clm-api";

export const dynamic = "force-dynamic";

/** GET /api/db-health — probes Verpex → PostgreSQL bridge */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const migrate = url.searchParams.get("migrate") === "1";

  if (migrate) {
    const migrated = await clmDbMigrate();
    const health = await clmDbHealth();
    return NextResponse.json({ migrate: migrated, health });
  }

  const health = await clmDbHealth();
  return NextResponse.json(health, { status: health.ok ? 200 : 502 });
}
