import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unavailable in your region",
  robots: { index: false, follow: false },
};

export default function GeoBlockedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f1115] px-6 text-center text-[#e8e7e4]">
      <div className="max-w-md">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00a581]">
          Creative Logo Makers
        </p>
        <h1 className="mt-3 text-2xl font-semibold">
          This site is not available in your region
        </h1>
        <p className="mt-3 text-sm text-white/55">
          Access from your country has been restricted. If you believe this is a
          mistake, contact{" "}
          <a
            href="mailto:reply@creativelogomakers.com"
            className="text-[#5ee0bf] underline"
          >
            reply@creativelogomakers.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
