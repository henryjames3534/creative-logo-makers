export type BriefFamily =
  | "logo"
  | "website"
  | "packaging"
  | "book"
  | "merch"
  | "art"
  | "ads"
  | "social";

export type CategoryGroup =
  | "logo-branding"
  | "website-app"
  | "business-advertising"
  | "art-illustration"
  | "packaging-label"
  | "book-magazine"
  | "merchandise"
  | "other";

export type Category = {
  /** Creative Logo Makers pricing / URL slug, e.g. logo-design */
  slug: string;
  title: string;
  shortTitle: string;
  productName: string;
  description: string;
  longDescription: string;
  services: string[];
  whatYouGet: string[];
  startingPrice: string;
  /** Pre-discount list starting price */
  compareAtStartingPrice?: string;
  rating: string;
  reviewCount: string;
  popular?: boolean;
  group: CategoryGroup;
  briefFamily: BriefFamily;
  /** ClmMarketingIcon glyph key (marketing-icon--*) */
  icon: string;
  save?: string;
};

const stdWhatYouGet = (label: string) => [
  `1 finished custom ${label}`,
  "Full copyright ownership",
  "Print + digital ready files",
  "Editable source files",
  "100% money-back guarantee*",
];

type CatInput = {
  slug: string;
  productName: string;
  shortTitle?: string;
  title?: string;
  description: string;
  startingPrice: string;
  group: CategoryGroup;
  briefFamily: BriefFamily;
  icon: string;
  popular?: boolean;
  save?: string;
  services?: string[];
  reviewCount?: string;
};

function halveStartingPrice(price: string): string {
  const amount = Number(String(price).replace(/[^0-9.]/g, "")) || 0;
  if (!amount) return price;
  return `$${Math.round(amount / 2).toLocaleString("en-US")}`;
}

function cat(input: CatInput): Category {
  const productName = input.productName;
  return {
    slug: input.slug,
    productName,
    shortTitle: input.shortTitle ?? productName,
    title: input.title ?? productName,
    description: input.description,
    longDescription: `${input.description} Work with vetted designers through a contest — pick a fixed package and launch your brief.`,
    services: input.services ?? [productName],
    whatYouGet: stdWhatYouGet(productName.toLowerCase()),
    startingPrice: halveStartingPrice(input.startingPrice),
    compareAtStartingPrice: input.startingPrice,
    rating: "4.8",
    reviewCount: input.reviewCount ?? "5k+",
    popular: input.popular,
    group: input.group,
    briefFamily: input.briefFamily,
    icon: input.icon,
    save: input.save ?? "50% off packages",
  };
}

/** Full Creative Logo Makers categories catalog (subcategories) */
export const categories: Category[] = [
  // —— Logo & identity ——
  cat({
    slug: "logo-design",
    productName: "Logo design",
    description: "An unforgettable logo crafted for your brand",
    startingPrice: "$249",
    group: "logo-branding",
    briefFamily: "logo",
    icon: "logo-design",
    popular: true,
  }),
  cat({
    slug: "logo-brand-guide",
    productName: "Logo & brand guide",
    description: "Extend your logo design into a real brand with matching fonts, colors and style",
    startingPrice: "$329",
    group: "logo-branding",
    briefFamily: "logo",
    icon: "logo-brand-guide",
    save: "Save 40%",
  }),
  cat({
    slug: "brand-starter-pack",
    productName: "Brand starter pack",
    description: "A logo, business card and social assets to make an impression on and offline",
    startingPrice: "$499",
    group: "logo-branding",
    briefFamily: "logo",
    icon: "social-media-pack",
    save: "Save 20%+",
  }),
  cat({
    slug: "brand-launch-pack",
    productName: "Brand launch pack",
    description: "A logo, brand guide plus digital and print essentials to launch your business",
    startingPrice: "$599",
    group: "logo-branding",
    briefFamily: "logo",
    icon: "brand-identity-pack",
    save: "Save 25%+",
  }),
  cat({
    slug: "logo-website-squarespace",
    productName: "Logo & website",
    description: "A custom logo and Squarespace website that matches your brand",
    startingPrice: "$1,399",
    group: "logo-branding",
    briefFamily: "logo",
    icon: "blog-design",
    save: "Save up to US$300",
  }),
  cat({
    slug: "brand-guide",
    productName: "Brand guide",
    description: "A comprehensive guide of your brand's fonts, colors and style",
    startingPrice: "$299",
    group: "logo-branding",
    briefFamily: "logo",
    icon: "brand-guide",
  }),
  cat({
    slug: "business-card-design",
    productName: "Business card",
    description: "A unique card designed to build connections",
    startingPrice: "$169",
    group: "logo-branding",
    briefFamily: "logo",
    icon: "business-card-design",
  }),
  cat({
    slug: "stationery-design",
    productName: "Stationery",
    description: "Letterhead and envelopes that send your brand's message",
    startingPrice: "$199",
    group: "logo-branding",
    briefFamily: "logo",
    icon: "stationery-design",
  }),
  cat({
    slug: "full-service-branding",
    productName: "Full-Service Brand Pack",
    description: "Custom full-service brand pack from vetted designers.",
    startingPrice: "$4,499",
    group: "logo-branding",
    briefFamily: "logo",
    icon: "brand-identity-pack",
  }),

  // —— Web & app design ——
  cat({
    slug: "website-builders",
    productName: "Website Builders",
    description: "Easily bring your website to life, so you can stay focused on running your business",
    startingPrice: "$549",
    group: "website-app",
    briefFamily: "website",
    icon: "blog-design",
  }),
  cat({
    slug: "web-design",
    productName: "Web page design",
    description: "Engaging custom web design that connects with visitors",
    startingPrice: "$599",
    group: "website-app",
    briefFamily: "website",
    icon: "web-design",
    popular: true,
  }),
  cat({
    slug: "website-redesign",
    productName: "Website Redesign",
    description: "A refreshed website to better showcase your business",
    startingPrice: "$549",
    group: "website-app",
    briefFamily: "website",
    icon: "website-redesign",
  }),
  cat({
    slug: "blog-design",
    productName: "Blog",
    description: "Custom blog design to keep them reading",
    startingPrice: "$549",
    group: "website-app",
    briefFamily: "website",
    icon: "blog-design",
  }),
  cat({
    slug: "wordpress-theme-design",
    productName: "WordPress theme design",
    description: "A custom WordPress theme that does everything you need it to",
    startingPrice: "$599",
    group: "website-app",
    briefFamily: "website",
    icon: "wordpress-theme-design",
  }),
  cat({
    slug: "landing-page-design",
    productName: "Landing page design",
    description: "Landing page that gets clicks",
    startingPrice: "$349",
    group: "website-app",
    briefFamily: "website",
    icon: "landing-page-design",
  }),
  cat({
    slug: "icon-button-design",
    productName: "Icon or button",
    description: "Professionally designed icons, buttons and favicons for web & app",
    startingPrice: "$199",
    group: "website-app",
    briefFamily: "website",
    icon: "icon-button-design",
  }),
  cat({
    slug: "app-icon-design",
    productName: "App Icon",
    description: "A stunning app icon guaranteed to get you downloads",
    startingPrice: "$199",
    group: "website-app",
    briefFamily: "website",
    icon: "app-icon-design",
  }),
  cat({
    slug: "website-icon-design",
    productName: "Website Icon",
    description: "A website icon that users will recognize",
    startingPrice: "$199",
    group: "website-app",
    briefFamily: "website",
    icon: "website-icon-design",
  }),
  cat({
    slug: "form-design",
    productName: "Form",
    description: "Forms customized to collect the data you need",
    startingPrice: "$349",
    group: "website-app",
    briefFamily: "website",
    icon: "form-design",
  }),
  cat({
    slug: "mobile-app-design",
    productName: "App design",
    description: "A user-friendly app that gets downloads",
    startingPrice: "$599",
    group: "website-app",
    briefFamily: "website",
    icon: "mobile-app-design",
  }),
  cat({
    slug: "ios-app-design",
    productName: "iOS App",
    description: "An iOS app design that'll be the apple of your eye",
    startingPrice: "$599",
    group: "website-app",
    briefFamily: "website",
    icon: "ios-app-design",
  }),
  cat({
    slug: "android-app-design",
    productName: "Android App",
    description: "An app that looks great on any Android device",
    startingPrice: "$599",
    group: "website-app",
    briefFamily: "website",
    icon: "android-app-design",
  }),
  cat({
    slug: "facebook-cover-design",
    productName: "Facebook cover",
    description: "A custom Facebook cover that'll get more clicks, likes and shares",
    startingPrice: "$79",
    group: "website-app",
    briefFamily: "website",
    icon: "facebook-cover-design",
  }),
  cat({
    slug: "social-media-page-design",
    productName: "Social media page",
    description: "Social media backgrounds and images to engage your followers",
    startingPrice: "$79",
    group: "website-app",
    briefFamily: "website",
    icon: "social-media-page-design",
  }),
  cat({
    slug: "twitter-design",
    productName: "Twitter",
    description: "A Twitter header that complements your tweets",
    startingPrice: "$79",
    group: "website-app",
    briefFamily: "website",
    icon: "twitter-header-design",
  }),
  cat({
    slug: "youtube-channel-design",
    productName: "YouTube",
    description: "Youtube channel design that will build your subscriber list",
    startingPrice: "$79",
    group: "website-app",
    briefFamily: "website",
    icon: "youtube-background-design",
  }),
  cat({
    slug: "banner-ad-design",
    productName: "Banner ad",
    description: "Web ads that drive conversions",
    startingPrice: "$49",
    group: "website-app",
    briefFamily: "website",
    icon: "banner-ad-design",
  }),
  cat({
    slug: "other-website-app-design",
    productName: "Other web or app design",
    description: "Web, app or digital design so cutting edge we haven't created a category for it yet",
    startingPrice: "$329",
    group: "website-app",
    briefFamily: "website",
    icon: "other-web-design",
  }),

  // —— Business & advertising ——
  cat({
    slug: "postcard-flyer-design",
    productName: "Postcard, flyer or print",
    description: "Fliers and postcards that reach clients",
    startingPrice: "$169",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "postcard-flyer-design",
  }),
  cat({
    slug: "leaflet-design",
    productName: "Leaflet",
    description: "Leaflet designs that illustrate your story",
    startingPrice: "$149",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "leaflet-design",
  }),
  cat({
    slug: "direct-mail-design",
    productName: "Direct Mail",
    description: "Direct mail design that speaks to recipients",
    startingPrice: "$149",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "direct-mail-design",
  }),
  cat({
    slug: "flyer-design",
    productName: "Flyer",
    description: "Custom flyer designs that make information beautiful",
    startingPrice: "$169",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "business-illustration",
  }),
  cat({
    slug: "poster-design",
    productName: "Poster",
    description: "A popping poster that entices viewers",
    startingPrice: "$199",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "poster-design",
  }),
  cat({
    slug: "album-cover-design",
    productName: "Album Cover",
    description: "An album cover that rocks",
    startingPrice: "$199",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "album-cover-design",
  }),
  cat({
    slug: "podcast-cover-design",
    productName: "Podcast",
    description: "Custom podcast art that gets the word out",
    startingPrice: "$199",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "podcast-cover-design",
  }),
  cat({
    slug: "infographic-design",
    productName: "Infographic",
    description: "An engaging infographic that both shows and tells",
    startingPrice: "$399",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "infographic-design",
  }),
  cat({
    slug: "brochure-design",
    productName: "Brochure",
    description: "The printable, foldable way to engage with clients",
    startingPrice: "$299",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "brochure-design",
  }),
  cat({
    slug: "booklet-design",
    productName: "Booklet",
    description: "A booklet that tells your brand's story",
    startingPrice: "$299",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "booklet-design",
  }),
  cat({
    slug: "pamphlet-design",
    productName: "Pamphlet",
    description: "A pamphlet that delivers all the info you need",
    startingPrice: "$299",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "pamphlet-design",
  }),
  cat({
    slug: "car-truck-van-wrap-design",
    productName: "Car, truck or van wrap",
    description: "A vehicle wrap to take advertising on the road",
    startingPrice: "$329",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "car-truck-van-wrap-design",
  }),
  cat({
    slug: "signage-design",
    productName: "Signage",
    description: "A sign or banner to get your brand noticed",
    startingPrice: "$199",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "signage-design",
  }),
  cat({
    slug: "billboard-design",
    productName: "Billboard",
    description: "Billboard design that projects your message",
    startingPrice: "$149",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "billboard-design",
  }),
  cat({
    slug: "trade-show-banner-design",
    productName: "Trade Show Banner",
    description: "A custom banner design to draw visitors to your booth",
    startingPrice: "$149",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "trade-show-banner-design",
  }),
  cat({
    slug: "banner-design",
    productName: "Banner",
    description: "Banners to fly your brand high",
    startingPrice: "$149",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "banner-design",
  }),
  cat({
    slug: "email-design",
    productName: "Email",
    description: "Custom email templates that users will open",
    startingPrice: "$279",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "email-design",
  }),
  cat({
    slug: "email-newsletter-design",
    productName: "Email Newsletter",
    description: "An email newsletter template designed to be opened",
    startingPrice: "$249",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "email-newsletter-design",
  }),
  cat({
    slug: "powerpoint-template-design",
    productName: "PowerPoint template",
    description: "PowerPoint templates custom designed to rock the boardroom",
    startingPrice: "$199",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "powerpoint-template-design",
  }),
  cat({
    slug: "menu-design",
    productName: "Menu",
    description: "Appealing menu design that will leave you salivating",
    startingPrice: "$199",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "menu-design",
  }),
  cat({
    slug: "website-header-design",
    productName: "Website Header",
    description: "A website header that tops off your brand",
    startingPrice: "$199",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "website-header-design",
  }),
  cat({
    slug: "resume-design",
    productName: "Resume",
    description: "A resume that gets you called back",
    startingPrice: "$199",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "resume-design",
  }),
  cat({
    slug: "word-template-design",
    productName: "Word Template",
    description: "A custom Word template so you can say it in your own words",
    startingPrice: "$199",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "word-template-design",
  }),
  cat({
    slug: "trade-show-booth-design",
    productName: "Trade Show Booth",
    description: "Trade show booth design to show you off",
    startingPrice: "$199",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "trade-show-booth-design",
  }),
  cat({
    slug: "other-business-advertising",
    productName: "Other business or advertising",
    description: "Custom advertisements that don't fit the mold",
    startingPrice: "$199",
    group: "business-advertising",
    briefFamily: "ads",
    icon: "other-business-advertising",
  }),

  // —— Clothing & merchandise ——
  cat({
    slug: "t-shirt-design",
    productName: "T-shirt",
    description: "Shirts they'll wanna keep in their closet",
    startingPrice: "$199",
    group: "merchandise",
    briefFamily: "merch",
    icon: "t-shirt-design",
    popular: true,
  }),
  cat({
    slug: "clothing-apparel-design",
    productName: "Clothing or apparel",
    description: "Apparel design that fits your style",
    startingPrice: "$199",
    group: "merchandise",
    briefFamily: "merch",
    icon: "clothing-apparel-design",
  }),
  cat({
    slug: "jersey-design",
    productName: "Jersey",
    description: "Custom jersey design that scores with fans",
    startingPrice: "$199",
    group: "merchandise",
    briefFamily: "merch",
    icon: "jersey-design",
  }),
  cat({
    slug: "merchandise-design",
    productName: "Merchandise",
    description: "Merchandise design to bring your product to life",
    startingPrice: "$199",
    group: "merchandise",
    briefFamily: "merch",
    icon: "merchandise-design",
  }),
  cat({
    slug: "bag-tote-design",
    productName: "Bag & Tote",
    description: "Custom bag design that carries your brand farther",
    startingPrice: "$199",
    group: "merchandise",
    briefFamily: "merch",
    icon: "bag-tote-design",
  }),
  cat({
    slug: "cap-design",
    productName: "Hat & Cap",
    description: "A custom hat or cap designed to get you ahead",
    startingPrice: "$199",
    group: "merchandise",
    briefFamily: "merch",
    icon: "cap-design",
  }),
  cat({
    slug: "shopping-bag-design",
    productName: "Shopping Bag",
    description: "On-brand shopping bag design that draws attention",
    startingPrice: "$199",
    group: "merchandise",
    briefFamily: "merch",
    icon: "product-packaging-design",
  }),
  cat({
    slug: "cup-mug-design",
    productName: "Cup or mug",
    description: "Cup design that that leaves 'em thirsty for more",
    startingPrice: "$169",
    group: "merchandise",
    briefFamily: "merch",
    icon: "cup-mug-design",
  }),
  cat({
    slug: "sticker-design",
    productName: "Sticker",
    description: "A sticker design that can go just about anywhere",
    startingPrice: "$189",
    group: "merchandise",
    briefFamily: "merch",
    icon: "sticker-design",
  }),
  cat({
    slug: "other-clothing-merchandise-design",
    productName: "Other clothing or merchandise",
    description: "Clothing and merchandise that's more than one-size-fits all",
    startingPrice: "$199",
    group: "merchandise",
    briefFamily: "merch",
    icon: "other-clothing-merchandise-design",
  }),

  // —— Art & illustration ——
  cat({
    slug: "illustrations",
    productName: "Illustration or graphics",
    description: "Stunning illustrations and graphics that will draw attention",
    startingPrice: "$299",
    group: "art-illustration",
    briefFamily: "art",
    icon: "illustrations",
    popular: true,
  }),
  cat({
    slug: "business-illustration",
    productName: "Business Illustration",
    description: "Business illustrations to instruct or delight",
    startingPrice: "$299",
    group: "art-illustration",
    briefFamily: "art",
    icon: "business-illustration",
  }),
  cat({
    slug: "website-illustration-design",
    productName: "Website Illustration",
    description: "Website illustration that paints a picture",
    startingPrice: "$299",
    group: "art-illustration",
    briefFamily: "art",
    icon: "website-illustration-design",
  }),
  cat({
    slug: "book-illustration",
    productName: "Book Illustration",
    description: "A book illustration that captures readers' imaginations",
    startingPrice: "$299",
    group: "art-illustration",
    briefFamily: "art",
    icon: "book-illustration",
  }),
  cat({
    slug: "pattern-design",
    productName: "Pattern",
    description: "Patterns that make a statement",
    startingPrice: "$299",
    group: "art-illustration",
    briefFamily: "art",
    icon: "pattern-design",
  }),
  cat({
    slug: "card-invitation-design",
    productName: "Card or invitation",
    description: "Card or invitation design that sends a message",
    startingPrice: "$199",
    group: "art-illustration",
    briefFamily: "art",
    icon: "card-invitation-design",
  }),
  cat({
    slug: "invitation-design",
    productName: "Invitation",
    description: "An invitation that gets RSVP's",
    startingPrice: "$199",
    group: "art-illustration",
    briefFamily: "art",
    icon: "invitation-design",
  }),
  cat({
    slug: "greeting-card-design",
    productName: "Greeting Card",
    description: "A greeting card that brightens the receiver's day",
    startingPrice: "$199",
    group: "art-illustration",
    briefFamily: "art",
    icon: "greeting-card-design",
  }),
  cat({
    slug: "wedding-invitation-design",
    productName: "Wedding Invitation",
    description: "The perfect wedding invitation for your big day",
    startingPrice: "$149",
    group: "art-illustration",
    briefFamily: "art",
    icon: "wedding-invitation-design",
  }),
  cat({
    slug: "character-mascot-design",
    productName: "Character or mascot",
    description: "A character or mascot with personality",
    startingPrice: "$329",
    group: "art-illustration",
    briefFamily: "art",
    icon: "character-mascot-design",
  }),
  cat({
    slug: "tattoo-design",
    productName: "Tattoo",
    description: "Tattoo designs that'll make grandma jealous",
    startingPrice: "$299",
    group: "art-illustration",
    briefFamily: "art",
    icon: "tattoo-design",
  }),
  cat({
    slug: "3d-design",
    productName: "3D",
    description: "3D digital design that takes it to the next dimension",
    startingPrice: "$389",
    group: "art-illustration",
    briefFamily: "art",
    icon: "3d-design",
  }),
  cat({
    slug: "3d-architectural-rendering",
    productName: "3D Architectural Rendering",
    description: "3D architectural rendering to bring your project to life",
    startingPrice: "$389",
    group: "art-illustration",
    briefFamily: "art",
    icon: "3d-design",
  }),
  cat({
    slug: "other-art-illustration",
    productName: "Other art or illustration",
    description: "Art and illustration so creative you can't categorize it",
    startingPrice: "$329",
    group: "art-illustration",
    briefFamily: "art",
    icon: "other-art-illustration",
  }),

  // —— Packaging & label ——
  cat({
    slug: "product-packaging-design",
    productName: "Product packaging",
    description: "Packaging that buyers can't wait to open",
    startingPrice: "$349",
    group: "packaging-label",
    briefFamily: "packaging",
    icon: "product-packaging-design",
    popular: true,
  }),
  cat({
    slug: "food-packaging-design",
    productName: "Food Packaging",
    description: "Delicious food packaging that's good enough to eat",
    startingPrice: "$349",
    group: "packaging-label",
    briefFamily: "packaging",
    icon: "packet",
  }),
  cat({
    slug: "retail-packaging-design",
    productName: "Retail Packaging",
    description: "Retail packaging that sells your product",
    startingPrice: "$349",
    group: "packaging-label",
    briefFamily: "packaging",
    icon: "box",
  }),
  cat({
    slug: "cosmetics-packaging-design",
    productName: "Cosmetics Packaging",
    description: "Cosmetics packaging that makes you look good",
    startingPrice: "$349",
    group: "packaging-label",
    briefFamily: "packaging",
    icon: "tube",
  }),
  cat({
    slug: "box-design",
    productName: "Box",
    description: "Box design for an amazing unboxing experience",
    startingPrice: "$349",
    group: "packaging-label",
    briefFamily: "packaging",
    icon: "box",
  }),
  cat({
    slug: "product-label-design",
    productName: "Product label",
    description: "Product labels that stand out on shelves",
    startingPrice: "$299",
    group: "packaging-label",
    briefFamily: "packaging",
    icon: "product-label-design",
  }),
  cat({
    slug: "food-label-design",
    productName: "Food Label",
    description: "Food labels as tasty as the product inside",
    startingPrice: "$299",
    group: "packaging-label",
    briefFamily: "packaging",
    icon: "canister",
  }),
  cat({
    slug: "beverage-label-design",
    productName: "Beverage Label",
    description: "A refreshing beverage label",
    startingPrice: "$299",
    group: "packaging-label",
    briefFamily: "packaging",
    icon: "beverage-label-design",
  }),
  cat({
    slug: "beer-label-design",
    productName: "Beer Label",
    description: "Beer labels crafted for your brew",
    startingPrice: "$299",
    group: "packaging-label",
    briefFamily: "packaging",
    icon: "beer-label-design",
  }),
  cat({
    slug: "wine-label-design",
    productName: "Wine Label",
    description: "Wine labels that pair with your vintage",
    startingPrice: "$299",
    group: "packaging-label",
    briefFamily: "packaging",
    icon: "wine-label-design",
  }),
  cat({
    slug: "other-packaging-label-design",
    productName: "Other packaging or label",
    description: "Packaging and labels that are outside of the box",
    startingPrice: "$249",
    group: "packaging-label",
    briefFamily: "packaging",
    icon: "other-packaging-label-design",
  }),

  // —— Book & magazine ——
  cat({
    slug: "book-cover-design",
    productName: "Book cover",
    description: "A book cover design worth 100,000 words",
    startingPrice: "$279",
    group: "book-magazine",
    briefFamily: "book",
    icon: "book-cover-design",
    popular: true,
  }),
  cat({
    slug: "interior-book-design",
    productName: "Interior book design",
    description: "Interior book design that keeps readers engaged",
    startingPrice: "$299",
    group: "book-magazine",
    briefFamily: "book",
    icon: "interior-book-design",
  }),
  cat({
    slug: "ebook-cover-design",
    productName: "eBook Cover",
    description: "An ebook cover that gets downloads",
    startingPrice: "$199",
    group: "book-magazine",
    briefFamily: "book",
    icon: "ebook",
  }),
  cat({
    slug: "magazine-cover-design",
    productName: "Magazine cover",
    description: "A magazine cover with all the right features",
    startingPrice: "$249",
    group: "book-magazine",
    briefFamily: "book",
    icon: "magazine-cover-design",
  }),
  cat({
    slug: "book-layout-design",
    productName: "Book Layout",
    description: "A book layout that keeps pages turning",
    startingPrice: "$299",
    group: "book-magazine",
    briefFamily: "book",
    icon: "book-layout-design",
  }),
  cat({
    slug: "other-book-magazine-design",
    productName: "Other book or magazine",
    description: "Book and magazine designs that don't quite fit a genre",
    startingPrice: "$299",
    group: "book-magazine",
    briefFamily: "book",
    icon: "other-book-magazine-design",
  }),
  cat({
    slug: "other-design",
    productName: "Other design",
    description: "Not seeing it listed? We can still design it!",
    startingPrice: "$299",
    group: "book-magazine",
    briefFamily: "book",
    icon: "other-design",
  }),

];

/** Parent groups on /categories (Creative Logo Makers layout) */
export const categoryBrowseGroups: {
  group: CategoryGroup;
  title: string;
  shortTitle: string;
  description: string;
  primarySlug: string;
  menuKey: string;
  parentPrefix: string;
}[] = [
  {
    group: "logo-branding",
    title: "Logo & identity",
    shortTitle: "Logo & identity",
    description: "Logos, identity packs, and brand guides.",
    primarySlug: "logo-design",
    menuKey: "logo",
    parentPrefix: "logo",
  },
  {
    group: "website-app",
    title: "Web & app design",
    shortTitle: "Web & app",
    description: "Websites, landing pages, and app UI.",
    primarySlug: "web-design",
    menuKey: "website-app-design",
    parentPrefix: "web",
  },
  {
    group: "business-advertising",
    title: "Business & advertising",
    shortTitle: "Business & advertising",
    description: "Cards, flyers, ads, decks, and more.",
    primarySlug: "postcard-flyer-design",
    menuKey: "business-advertising",
    parentPrefix: "business",
  },
  {
    group: "merchandise",
    title: "Clothing & merchandise",
    shortTitle: "Clothing & merch",
    description: "T-shirts, apparel, and branded merch.",
    primarySlug: "t-shirt-design",
    menuKey: "clothing-merchandise-design",
    parentPrefix: "clothing",
  },
  {
    group: "art-illustration",
    title: "Art & illustration",
    shortTitle: "Art & illustration",
    description: "Illustrations, mascots, icons, and 3D.",
    primarySlug: "illustrations",
    menuKey: "art-illustration",
    parentPrefix: "art",
  },
  {
    group: "packaging-label",
    title: "Packaging & label",
    shortTitle: "Packaging & label",
    description: "Product packaging and labels.",
    primarySlug: "product-packaging-design",
    menuKey: "packaging-label-design",
    parentPrefix: "packaging",
  },
  {
    group: "book-magazine",
    title: "Book & magazine",
    shortTitle: "Book & magazine",
    description: "Book covers, interiors, and magazines.",
    primarySlug: "book-cover-design",
    menuKey: "book-magazine-design",
    parentPrefix: "book",
  },
];

/** Homepage “Design for what you need” — parent groups */
export const homeCategoryGroups: {
  group: CategoryGroup;
  title: string;
  shortTitle: string;
  description: string;
  primarySlug: string;
  startingPrice: string;
  imageKey: CategoryGroup;
}[] = categoryBrowseGroups.map((g) => {
  const first = categories.find((c) => c.group === g.group);
  return {
    group: g.group,
    title: g.title,
    shortTitle: g.shortTitle,
    description: g.description,
    primarySlug: g.primarySlug,
    startingPrice: first?.startingPrice ?? "$199",
    imageKey: g.group,
  };
});

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getCategoriesByGroup(group: CategoryGroup) {
  return categories.filter((c) => c.group === group);
}

export function getPopularCategories() {
  return categories.filter((c) => c.popular);
}

/** Legacy internal slugs → 99d service slug */
export const legacySlugMap: Record<string, string> = {
  "logo-branding": "logo-design",
  "website-app": "web-design",
  "business-advertising": "business-card-design",
  "art-illustration": "illustrations",
  "packaging-label": "product-packaging-design",
  "book-cover": "book-cover-design",
  "book-magazine": "book-cover-design",
  merchandise: "t-shirt-design",
  "social-content": "social-media-page-design",
};

export const categoryFaqs = [
  {
    q: "Wait, what's a design contest?",
    a: "Our contest method is where you create a brief that's open to our entire designer community. Designers pitch their concepts, and you can give feedback on these designs before selecting your favorite. At the end of the contest, you'll receive the copyright and files for your winning design.",
  },
  {
    q: "How do packages work?",
    a: "Bronze, Silver, Gold, and Platinum are fixed contest packages. Higher packages typically attract more designers and often restrict entry to mid- and top-level talent.",
  },
  {
    q: "Do I own the final design?",
    a: "Yes. When you select a winner and complete handover, you receive full copyright ownership of the winning design and the source files you need for print and web.",
  },
  {
    q: "Is there a money-back guarantee?",
    a: "Contest packages include a 100% money-back guarantee with terms and conditions. If you're not happy, support can help you revise your brief or process a refund under those terms.",
  },
];
