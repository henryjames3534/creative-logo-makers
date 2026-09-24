/** Creative Logo Makers homepage assets (local copies in /public/clm) */

export const clm = {
  hero: {
    vegan: {
      main: "/clm/hero/vegan-jerky.jpg",
      packaging: "/clm/hero/vegan-jerky-packaging.png",
      front: "/clm/hero/vegan-jerky-front.png",
      bg: "/clm/hero/vegan-jerky-background.png",
      avatar: "/clm/hero/avatar-mjvass.jpg",
    },
    danube: {
      main: "/clm/hero/little-danube.jpg",
      packaging: "/clm/hero/little-danube-packaging.png",
      logo: "/clm/hero/little-danube-logo.png",
      bg: "/clm/hero/little-danube-background.png",
      avatar: "/clm/hero/avatar-kamilla.jpg",
    },
    tea: {
      main: "/clm/hero/feel-good-tea.jpg",
      cup: "/clm/hero/feel-good-tea-cup.png",
      card: "/clm/hero/feel-good-tea-card.png",
      logo: "/clm/hero/feel-good-tea-logo.png",
      avatar: "/clm/hero/avatar-raveart.jpg",
    },
    studio: {
      main: "/clm/hero/the-studio.jpg",
      shirt: "/clm/hero/the-studio-shirt.png",
      art1: "/clm/hero/the-studio-art1.png",
      art2: "/clm/hero/the-studio-art2.png",
      avatar: "/clm/hero/avatar-illusive.jpg",
    },
  },
  categories: {
    "logo-branding": "/clm/hires/cat-logo.jpg",
    "website-app": "/clm/hires/cat-web.jpg",
    "business-advertising": "/clm/hires/cat-ads.jpg",
    "art-illustration": "/clm/hires/cat-art.jpg",
    "packaging-label": "/clm/hires/cat-pack.jpg",
  },
  deserves: "/clm/deserves.png",
  logomaker: "/clm/logomaker.png",
  logoContest: "/clm/logo-contest.png",
  ctaBanner: "/clm/cta-banner.png",
  studio: "/clm/featured-studio.jpg",
  studioLaura: "/clm/studio-laura.jpeg",
  avatars: {
    dunychi: "/clm/avatars/dunychi.jpg",
    setupshop: "/clm/avatars/setupshop.jpg",
    gusz: "/clm/avatars/gusz.jpg",
  },
  mosaic: [
    { src: "/clm/mosaic/reza.jpg", bg: "#3e00cd", label: "", isPhoto: true },
    { src: "/clm/mosaic/copilot.jpg", bg: "#f5f0e8", label: "" },
    { src: "/clm/mosaic/wanderlust.jpg", bg: "#2486cb", label: "" },
    { src: "/clm/mosaic/megahouse.jpg", bg: "#efeae2", label: "by reza ernanda" },
    { src: "/clm/mosaic/mad.jpg", bg: "#fe5f50", label: "", isPhoto: true },
    { src: "/clm/mosaic/bozzi.jpg", bg: "#f5f0e8", label: "" },
    { src: "/clm/mosaic/gundog.jpg", bg: "#1c1b1a", label: "" },
    { src: "/clm/mosaic/fox.jpg", bg: "#e8eef2", label: "by Mad pepper" },
    { src: "/clm/mosaic/radovan.jpg", bg: "#ff9000", label: "", isPhoto: true },
  ],
  blog: {
    queer: "/clm/blog/queer.jpg",
    colors: "/clm/blog/colors.png",
    packaging: "/clm/blog/packaging.jpg",
  },
} as const;
