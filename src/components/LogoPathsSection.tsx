"use client";

import { Button } from "@/components/Button";
import { Container } from "@/components/Section";

/** React often drops the muted attr on <video>; set the DOM property so autoplay works. */
function bindAutoplayVideo(el: HTMLVideoElement | null) {
  if (!el) return;
  el.muted = true;
  el.defaultMuted = true;
  el.playsInline = true;
  const play = el.play();
  if (play && typeof play.catch === "function") {
    play.catch(() => {
      /* autoplay can still be blocked; muted retry covers most cases */
    });
  }
}

/** Logo design + branding — both media panels are videos */
export function LogoPathsSection() {
  return (
    <section className="relative overflow-hidden py-14 md:py-20">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 50% 65% at 18% 55%, rgba(0, 165, 129, 0.16), transparent 60%),
            radial-gradient(ellipse 48% 60% at 82% 45%, rgba(62, 0, 205, 0.14), transparent 58%),
            radial-gradient(ellipse 40% 50% at 50% 10%, rgba(131, 70, 146, 0.08), transparent 55%),
            linear-gradient(180deg, #f3f2f0 0%, #efece8 48%, #f3f2f0 100%)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(49,48,48,0.06) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      <Container className="relative z-10">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
          <h2 className="text-[2rem] font-medium tracking-tight text-ink md:text-[2.5rem]">
            It all starts with a logo
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-ink/75">
            Whether you&apos;re brand new or on brand two (or three!), we&apos;ve got
            a solution that&apos;ll suit your business and elevate your branding.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="relative mb-5 overflow-hidden rounded-2xl bg-green p-4 shadow-md md:p-5">
              <div className="relative aspect-[5/4] w-full overflow-hidden rounded-xl bg-green">
                <video
                  ref={bindAutoplayVideo}
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-label="Logo design examples video"
                >
                  <source
                    src="/clm/videos/logo-design-video.webm"
                    type="video/webm"
                  />
                </video>
              </div>
            </div>
            <h3 className="text-[1.5rem] font-medium text-ink">
              We design your logo for you
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
              You share the brief — our designers create custom logo options
              built for your brand. No DIY tools. Real concepts, revisions, and
              final files ready for business.
            </p>
            <div className="mt-5">
              <Button href="/logo-design/details" variant="primary">
                View logo packages
              </Button>
            </div>
          </div>

          <div>
            <div
              className="relative mb-5 overflow-hidden rounded-2xl p-4 shadow-md md:p-5"
              style={{ backgroundColor: "#3e00cd" }}
            >
              <div
                className="relative aspect-[5/4] w-full overflow-hidden rounded-xl"
                style={{ backgroundColor: "#3e00cd" }}
              >
                <video
                  ref={bindAutoplayVideo}
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-label="Branding services video"
                >
                  <source
                    src="/clm/videos/branding-services.webm"
                    type="video/webm"
                  />
                </video>
              </div>
            </div>
            <h3 className="text-[1.5rem] font-medium text-ink">
              Branding & brand development
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
              Go beyond a logo. We build full brand systems — identity, colors,
              type, guidelines, and launch assets — so your business looks
              consistent everywhere you show up.
            </p>
            <div className="mt-5">
              <Button href="/brand-identity-pack/details" variant="primary">
                View branding packages
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
