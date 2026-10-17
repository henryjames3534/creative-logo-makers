"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDesignerByHandle } from "@/data/designers";

/** Client-only ?designer= redirect so /projects stays statically cacheable. */
export function ProjectsDesignerRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handle = (searchParams.get("designer") || "").trim();

  useEffect(() => {
    if (!handle) return;
    const d = getDesignerByHandle(handle);
    if (d) router.replace(`/designers/${d.id}?tab=invite`);
    else router.replace("/designers/search");
  }, [handle, router]);

  return null;
}
