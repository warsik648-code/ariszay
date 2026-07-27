export type CheatTier = "xray" | "pro" | "private";
export type GameSlug = "isle" | "naraka";
export type ProductSlug = "ugc" | "skin-changer" | "cloud-dma" | "hwid-spoofer";
/** Availability status for products. Do not use "undetected" — that is a false guarantee. */
export type DetectionStatus = "available" | "updating" | "unavailable" | "unknown";

export type Pricing = {
  monthly: number | null;
  lifetime: number | null;
};

export type Game = {
  slug: GameSlug;
  /** URL-safe slug used in /cheats/[cheatsSlug] routes */
  cheatsSlug: string;
  name: string;
  shortName: string;
  description: string;
  tagline: string;
  accent: string;
};

export type ProductStatus = "available" | "updating" | "unavailable" | "unknown";
export type CheatTierLabel = "Xray" | "Pro" | "Private";

export type Cheat = {
  slug: string;
  game: GameSlug;
  tier: CheatTier;
  name: string;
  description: string;
  price: Pricing;
  status: DetectionStatus;
  highlightFeatures: string[];
  featureCount: number;
  systemRequirements: {
    os: string;
    cpu: string;
    ram: string;
    gpu: string;
    compatible: string;
  };
};

export type Product = {
  slug: ProductSlug;
  name: string;
  description: string;
  longDescription: string;
  price: Pricing;
  icon: "shield" | "palette" | "cloud" | "cpu";
  highlightFeatures: string[];
  featureCount: number;
  systemRequirements: {
    os: string;
    cpu: string;
    ram: string;
    gpu: string;
    compatible: string;
  };
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: "Guide" | "Comparison" | "Tips" | "News";
  game: GameSlug | "all";
  author: string;
  publishedAt: string;
  readTimeMinutes: number;
  coverImage?: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  game?: GameSlug;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  rating: number;
  quote: string;
};

export type ComparisonRow = {
  feature: string;
  xray: boolean;
  pro: boolean;
  private: boolean;
};
