export type MegaItem = {
  href: string;
  label: string;
  description?: string;
  price?: string;
  badge?: string;
  icon?: "contest" | "project" | "studio" | "maker" | "pricing" | "start" | "strategy" | "identity" | "launch" | "call";
};

export type MegaColumn = {
  title: string;
  items: MegaItem[];
};

export type MegaPanel = {
  id: string;
  label: string;
  href: string;
  kind: "categories" | "how" | "designers" | "inspiration" | "studio";
  eyebrow?: string;
  columns?: MegaColumn[];
  featured?: {
    title: string;
    description: string;
    href: string;
    cta: string;
    image?: string;
    accent?: string;
  };
};

export const megaNav: MegaPanel[] = [
  {
    id: "categories",
    label: "Categories",
    href: "/categories",
    kind: "categories",
    eyebrow: "Design services",
    featured: {
      title: "Not sure where to start?",
      description:
        "Tell us what you need — we’ll match you with the right category and creative experts.",
      href: "/get-started",
      cta: "Get a design",
      image: "/clm/deserves.png",
      accent: "#834692",
    },
  },
  {
    id: "how",
    label: "How it works",
    href: "/how-it-works",
    kind: "how",
    eyebrow: "Ways to work",
    columns: [
      {
        title: "Choose your path",
        items: [
          {
            href: "/contests",
            label: "Design contest",
            description: "Dozens of concepts from our designer community",
            price: "From $249",
            badge: "Most popular",
            icon: "contest",
          },
          {
            href: "/projects",
            label: "1-to-1 project",
            description: "Hire one specialist and collaborate privately",
            price: "From $499",
            icon: "project",
          },
          {
            href: "/studio",
            label: "Creative Logo Makers Studio",
            description: "Full-service branding with Brand Strategists",
            price: "Custom",
            icon: "studio",
          },
          {
            href: "/logo-maker",
            label: "Free Logo Maker",
            description: "Create a logo in minutes — free to start",
            price: "Free",
            icon: "maker",
          },
        ],
      },
    ],
    featured: {
      title: "See how it works",
      description: "From brief to final files in four clear steps.",
      href: "/how-it-works",
      cta: "Learn the process",
      image: "/clm/logomaker.png",
      accent: "#00a581",
    },
  },
  {
    id: "designers",
    label: "Designers",
    href: "/designers/search",
    kind: "designers",
    eyebrow: "Creative community",
    columns: [
      {
        title: "By specialty",
        items: [
          { href: "/designers/search?skill=logo-design", label: "Logo & branding experts" },
          { href: "/designers/search?skill=web-design", label: "Web & app designers" },
          { href: "/designers/search?skill=product-packaging-design", label: "Packaging specialists" },
          { href: "/designers/search?skill=illustrations", label: "Illustration artists" },
          { href: "/designers/search?skill=book-cover-design", label: "Book cover designers" },
        ],
      },
      {
        title: "For designers",
        items: [
          {
            href: "/designers/search",
            label: "Browse portfolios",
            description: "Vetted creative experts",
          },
          {
            href: "/designers",
            label: "Become a designer",
            description: "Apply to join the community",
          },
        ],
      },
    ],
    featured: {
      title: "Work with creative experts",
      description: "All designers are vetted and rated by real customers.",
      href: "/designers/search",
      cta: "Browse designers",
      image: "/clm/hires/designer-man.jpg",
      accent: "#fe5f50",
    },
  },
  {
    id: "inspiration",
    label: "Inspiration",
    href: "/inspiration",
    kind: "inspiration",
    eyebrow: "Ideas & stories",
    columns: [
      {
        title: "Discover",
        items: [
          { href: "/inspiration", label: "Design blog" },
          { href: "/inspiration", label: "Logo inspiration" },
          { href: "/inspiration", label: "Packaging ideas" },
          { href: "/inspiration", label: "Brand stories" },
        ],
      },
    ],
    featured: {
      title: "Tips, trends & inspiration",
      description: "Fresh reads from the Creative Logo Makers blog.",
      href: "/inspiration",
      cta: "Take me to the blog",
      image: "/clm/hires/page-how.jpg",
      accent: "#2486cb",
    },
  },
  {
    id: "studio",
    label: "Studio",
    href: "/studio",
    kind: "studio",
    eyebrow: "Full-service branding",
    featured: {
      title: "Creative Logo Makers Studio",
      description:
        "Look established for launch. Stay sharp for a decade — with Brand Strategists.",
      href: "/studio",
      cta: "Learn more",
      image: "/clm/featured-studio.jpg",
      accent: "#3e00cd",
    },
    columns: [
      {
        title: "Studio services",
        items: [
          {
            href: "/studio/brand-strategy",
            label: "Brand strategy",
            description: "Positioning, messaging, brand pillars",
            price: "From $1,999",
            icon: "strategy",
            badge: "Core",
          },
          {
            href: "/studio/full-brand-identity",
            label: "Full brand identity",
            description: "Logo system, guides, launch assets",
            price: "From $4,499",
            icon: "identity",
          },
          {
            href: "/studio/launch-packages",
            label: "Launch packages",
            description: "Everything you need for day one",
            price: "From $2,499",
            icon: "launch",
          },
          {
            href: "/studio/talk-to-strategist",
            label: "Talk to a strategist",
            description: "Book a discovery call",
            price: "Free intro",
            icon: "call",
            badge: "New",
          },
        ],
      },
    ],
  },
];

export const megaBlogCards = [
  {
    title: "Colors and emotions: how colors make you feel",
    read: "9 min read",
    tag: "Tips",
    image: "/clm/blog/colors.png",
    href: "/inspiration",
  },
  {
    title: "26 bad packaging design examples",
    read: "15 min read",
    tag: "Packaging",
    image: "/clm/blog/packaging.jpg",
    href: "/inspiration",
  },
  {
    title: "Celebrating Queer Art: reimagining iconic logos",
    read: "23 min read",
    tag: "Brand",
    image: "/clm/blog/queer.jpg",
    href: "/inspiration",
  },
] as const;

export const megaDesignerFaces = [
  { src: "/clm/mosaic/reza.jpg", name: "Reza" },
  { src: "/clm/mosaic/mad.jpg", name: "Mad" },
  { src: "/clm/mosaic/radovan.jpg", name: "Radovan" },
  { src: "/clm/hero/avatar-kamilla.jpg", name: "Kamilla" },
  { src: "/clm/hero/avatar-raveart.jpg", name: "Raveart" },
  { src: "/clm/avatars/gusz.jpg", name: "Gusz" },
] as const;
