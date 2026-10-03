import { Button } from "@/components/Button";
import { LocalizedPrice } from "@/components/locale/LocalizedPrice";
import { Container } from "@/components/Section";

/** Free Logomaker + contest — both media panels are videos */
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
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="Logo design examples video"
                >
                  <source
                    src="/clm/videos/logo-design-video.webm"
                    type="video/webm"
                  />
                </video>
              </div>
            </div>
            <h3 className="text-[1.5rem] font-medium text-ink">Free Logomaker</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
              Create your logo design in minutes. It&apos;s fast, free and
              oh-so-easy. The perfect way to get started, or use it as
              inspiration for our designers to level up your branding.
            </p>
            <div className="mt-5">
              <Button href="/logo-maker" variant="primary">
                Create a logo, it&apos;s free
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
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
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
              Run a logo contest
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
              Take your branding further. Get dozens of professional, custom
              logo options from our community of freelance designers, and
              experience next-level creative direction.
            </p>
            <div className="mt-5">
              <Button href="/contests" variant="primary">
                Logos from <LocalizedPrice value="US$249" />
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
