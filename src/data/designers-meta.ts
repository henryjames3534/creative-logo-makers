import type { DesignerLevel } from "./designers-types";

export const designerLevels: {
  id: DesignerLevel | "all";
  label: string;
}[] = [
  { id: "all", label: "All levels" },
  { id: "top", label: "Top Level" },
  { id: "mid", label: "Mid Level" },
  { id: "entry", label: "Entry Level" },
];

/** Full Creative Logo Makers designer skill / category filters (from Creative Logo Makers API catalog) */
export const designerSkillFilters = [
  {
    "id": "3d-design",
    "label": "3D"
  },
  {
    "id": "album-cover-design",
    "label": "Album cover"
  },
  {
    "id": "app-design",
    "label": "App design"
  },
  {
    "id": "mobile-app-design",
    "label": "App design"
  },
  {
    "id": "art-illustration",
    "label": "Art & illustration"
  },
  {
    "id": "banner-ad-design",
    "label": "Banner ad"
  },
  {
    "id": "book-magazine-design",
    "label": "Book & magazine"
  },
  {
    "id": "book-cover-design",
    "label": "Book cover"
  },
  {
    "id": "brand-guide",
    "label": "Brand guide"
  },
  {
    "id": "brand-identity-pack",
    "label": "Brand identity pack"
  },
  {
    "id": "brochure-design",
    "label": "Brochure"
  },
  {
    "id": "business-advertising",
    "label": "Business & advertising"
  },
  {
    "id": "business-card-design",
    "label": "Business card"
  },
  {
    "id": "buttons-icons",
    "label": "Buttons & icons"
  },
  {
    "id": "card-invitation-design",
    "label": "Card or invitation"
  },
  {
    "id": "character-mascot-design",
    "label": "Character or mascot"
  },
  {
    "id": "clothing-merchandise-design",
    "label": "Clothing & merchandise"
  },
  {
    "id": "clothing-apparel-design",
    "label": "Clothing or apparel"
  },
  {
    "id": "cup-mug-design",
    "label": "Cup or mug"
  },
  {
    "id": "email-design",
    "label": "Email"
  },
  {
    "id": "facebook-ad",
    "label": "Facebook ad"
  },
  {
    "id": "facebook-cover-design",
    "label": "Facebook cover"
  },
  {
    "id": "flash-animation",
    "label": "Flash animation"
  },
  {
    "id": "flash-banner-design",
    "label": "Flash banner"
  },
  {
    "id": "icon-button-design",
    "label": "Icon or button"
  },
  {
    "id": "illustrations",
    "label": "Illustration or graphics"
  },
  {
    "id": "infographic-design",
    "label": "Infographic"
  },
  {
    "id": "landing-page-design",
    "label": "Landing page"
  },
  {
    "id": "logo",
    "label": "Logo"
  },
  {
    "id": "logo-brand-guide",
    "label": "Logo & brand guide"
  },
  {
    "id": "logo-business-card-design",
    "label": "Logo & business card"
  },
  {
    "id": "logo-product-packaging",
    "label": "Logo & packaging"
  },
  {
    "id": "logo-website",
    "label": "Logo & website"
  },
  {
    "id": "logo-design",
    "label": "Logo design"
  },
  {
    "id": "magazine-cover-design",
    "label": "Magazine cover"
  },
  {
    "id": "menu-design",
    "label": "Menu"
  },
  {
    "id": "merchandise-design",
    "label": "Merchandise"
  },
  {
    "id": "nationbuilder",
    "label": "NationBuilder"
  },
  {
    "id": "other",
    "label": "Other"
  },
  {
    "id": "other-art-illustration",
    "label": "Other art or illustration"
  },
  {
    "id": "other-book-magazine-design",
    "label": "Other book or magazine"
  },
  {
    "id": "other-business-advertising",
    "label": "Other business or advertising"
  },
  {
    "id": "other-clothing-merchandise-design",
    "label": "Other clothing or merchandise"
  },
  {
    "id": "other-design",
    "label": "Other design"
  },
  {
    "id": "other-design-tasks",
    "label": "Other design tasks"
  },
  {
    "id": "other-packaging-label-design",
    "label": "Other packaging or label"
  },
  {
    "id": "other-website-app-design",
    "label": "Other web or app"
  },
  {
    "id": "packaging-label-design",
    "label": "Packaging & label"
  },
  {
    "id": "podcast-cover-design",
    "label": "Podcast cover"
  },
  {
    "id": "postcard-flyer-design",
    "label": "Postcard or flyer"
  },
  {
    "id": "poster-design",
    "label": "Poster"
  },
  {
    "id": "powerpoint-template-design",
    "label": "PowerPoint template"
  },
  {
    "id": "prezi-design",
    "label": "Prezi"
  },
  {
    "id": "print-design",
    "label": "Print design"
  },
  {
    "id": "product-label-design",
    "label": "Product label"
  },
  {
    "id": "product-packaging-design",
    "label": "Product packaging"
  },
  {
    "id": "quickbooks-form-design",
    "label": "QuickBooks form"
  },
  {
    "id": "signage-design",
    "label": "Signage"
  },
  {
    "id": "social-media-pack",
    "label": "Social media pack"
  },
  {
    "id": "social-media-page-design",
    "label": "Social media page"
  },
  {
    "id": "square-online-store",
    "label": "Square online store"
  },
  {
    "id": "squarespace",
    "label": "Squarespace"
  },
  {
    "id": "stationery-design",
    "label": "Stationery"
  },
  {
    "id": "sticker-design",
    "label": "Sticker"
  },
  {
    "id": "t-shirt-design",
    "label": "T-shirt"
  },
  {
    "id": "tattoo-design",
    "label": "Tattoo"
  },
  {
    "id": "twitter-background-design",
    "label": "Twitter header"
  },
  {
    "id": "typesetting",
    "label": "Typesetting"
  },
  {
    "id": "typesetting-with-imagery",
    "label": "Typesetting with imagery"
  },
  {
    "id": "car-truck-van-wrap-design",
    "label": "Vehicle wrap"
  },
  {
    "id": "website-app-design",
    "label": "Web & app design"
  },
  {
    "id": "web-design-coded",
    "label": "Web design (coded)"
  },
  {
    "id": "web-design",
    "label": "Web page design"
  },
  {
    "id": "web-builder",
    "label": "Website builder"
  },
  {
    "id": "wix-website",
    "label": "Wix website"
  },
  {
    "id": "custom-wordpress-themes",
    "label": "WordPress theme"
  },
  {
    "id": "wordpress-theme-design",
    "label": "WordPress theme design"
  },
  {
    "id": "zoom-background-design",
    "label": "Zoom background"
  }
] as const;

export const designerIndustryFilters = [
  {
    "id": "accounting",
    "label": "Accounting"
  },
  {
    "id": "agriculture",
    "label": "Agriculture"
  },
  {
    "id": "animals",
    "label": "Animals"
  },
  {
    "id": "architectural",
    "label": "Architectural"
  },
  {
    "id": "art",
    "label": "Art"
  },
  {
    "id": "attorney",
    "label": "Attorney"
  },
  {
    "id": "automotive",
    "label": "Automotive"
  },
  {
    "id": "bar",
    "label": "Bar"
  },
  {
    "id": "business",
    "label": "Business"
  },
  {
    "id": "children",
    "label": "Children"
  },
  {
    "id": "cleaning",
    "label": "Cleaning"
  },
  {
    "id": "communications",
    "label": "Communications"
  },
  {
    "id": "community",
    "label": "Community"
  },
  {
    "id": "computer",
    "label": "Computer"
  },
  {
    "id": "construction",
    "label": "Construction"
  },
  {
    "id": "cosmetics",
    "label": "Cosmetics"
  },
  {
    "id": "dating",
    "label": "Dating"
  },
  {
    "id": "education",
    "label": "Education"
  },
  {
    "id": "entertainment",
    "label": "Entertainment"
  },
  {
    "id": "environment",
    "label": "Environment"
  },
  {
    "id": "fashion",
    "label": "Fashion"
  },
  {
    "id": "floral",
    "label": "Floral"
  },
  {
    "id": "food",
    "label": "Food"
  },
  {
    "id": "games",
    "label": "Games"
  },
  {
    "id": "home",
    "label": "Home"
  },
  {
    "id": "industrial",
    "label": "Industrial"
  },
  {
    "id": "internet",
    "label": "Internet"
  },
  {
    "id": "landscaping",
    "label": "Landscaping"
  },
  {
    "id": "medical",
    "label": "Medical"
  },
  {
    "id": "other",
    "label": "Other"
  },
  {
    "id": "photography",
    "label": "Photography"
  },
  {
    "id": "physical",
    "label": "Physical"
  },
  {
    "id": "politics",
    "label": "Politics"
  },
  {
    "id": "realestate",
    "label": "Realestate"
  },
  {
    "id": "religious",
    "label": "Religious"
  },
  {
    "id": "restaurant",
    "label": "Restaurant"
  },
  {
    "id": "retail",
    "label": "Retail"
  },
  {
    "id": "security",
    "label": "Security"
  },
  {
    "id": "spa",
    "label": "Spa"
  },
  {
    "id": "sports",
    "label": "Sports"
  },
  {
    "id": "technology",
    "label": "Technology"
  },
  {
    "id": "travel",
    "label": "Travel"
  },
  {
    "id": "wedding",
    "label": "Wedding"
  }
] as const;

export const designerCountries = [
  {
    "id": "all",
    "label": "Any country"
  },
  {
    "id": "US",
    "label": "United States"
  },
  {
    "id": "GB",
    "label": "United Kingdom"
  },
  {
    "id": "DE",
    "label": "Germany"
  },
  {
    "id": "AU",
    "label": "Australia"
  },
  {
    "id": "CA",
    "label": "Canada"
  },
  {
    "id": "NL",
    "label": "Netherlands"
  },
  {
    "id": "PT",
    "label": "Portugal"
  },
  {
    "id": "JP",
    "label": "Japan"
  },
  {
    "id": "AE",
    "label": "United Arab Emirates"
  },
  {
    "id": "MX",
    "label": "Mexico"
  },
  {
    "id": "EG",
    "label": "Egypt"
  },
  {
    "id": "ID",
    "label": "Indonesia"
  },
  {
    "id": "IN",
    "label": "India"
  },
  {
    "id": "BR",
    "label": "Brazil"
  },
  {
    "id": "ES",
    "label": "Spain"
  },
  {
    "id": "FR",
    "label": "France"
  },
  {
    "id": "IT",
    "label": "Italy"
  },
  {
    "id": "UA",
    "label": "Ukraine"
  },
  {
    "id": "PL",
    "label": "Poland"
  },
  {
    "id": "PK",
    "label": "Pakistan"
  }
] as const;

/** Designer catalog — 319 profiles */
export const designerHeroImage = "/clm/designers/hero.png";

export const designerNeedChips = [
  {
    "label": "Logo design",
    "skill": "logo-design",
    "icon": "logo-design"
  },
  {
    "label": "Web page design",
    "skill": "web-design",
    "icon": "web-design"
  },
  {
    "label": "Postcard, flyer or print",
    "skill": "postcard-flyer-design",
    "icon": "postcard-flyer-design"
  },
  {
    "label": "Illustration or graphics",
    "skill": "illustrations",
    "icon": "illustrations"
  },
  {
    "label": "Product packaging",
    "skill": "product-packaging-design",
    "icon": "product-packaging-design"
  },
  {
    "label": "Product label",
    "skill": "product-label-design",
    "icon": "product-label-design"
  },
  {
    "label": "Book cover",
    "skill": "book-cover-design",
    "icon": "book-cover-design"
  }
] as const;

export const designerCategoryTree = [
  {
    "id": "logo-identity",
    "label": "Logo & identity",
    "children": [
      {
        "id": "logo-design",
        "label": "Logo design"
      },
      {
        "id": "brand-identity-pack",
        "label": "Logo & brand identity pack"
      },
      {
        "id": "social-media-pack",
        "label": "Logo & social media pack"
      },
      {
        "id": "logo-business-card-design",
        "label": "Logo & business card"
      },
      {
        "id": "brand-guide",
        "label": "Brand guide"
      },
      {
        "id": "business-card-design",
        "label": "Business card"
      },
      {
        "id": "stationery-design",
        "label": "Stationery"
      },
      {
        "id": "logo-brand-guide",
        "label": "Logo & brand guide"
      },
      {
        "id": "product-packaging-design",
        "label": "Logo & product packaging"
      }
    ]
  },
  {
    "id": "web-app",
    "label": "Web & app design",
    "children": [
      {
        "id": "web-design",
        "label": "Web page design"
      },
      {
        "id": "wordpress-theme-design",
        "label": "WordPress theme design"
      },
      {
        "id": "landing-page-design",
        "label": "Landing page design"
      },
      {
        "id": "icon-button-design",
        "label": "Icon or button"
      },
      {
        "id": "mobile-app-design",
        "label": "App design"
      },
      {
        "id": "facebook-cover-design",
        "label": "Facebook cover"
      },
      {
        "id": "social-media-page-design",
        "label": "Social media page"
      },
      {
        "id": "banner-ad-design",
        "label": "Banner ad"
      }
    ]
  },
  {
    "id": "business-advertising",
    "label": "Business & advertising",
    "children": [
      {
        "id": "postcard-flyer-design",
        "label": "Postcard, flyer or print"
      },
      {
        "id": "poster-design",
        "label": "Poster"
      },
      {
        "id": "infographic-design",
        "label": "Infographic"
      },
      {
        "id": "brochure-design",
        "label": "Brochure"
      },
      {
        "id": "car-truck-van-wrap-design",
        "label": "Car, truck or van wrap"
      },
      {
        "id": "signage-design",
        "label": "Signage"
      },
      {
        "id": "email-design",
        "label": "Email"
      },
      {
        "id": "powerpoint-template-design",
        "label": "PowerPoint template"
      },
      {
        "id": "menu-design",
        "label": "Menu"
      },
      {
        "id": "album-cover-design",
        "label": "Album Cover"
      },
      {
        "id": "podcast-cover-design",
        "label": "Podcast"
      }
    ]
  },
  {
    "id": "clothing-merchandise",
    "label": "Clothing & merchandise",
    "children": [
      {
        "id": "t-shirt-design",
        "label": "T-shirt"
      },
      {
        "id": "clothing-apparel-design",
        "label": "Clothing or apparel"
      },
      {
        "id": "merchandise-design",
        "label": "Merchandise"
      },
      {
        "id": "cup-mug-design",
        "label": "Cup or mug"
      },
      {
        "id": "sticker-design",
        "label": "Sticker"
      }
    ]
  },
  {
    "id": "art-illustration",
    "label": "Art & illustration",
    "children": [
      {
        "id": "illustrations",
        "label": "Illustration or graphics"
      },
      {
        "id": "card-invitation-design",
        "label": "Card or invitation"
      },
      {
        "id": "character-mascot-design",
        "label": "Character or mascot"
      },
      {
        "id": "tattoo-design",
        "label": "Tattoo"
      },
      {
        "id": "3d-design",
        "label": "3D"
      }
    ]
  },
  {
    "id": "packaging-label",
    "label": "Packaging & label",
    "children": [
      {
        "id": "product-packaging-design",
        "label": "Product packaging"
      },
      {
        "id": "product-label-design",
        "label": "Product label"
      }
    ]
  },
  {
    "id": "book-magazine",
    "label": "Book & magazine",
    "children": [
      {
        "id": "book-cover-design",
        "label": "Book cover"
      },
      {
        "id": "magazine-cover-design",
        "label": "Magazine cover"
      },
      {
        "id": "typesetting",
        "label": "Typesetting"
      },
      {
        "id": "typesetting-with-imagery",
        "label": "Typesetting with imagery"
      }
    ]
  }
] as const;

export const designerBrowseIndustries = [
  {
    "id": "business",
    "label": "Business & consulting"
  },
  {
    "id": "food",
    "label": "Food & drink"
  },
  {
    "id": "medical",
    "label": "Medical & pharmaceutical"
  },
  {
    "id": "retail",
    "label": "Retail"
  },
  {
    "id": "technology",
    "label": "Technology"
  },
  {
    "id": "education",
    "label": "Education"
  },
  {
    "id": "entertainment",
    "label": "Entertainment"
  },
  {
    "id": "fashion",
    "label": "Fashion"
  },
  {
    "id": "sports",
    "label": "Sports & fitness"
  },
  {
    "id": "travel",
    "label": "Travel"
  }
] as const;

export const designerLanguages = [
  {
    "id": "chinese",
    "label": "Chinese"
  },
  {
    "id": "dutch",
    "label": "Dutch"
  },
  {
    "id": "english",
    "label": "English"
  },
  {
    "id": "french",
    "label": "French"
  },
  {
    "id": "german",
    "label": "German"
  },
  {
    "id": "indonesian",
    "label": "Indonesian"
  },
  {
    "id": "italian",
    "label": "Italian"
  },
  {
    "id": "japanese",
    "label": "Japanese"
  },
  {
    "id": "korean",
    "label": "Korean"
  },
  {
    "id": "portuguese",
    "label": "Portuguese"
  },
  {
    "id": "spanish",
    "label": "Spanish"
  }
] as const;

export const designerCertifications = [
  {
    "id": "print-basics",
    "label": "Print basics"
  },
  {
    "id": "jimdo",
    "label": "Jimdo"
  },
  {
    "id": "squarespace",
    "label": "Squarespace"
  },
  {
    "id": "prezi",
    "label": "Prezi"
  },
  {
    "id": "square-online-store",
    "label": "Square Online Store"
  },
  {
    "id": "brand-guide",
    "label": "Brand guide"
  },
  {
    "id": "nationbuilder",
    "label": "NationBuilder"
  },
  {
    "id": "product-packaging",
    "label": "Product packaging"
  },
  {
    "id": "facebook-ad",
    "label": "Facebook Ad"
  },
  {
    "id": "wix",
    "label": "Wix"
  },
  {
    "id": "ceros",
    "label": "Ceros"
  }
] as const;

export const designerBrowseSections: {
  title: string;
  skill: string;
  designerIds: string[];
}[] = [
  {
    "title": "Logo and identity designers",
    "skill": "logo-design",
    "designerIds": [
      "554690",
      "955198",
      "1278067"
    ]
  },
  {
    "title": "Web and app designers",
    "skill": "web-design",
    "designerIds": [
      "1729434",
      "254321",
      "3821172"
    ]
  },
  {
    "title": "Packaging and label designers",
    "skill": "product-packaging-design",
    "designerIds": [
      "1765470",
      "1175246",
      "2048531"
    ]
  },
  {
    "title": "Book and magazine designers",
    "skill": "book-cover-design",
    "designerIds": [
      "566952",
      "1934072",
      "1903300"
    ]
  },
  {
    "title": "Designers with a minimal style",
    "skill": "minimal",
    "designerIds": [
      "1382139",
      "1456784",
      "2067764"
    ]
  },
  {
    "title": "Designers online now",
    "skill": "online",
    "designerIds": [
      "660101",
      "557567",
      "3223148"
    ]
  }
];

export function levelLabel(level: DesignerLevel) {
  if (level === "top") return "Top Level";
  if (level === "mid") return "Mid Level";
  return "Entry Level";
}

export function skillLabel(id: string) {
  for (const g of designerCategoryTree) {
    const hit = g.children.find((c) => c.id === id);
    if (hit) return hit.label;
  }
  const chip = designerNeedChips.find((c) => c.skill === id);
  if (chip) return chip.label;
  const hit = designerSkillFilters.find((s) => s.id === id);
  return hit?.label ?? id;
}
