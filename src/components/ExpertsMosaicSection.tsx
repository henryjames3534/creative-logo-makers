import Image from "next/image";
import { Button } from "@/components/Button";
import { Container } from "@/components/Section";
import { clm } from "@/data/clm-assets";

/** Logo mosaic + coral headline — official Creative Logo Makers tiles */
export function ExpertsMosaicSection() {
  return (
    <section className="bg-white py-14 md:py-20">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {clm.mosaic.map((tile, i) => (
              <div
                key={tile.src + i}
                className="relative overflow-hidden rounded-lg"
                style={{ backgroundColor: tile.bg }}
              >
                <div className="relative aspect-square p-2 sm:p-2.5">
                  <div
                    className={`relative h-full w-full overflow-hidden ${
                      "isPhoto" in tile && tile.isPhoto
                        ? "rounded-full"
                        : "rounded-md"
                    }`}
                  >
                    <Image
                      src={tile.src}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  </div>
                </div>
                {tile.label ? (
                  <p className="absolute bottom-1.5 left-2 z-10 text-[10px] font-medium text-ink/70">
                    {tile.label}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-4xl font-medium leading-tight tracking-tight text-coral md:text-[2.75rem]">
              Work with creative experts you can trust
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-ink/75">
              Feel confident working with our designer community. All our
              designers are vetted creative experts who&apos;ve worked with
              hundreds of businesses to bring their designs to life.
            </p>
            <div className="mt-7">
              <Button href="/designers/search" variant="primary">
                Browse designer portfolios
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
