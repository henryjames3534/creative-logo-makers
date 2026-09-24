"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { LocalizedPrice } from "@/components/locale/LocalizedPrice";
import { Container } from "@/components/Section";

const logoTiles = [
  "/clm/logomaker-tiles/1.png",
  "/clm/logomaker-tiles/2.png",
  "/clm/logomaker-tiles/3.png",
  "/clm/logomaker-tiles/4.png",
  "/clm/logomaker-tiles/5.png",
];

const logoSlots = [
  { top: "5%", left: "4%", width: "45%", height: "46%" },
  { top: "5%", left: "51%", width: "45%", height: "46%" },
  { top: "54%", left: "3%", width: "30%", height: "41%" },
  { top: "54%", left: "35%", width: "30%", height: "41%" },
  { top: "54%", left: "67%", width: "30%", height: "41%" },
];

const contestReviews = [
  {
    name: "TikaDesign",
    level: "Top Level",
    avatar: "/clm/hero/avatar-raveart.jpg",
  },
  {
    name: "Adam Marsh",
    level: "Mid Level",
    avatar: "/clm/hero/avatar-mjvass.jpg",
  },
  {
    name: "Nadya Nadya",
    level: "Mid Level",
    avatar: "/clm/hero/avatar-kamilla.jpg",
  },
];

/** Percent-only slots so CSS can animate smoothly (no auto/right) */
const contestSlots = [
  { top: "8%", left: "20%" },
  { top: "36%", left: "5%" },
  { top: "64%", left: "18%" },
];

/** Free Logomaker + contest — cards swap into each other's places */
export function LogoPathsSection() {
  const [logoStep, setLogoStep] = useState(0);
  const [contestStep, setContestStep] = useState(0);

  useEffect(() => {
    const logoTimer = setInterval(() => {
      setLogoStep((s) => (s + 1) % logoTiles.length);
    }, 2800);
    const contestTimer = setInterval(() => {
      setContestStep((s) => (s + 1) % contestReviews.length);
    }, 2800);
    return () => {
      clearInterval(logoTimer);
      clearInterval(contestTimer);
    };
  }, []);

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
              <div className="relative aspect-[5/4] w-full">
                {logoTiles.map((src, cardIndex) => {
                  const slot =
                    logoSlots[(cardIndex + logoStep) % logoSlots.length];
                  return (
                    <div
                      key={src}
                      className="absolute overflow-hidden rounded-xl bg-white shadow-md transition-all duration-700 ease-[cubic-bezier(0.34,1.15,0.64,1)]"
                      style={{
                        top: slot.top,
                        left: slot.left,
                        width: slot.width,
                        height: slot.height,
                        zIndex: 10 - ((cardIndex + logoStep) % logoSlots.length),
                      }}
                    >
                      <Image
                        src={src}
                        alt={`Logo option ${cardIndex + 1}`}
                        fill
                        sizes="220px"
                        className="object-cover"
                      />
                    </div>
                  );
                })}
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
              className="relative mb-5 overflow-hidden rounded-2xl shadow-md"
              style={{ backgroundColor: "#3e00cd" }}
            >
              {/* Purple-only deco — no blue */}
              <div
                className="pointer-events-none absolute left-[10%] top-[8%] h-2.5 w-24 rounded-full"
                style={{ backgroundColor: "#2a0099" }}
              />
              <div
                className="pointer-events-none absolute bottom-[6%] right-[6%] h-14 w-14 rounded-full border-[9px]"
                style={{ borderColor: "#2a0099" }}
              />

              <div className="relative aspect-[5/4] w-full">
                {contestReviews.map((card, cardIndex) => {
                  const slotIndex =
                    (cardIndex + contestStep) % contestSlots.length;
                  const slot = contestSlots[slotIndex];
                  return (
                    <div
                      key={card.name}
                      className="absolute w-[72%] max-w-[260px] transition-[top,left,z-index] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{
                        top: slot.top,
                        left: slot.left,
                        zIndex: slotIndex === 1 ? 30 : 10 + slotIndex,
                      }}
                    >
                      <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#f3f2f0]">
                          <Image
                            src={card.avatar}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ink">
                            {card.name}
                          </p>
                          <p className="mt-0.5 text-[11px] tracking-wide text-[#f5a623]">
                            ★★★★★
                          </p>
                          <span className="mt-1 inline-block rounded border border-ink/20 px-1.5 py-0.5 text-[10px] font-semibold text-ink/70">
                            {card.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
