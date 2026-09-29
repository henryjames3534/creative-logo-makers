/** Shared IP → geo enrichment for visitor tracking. */

export type IpGeoPayload = {
  ip?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
};

export function isPrivateIp(ip: string) {
  const v = ip.trim().toLowerCase();
  if (!v) return true;
  if (v === "::1" || v === "127.0.0.1" || v === "localhost") return true;
  if (v.startsWith("10.")) return true;
  if (v.startsWith("192.168.")) return true;
  if (v.startsWith("172.")) {
    const second = Number(v.split(".")[1]);
    if (second >= 16 && second <= 31) return true;
  }
  if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80")) return true;
  return false;
}

export async function lookupIpwho(ip?: string): Promise<IpGeoPayload | null> {
  const url =
    ip && !isPrivateIp(ip)
      ? `https://ipwho.is/${encodeURIComponent(ip)}`
      : "https://ipwho.is/";
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    success?: boolean;
    ip?: string;
    country?: string;
    country_code?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    timezone?: { id?: string } | string;
    connection?: { isp?: string; org?: string };
    isp?: string;
  };
  if (data.success === false) return null;
  const tz =
    typeof data.timezone === "string" ? data.timezone : data.timezone?.id;
  return {
    ip: data.ip || ip,
    country: data.country,
    countryCode: data.country_code,
    region: data.region,
    city: data.city,
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: tz,
    isp: data.connection?.isp || data.connection?.org || data.isp,
  };
}

export async function lookupIpapi(ip?: string): Promise<IpGeoPayload | null> {
  const url =
    ip && !isPrivateIp(ip)
      ? `https://ipapi.co/${encodeURIComponent(ip)}/json/`
      : "https://ipapi.co/json/";
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    error?: boolean;
    ip?: string;
    country_name?: string;
    country_code?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    org?: string;
  };
  if (data.error) return null;
  return {
    ip: data.ip || ip,
    country: data.country_name,
    countryCode: data.country_code,
    region: data.region,
    city: data.city,
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    isp: data.org,
  };
}

/** Prefer full lookup (lat/long/ISP/country name). Edge headers only fill gaps. */
export async function enrichGeo(input: {
  ip?: string;
  edge?: Partial<IpGeoPayload>;
}): Promise<IpGeoPayload> {
  const edge = input.edge || {};
  const ip = (input.ip || edge.ip || "").trim();
  let full: IpGeoPayload | null = null;

  if (ip && !isPrivateIp(ip)) {
    try {
      full = await lookupIpwho(ip);
    } catch {
      /* ignore */
    }
    if (!full?.latitude || !full?.isp || !full?.country) {
      try {
        full = { ...(full || {}), ...((await lookupIpapi(ip)) || {}) };
      } catch {
        /* ignore */
      }
    }
  }

  const merged: IpGeoPayload = {
    ip: full?.ip || ip || edge.ip,
    country:
      full?.country && full.country.length > 2
        ? full.country
        : edge.country && (edge.country?.length || 0) > 2
          ? edge.country
          : full?.country || edge.country || edge.countryCode,
    countryCode: full?.countryCode || edge.countryCode,
    region: full?.region || edge.region,
    city: full?.city || edge.city,
    latitude: full?.latitude ?? edge.latitude,
    longitude: full?.longitude ?? edge.longitude,
    timezone: full?.timezone || edge.timezone,
    isp: full?.isp || edge.isp,
  };

  return merged;
}
