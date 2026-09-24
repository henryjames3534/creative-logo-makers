import { permanentRedirect } from "next/navigation";

/** Canonical browse UI lives at /designers/search */
export default function DesignersPage() {
  permanentRedirect("/designers/search");
}
