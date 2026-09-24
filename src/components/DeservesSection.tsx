import Image from "next/image";
import { Button } from "@/components/Button";
import { Container } from "@/components/Section";
import { clm } from "@/data/clm-assets";

/** “Your business deserves great design” — official collage asset */
export function DeservesSection() {
  return (
    <section className="bg-white py-16 md:py-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="text-4xl font-medium leading-[1.12] tracking-tight text-blue md:text-[2.75rem]">
              Your business deserves great design
            </h2>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink/75">
              Logos, websites, packaging design and more. Our trusted designer
              community has helped thousands of businesses launch, grow, expand
              and rebrand with custom, professional design.
            </p>
            <div className="mt-7">
              <Button href="/get-started" variant="primary">
                Start your brand
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto aspect-[5/4] w-full max-w-xl">
              <Image
                src={clm.deserves}
                alt="Colorful logo, packaging and website designs for beverage brand Zappyo"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
                priority
              />
            </div>
            <div className="pointer-events-none absolute left-[6%] top-[22%] flex items-center gap-2 rounded-full bg-[#cc9bff] px-3 py-1.5 text-xs font-semibold text-ink shadow-md">
              <span className="relative h-6 w-6 overflow-hidden rounded-full">
                <Image
                  src={clm.avatars.dunychi}
                  alt=""
                  fill
                  sizes="24px"
                  className="object-cover"
                />
              </span>
              Logo by :Dunychi
            </div>
            <div className="pointer-events-none absolute bottom-[36%] right-[2%] flex items-center gap-2 rounded-full bg-[#51aff4] px-3 py-1.5 text-xs font-semibold text-ink shadow-md">
              <span className="relative h-6 w-6 overflow-hidden rounded-full">
                <Image
                  src={clm.avatars.setupshop}
                  alt=""
                  fill
                  sizes="24px"
                  className="object-cover"
                />
              </span>
              Website by SetupShop™
            </div>
            <div className="pointer-events-none absolute bottom-[6%] left-[18%] flex items-center gap-2 rounded-full bg-[#ff9000] px-3 py-1.5 text-xs font-semibold text-ink shadow-md">
              <span className="relative h-6 w-6 overflow-hidden rounded-full">
                <Image
                  src={clm.avatars.gusz}
                  alt=""
                  fill
                  sizes="24px"
                  className="object-cover"
                />
              </span>
              Packaging by Gusz
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
