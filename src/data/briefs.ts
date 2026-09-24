import type { Category } from "@/data/categories";
import { getCategory, legacySlugMap } from "@/data/categories";

export type BriefField =
  | {
      id: string;
      type: "text" | "textarea" | "email";
      label: string;
      placeholder?: string;
      required?: boolean;
    }
  | {
      id: string;
      type: "chips";
      label: string;
      options: string[];
      multi?: boolean;
      required?: boolean;
    }
  | {
      id: string;
      type: "visual";
      label: string;
      hint?: string;
      options: { id: string; label: string; image: string }[];
      multi?: boolean;
      required?: boolean;
    }
  | {
      id: string;
      type: "colors";
      label: string;
      options: { id: string; label: string; swatches: string[] }[];
      multi?: boolean;
      required?: boolean;
    };

export type BriefStep = {
  id: string;
  title: string;
  description: string;
  fields: BriefField[];
};

type VisualOpt = { id: string; label: string; image: string };

/** Logo / brand mark directions */
const logoVisuals: VisualOpt[] = [
  { id: "minimal", label: "Minimal wordmark", image: "/clm/mosaic/fit.jpg" },
  { id: "bold", label: "Bold & modern", image: "/clm/mosaic/megahouse.jpg" },
  { id: "vintage", label: "Vintage badge", image: "/clm/mosaic/wanderlust.jpg" },
  { id: "playful", label: "Playful mascot", image: "/clm/mosaic/bozzi.jpg" },
  { id: "luxury", label: "Luxury emblem", image: "/clm/mosaic/fox.jpg" },
  { id: "tech", label: "Tech icon", image: "/clm/mosaic/copilot.jpg" },
  { id: "organic", label: "Organic brand", image: "/clm/hero/feel-good-tea.jpg" },
  { id: "illustrated", label: "Illustrated mark", image: "/clm/mosaic/gundog.jpg" },
];

/** Website / app UI directions — local assets only */
const webVisuals: VisualOpt[] = [
  { id: "saas", label: "Clean SaaS landing", image: "/clm/hires/cat-web.jpg" },
  { id: "ecommerce", label: "E-commerce store", image: "/clm/hires/design-workspace.jpg" },
  { id: "mobile", label: "Mobile app UI", image: "/clm/unique/mobile-app.jpg" },
  { id: "dashboard", label: "Dashboard / admin", image: "/clm/hires/page-project.jpg" },
  { id: "agency", label: "Agency / portfolio", image: "/clm/hires/creative-team.jpg" },
  { id: "bold-marketing", label: "Bold marketing site", image: "/clm/cta-banner.png" },
  { id: "editorial", label: "Editorial / blog", image: "/clm/blog/queer.jpg" },
  { id: "lifestyle", label: "Lifestyle brand site", image: "/clm/hires/cat-brand.jpg" },
];

const packagingVisuals: VisualOpt[] = [
  { id: "premium-food", label: "Premium food pack", image: "/clm/hero/vegan-jerky.jpg" },
  { id: "beverage", label: "Beverage / bottle", image: "/clm/hero/little-danube.jpg" },
  { id: "tea-wellness", label: "Wellness / tea", image: "/clm/hero/feel-good-tea.jpg" },
  { id: "shelf-retail", label: "Retail shelf pack", image: "/clm/unique/pack-shelf.jpg" },
  { id: "craft", label: "Craft / indie", image: "/clm/blog/packaging.jpg" },
  { id: "boxed", label: "Boxed product", image: "/clm/hires/cat-pack.jpg" },
  { id: "beauty", label: "Beauty / cosmetics", image: "/clm/deserves-parts/packaging.png" },
  { id: "minimal-label", label: "Minimal label", image: "/clm/hero/vegan-jerky-packaging.png" },
];

const bookVisuals: VisualOpt[] = [
  { id: "literary", label: "Literary fiction", image: "/clm/hires/cat-book.jpg" },
  { id: "thriller", label: "Thriller / dark", image: "/clm/blog/colors.png" },
  { id: "romance", label: "Romance", image: "/clm/hires/strategist-woman.jpg" },
  { id: "business", label: "Business / nonfiction", image: "/clm/hires/design-workspace.jpg" },
  { id: "children", label: "Children's", image: "/clm/mosaic/bozzi.jpg" },
  { id: "fantasy", label: "Fantasy / illustrated", image: "/clm/mosaic/gundog.jpg" },
  { id: "memoir", label: "Memoir / photo", image: "/clm/hires/laura.jpg" },
  { id: "minimal-type", label: "Typographic cover", image: "/clm/mosaic/fit.jpg" },
];

const merchVisuals: VisualOpt[] = [
  { id: "streetwear", label: "Streetwear tee", image: "/clm/unique/tshirt.jpg" },
  { id: "minimal-tee", label: "Minimal print", image: "/clm/hero/the-studio-shirt.png" },
  { id: "hoodie", label: "Hoodie graphic", image: "/clm/unique/merch.jpg" },
  { id: "tote", label: "Tote / bag", image: "/clm/unique/clothing.jpg" },
  { id: "cap", label: "Cap / hat", image: "/clm/mosaic/copilot.jpg" },
  { id: "sticker", label: "Sticker pack", image: "/clm/unique/sticker.jpg" },
  { id: "varsity", label: "Varsity / retro", image: "/clm/mosaic/wanderlust.jpg" },
  { id: "illustration-print", label: "Illustrated print", image: "/clm/unique/mascot.jpg" },
];

const artVisuals: VisualOpt[] = [
  { id: "character", label: "Character / mascot", image: "/clm/unique/mascot.jpg" },
  { id: "editorial", label: "Editorial art", image: "/clm/hires/cat-art.jpg" },
  { id: "flat", label: "Flat vector", image: "/clm/mosaic/megahouse.jpg" },
  { id: "watercolor", label: "Watercolor", image: "/clm/blog/colors.png" },
  { id: "line", label: "Line art", image: "/clm/mosaic/fox.jpg" },
  { id: "3d", label: "3D / digital", image: "/clm/unique/3d.jpg" },
  { id: "pattern", label: "Pattern / surface", image: "/clm/hero/the-studio-art1.png" },
  { id: "storybook", label: "Storybook", image: "/clm/mosaic/gundog.jpg" },
];

const adsVisuals: VisualOpt[] = [
  { id: "business-card", label: "Business card", image: "/clm/unique/business-card.jpg" },
  { id: "print-ad", label: "Print ad / flyer", image: "/clm/hires/cat-ads.jpg" },
  { id: "poster", label: "Poster / OOH", image: "/clm/unique/poster.jpg" },
  { id: "presentation", label: "Presentation deck", image: "/clm/unique/ppt.jpg" },
  { id: "social-ad", label: "Social ad creative", image: "/clm/unique/social-pack.jpg" },
  { id: "banner", label: "Web banner", image: "/clm/unique/fb-cover.jpg" },
  { id: "brochure", label: "Brochure / trifold", image: "/clm/unique/brochure.jpg" },
  { id: "stationery", label: "Stationery suite", image: "/clm/unique/stationery.jpg" },
];

const socialVisuals: VisualOpt[] = [
  { id: "feed-grid", label: "Feed grid aesthetic", image: "/clm/hires/cat-social.jpg" },
  { id: "stories", label: "Stories / Reels", image: "/clm/hires/d2.jpg" },
  { id: "carousel", label: "Carousel / tips", image: "/clm/blog/queer.jpg" },
  { id: "youtube", label: "YouTube thumbnails", image: "/clm/hires/d3.jpg" },
  { id: "linkedin", label: "LinkedIn / B2B", image: "/clm/hires/creative-team.jpg" },
  { id: "ugc", label: "UGC / lifestyle", image: "/clm/hires/designer-man.jpg" },
  { id: "promo", label: "Promo / sale posts", image: "/clm/unique/poster.jpg" },
  { id: "brand-kit", label: "Brand template kit", image: "/clm/unique/brand-pack.jpg" },
];

const colorPalettes = [
  { id: "mono", label: "Black & white", swatches: ["#1c1b1a", "#ffffff", "#9a9a9a"] },
  { id: "earth", label: "Earth tones", swatches: ["#8b5e3c", "#c4a574", "#2f4f3e"] },
  { id: "ocean", label: "Ocean", swatches: ["#125867", "#2486cb", "#a8d5e5"] },
  { id: "coral", label: "Warm coral", swatches: ["#fe5f50", "#ffb4a8", "#1c1b1a"] },
  { id: "violet", label: "Violet", swatches: ["#3e00cd", "#834692", "#e8d5ff"] },
  { id: "green", label: "Fresh green", swatches: ["#00a581", "#0b3d2e", "#d4f5ea"] },
  { id: "gold", label: "Gold & ink", swatches: ["#a5823d", "#1c1b1a", "#f5efe0"] },
  { id: "custom", label: "Surprise me", swatches: ["#f3f2f0", "#834692", "#fe5f50"] },
];

function baseContactFields(): BriefField[] {
  return [
    {
      id: "brandName",
      type: "text",
      label: "Brand / company name",
      placeholder: "e.g. Salt Banana Club",
      required: true,
    },
    {
      id: "tagline",
      type: "text",
      label: "Tagline (optional)",
      placeholder: "A short line that sits with your design",
    },
    {
      id: "email",
      type: "email",
      label: "Email",
      placeholder: "you@company.com",
      required: true,
    },
  ];
}

function styleStep(
  title: string,
  visuals: VisualOpt[],
  description = "Select the looks that feel right — designers use this as visual direction.",
  label = "Pick at least 2 styles",
): BriefStep {
  return {
    id: "styles",
    title,
    description,
    fields: [
      {
        id: "styles",
        type: "visual",
        label,
        hint: "Click to select / deselect",
        options: visuals,
        multi: true,
        required: true,
      },
    ],
  };
}

function colorsStep(description?: string): BriefStep {
  return {
    id: "colors",
    title: "Color preferences",
    description:
      description ??
      "Choose palettes you love — or leave room for creative freedom.",
    fields: [
      {
        id: "colors",
        type: "colors",
        label: "Preferred palettes",
        options: colorPalettes,
        multi: true,
      },
      {
        id: "avoidColors",
        type: "chips",
        label: "Colors to avoid (optional)",
        options: ["Red", "Neon", "Pastels", "Brown", "Purple", "None"],
        multi: true,
      },
    ],
  };
}

function aboutStep(
  extraChips?: string[],
  descriptionLabel = "Describe what you need",
  descriptionPlaceholder = "Audience, must-haves, competitors you like, anything to avoid…",
): BriefStep {
  return {
    id: "about",
    title: "About your brand",
    description: "A clear brief gets better concepts.",
    fields: [
      ...baseContactFields(),
      {
        id: "industry",
        type: "chips",
        label: "Industry",
        options: extraChips ?? [
          "Food & drink",
          "Tech / SaaS",
          "Health & wellness",
          "Fashion",
          "Professional services",
          "Retail",
          "Education",
          "Other",
        ],
        required: true,
      },
      {
        id: "description",
        type: "textarea",
        label: descriptionLabel,
        placeholder: descriptionPlaceholder,
        required: true,
      },
    ],
  };
}

/** Per-category multi-step visual briefs (Creative Logo Makers-style) */
export function getBriefSteps(slug: string): BriefStep[] {
  const resolved =
    getCategory(slug) ?? getCategory(legacySlugMap[slug] ?? "");
  const family = resolved?.briefFamily ?? slug;

  switch (family) {
    case "logo":
      return [
        styleStep(
          "Which logo styles speak to you?",
          logoVisuals,
          "Pick directions for your mark — wordmarks, icons, badges, and more.",
          "Pick at least 2 logo directions",
        ),
        colorsStep(),
        {
          id: "logo-type",
          title: "Logo type & usage",
          description: "Tell us how the mark will live in the real world.",
          fields: [
            {
              id: "logoType",
              type: "chips",
              label: "Preferred logo type",
              options: [
                "Wordmark",
                "Lettermark",
                "Icon + wordmark",
                "Emblem / badge",
                "Not sure",
              ],
              required: true,
            },
            {
              id: "usage",
              type: "chips",
              label: "Where will it be used?",
              options: [
                "Website",
                "Social",
                "Packaging",
                "Signage",
                "Print",
                "App icon",
              ],
              multi: true,
            },
          ],
        },
        aboutStep(
          undefined,
          "Describe your brand",
          "Who you serve, personality words, logos you like or dislike…",
        ),
      ];

    case "website":
      return [
        styleStep(
          "Which website / UI vibes fit?",
          webVisuals,
          "Choose site and product UI directions — not logos. Designers match layout, hierarchy, and interaction feel.",
          "Pick at least 2 UI / web styles",
        ),
        {
          id: "scope",
          title: "Project scope",
          description: "What are we designing for the web or app?",
          fields: [
            {
              id: "projectType",
              type: "chips",
              label: "Project type",
              options: [
                "Landing page",
                "Marketing website",
                "E-commerce",
                "SaaS product UI",
                "Mobile app",
                "Web app / dashboard",
              ],
              required: true,
            },
            {
              id: "pages",
              type: "chips",
              label: "Pages / screens needed",
              options: [
                "Home / hero",
                "Pricing",
                "About",
                "Features",
                "Blog",
                "Checkout",
                "Auth / onboarding",
                "Account settings",
              ],
              multi: true,
              required: true,
            },
            {
              id: "devices",
              type: "chips",
              label: "Priority devices",
              options: ["Desktop first", "Mobile first", "Tablet", "All equal"],
              required: true,
            },
            {
              id: "deliverable",
              type: "chips",
              label: "What should designers deliver?",
              options: [
                "High-fidelity mockups",
                "Clickable prototype",
                "Design system / UI kit",
                "Wireframes + UI",
              ],
              multi: true,
            },
          ],
        },
        colorsStep("UI colors for buttons, backgrounds, and brand accents."),
        aboutStep(
          ["SaaS", "Agency", "E-commerce", "Local business", "Startup", "Nonprofit", "Other"],
          "Site goals & content notes",
          "Primary CTA, audience, sites you like (URLs ok), must-have sections, tech constraints…",
        ),
      ];

    case "packaging":
    case "packaging-label":
    case "product-packaging-design":
    case "product-label-design":
    case "other-packaging-label-design":
      return [
        styleStep(
          "Packaging looks you love",
          packagingVisuals,
          "Shelf-ready directions — labels, boxes, bottles, and kits.",
          "Pick at least 2 packaging directions",
        ),
        {
          id: "product",
          title: "Product details",
          description: "Help designers understand the shelf context.",
          fields: [
            {
              id: "packType",
              type: "chips",
              label: "Packaging type",
              options: [
                "Label",
                "Box",
                "Pouch",
                "Bottle",
                "Can",
                "Kit / set",
              ],
              required: true,
            },
            {
              id: "info",
              type: "chips",
              label: "Must show on pack",
              options: [
                "Brand name",
                "Flavor / variant",
                "Ingredients",
                "Nutrition",
                "Barcode space",
                "Certifications",
              ],
              multi: true,
            },
            {
              id: "shelf",
              type: "chips",
              label: "Shelf neighbors",
              options: ["Premium", "Value", "Organic", "Kids", "Luxury", "Indie"],
              multi: true,
            },
          ],
        },
        colorsStep(),
        aboutStep(
          ["Food & drink", "Beauty", "Supplements", "Home", "Pet", "Other"],
          "Product & brand story",
          "What's inside, target shopper, competitors on shelf, claims to highlight…",
        ),
      ];

    case "book":
    case "book-cover":
    case "book-cover-design":
    case "magazine-cover-design":
    case "album-cover-design":
    case "podcast-cover-design":
    case "other-book-magazine-design":
      return [
        styleStep(
          "Cover styles you like",
          bookVisuals,
          "Genre and mood for the front cover — typography, imagery, and atmosphere.",
          "Pick at least 2 cover directions",
        ),
        {
          id: "book",
          title: "About the book",
          description: "Genre and format shape the cover.",
          fields: [
            {
              id: "genre",
              type: "chips",
              label: "Genre",
              options: [
                "Fiction",
                "Nonfiction",
                "Romance",
                "Thriller",
                "Business",
                "Children",
                "Memoir",
              ],
              required: true,
            },
            {
              id: "format",
              type: "chips",
              label: "Format",
              options: ["Paperback", "Hardcover", "Ebook", "Audiobook", "Series"],
              multi: true,
            },
            {
              id: "elements",
              type: "chips",
              label: "Cover must include",
              options: [
                "Title",
                "Subtitle",
                "Author name",
                "Series name",
                "Endorsement quote",
              ],
              multi: true,
              required: true,
            },
          ],
        },
        colorsStep(),
        aboutStep(
          undefined,
          "Plot / theme notes",
          "Tone, setting, comparable titles, imagery to use or avoid…",
        ),
      ];

    case "merch":
    case "merchandise":
    case "t-shirt-design":
    case "merchandise-design":
    case "clothing-apparel-design":
    case "cup-mug-design":
    case "sticker-design":
    case "other-clothing-merchandise-design":
      return [
        styleStep(
          "Merch graphics that fit",
          merchVisuals,
          "Print-ready directions for apparel and promo products.",
          "Pick at least 2 merch styles",
        ),
        {
          id: "merch",
          title: "Merchandise details",
          description: "What are we printing on?",
          fields: [
            {
              id: "apparel",
              type: "chips",
              label: "Products",
              options: ["T-shirt", "Hoodie", "Tote", "Cap", "Stickers", "Other"],
              multi: true,
              required: true,
            },
            {
              id: "placement",
              type: "chips",
              label: "Artwork placement",
              options: [
                "Chest center",
                "Full front",
                "Back print",
                "Left chest",
                "All-over",
              ],
              multi: true,
            },
            {
              id: "print",
              type: "chips",
              label: "Print style",
              options: ["Screen print", "Embroidery", "DTG", "Not sure"],
            },
          ],
        },
        colorsStep(),
        aboutStep(
          undefined,
          "Merch concept",
          "Audience, slogan/text to include, vibe (tour, corporate, event)…",
        ),
      ];

    case "art":
    case "art-illustration":
    case "illustrations":
    case "character-mascot-design":
    case "icon-button-design":
    case "3d-design":
    case "tattoo-design":
    case "other-art-illustration":
      return [
        styleStep(
          "Illustration styles",
          artVisuals,
          "Art direction for characters, scenes, patterns, and editorial pieces.",
          "Pick at least 2 illustration styles",
        ),
        {
          id: "art-use",
          title: "How it’ll be used",
          description: "Purpose guides composition and detail.",
          fields: [
            {
              id: "useCase",
              type: "chips",
              label: "Use case",
              options: [
                "Mascot",
                "Editorial",
                "Packaging art",
                "Pattern",
                "Campaign",
                "Character",
              ],
              multi: true,
              required: true,
            },
            {
              id: "complexity",
              type: "chips",
              label: "Level of detail",
              options: ["Simple / icon", "Medium", "Highly detailed", "Not sure"],
            },
          ],
        },
        colorsStep(),
        aboutStep(
          undefined,
          "Art brief",
          "Subject, mood, references, what must appear in the illustration…",
        ),
      ];

    case "social":
    case "social-content":
    case "social-media-page-design":
    case "facebook-cover-design":
      return [
        styleStep(
          "Social feed vibes",
          socialVisuals,
          "Look and feel for posts, stories, thumbnails, and templates.",
          "Pick at least 2 social styles",
        ),
        {
          id: "platforms",
          title: "Platforms & formats",
          description: "Designers will size for the channels you pick.",
          fields: [
            {
              id: "platforms",
              type: "chips",
              label: "Platforms",
              options: [
                "Instagram",
                "TikTok",
                "LinkedIn",
                "YouTube",
                "Facebook",
                "Stories",
              ],
              multi: true,
              required: true,
            },
            {
              id: "formats",
              type: "chips",
              label: "Formats",
              options: ["Posts", "Carousels", "Stories", "Thumbnails", "Covers"],
              multi: true,
            },
            {
              id: "volume",
              type: "chips",
              label: "How many designs?",
              options: ["1–3 posts", "Template pack", "Full content kit", "Not sure"],
            },
          ],
        },
        colorsStep(),
        aboutStep(
          undefined,
          "Content themes",
          "Topics, tone of voice, sample captions, accounts you admire…",
        ),
      ];

    case "ads":
    case "business-advertising":
    default:
      return [
        styleStep(
          "Ad & collateral styles",
          adsVisuals,
          "Directions for cards, flyers, decks, and campaign creatives.",
          "Pick at least 2 collateral styles",
        ),
        {
          id: "collateral",
          title: "What do you need?",
          description: "Select the assets in this contest.",
          fields: [
            {
              id: "assets",
              type: "chips",
              label: "Assets",
              options: [
                "Business card",
                "Flyer",
                "Poster",
                "Presentation",
                "Social ad",
                "Banner",
              ],
              multi: true,
              required: true,
            },
            {
              id: "goal",
              type: "chips",
              label: "Primary goal",
              options: [
                "Brand awareness",
                "Lead gen / CTA",
                "Event promo",
                "Sales offer",
                "Credibility",
              ],
              required: true,
            },
          ],
        },
        colorsStep(),
        aboutStep(
          undefined,
          "Campaign / offer details",
          "Headline ideas, offer, contact info to include, brand guidelines…",
        ),
      ];
  }
}

export { getContestPackages, getPackageById } from "@/data/packages";

export function briefTitle(cat: Category, packageName: string) {
  return `Launch a ${cat.productName} contest · ${packageName}`;
}
