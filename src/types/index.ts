export type CheatTier = "xray" | "pro" | "private";
export type GameSlug = "isle" | "naraka";
export type ProductSlug = "ugc" | "skin-changer" | "cloud-dma" | "hwid-spoofer";
export type DetectionStatus = "undetected" | "updating" | "detected";

export type Pricing = {
  monthly: number | null;
  lifetime: number | null;
};

export type Game = {
  slug: GameSlug;
  name: string;
  shortName: string;
  description: string;
  tagline: string;
  accent: string;
};

export type Cheat = {
  slug: string;
  game: GameSlug;
  tier: CheatTier;
  name: string;
  description: string;
  price: Pricing;
  status: DetectionStatus;
  rating: number;
  reviewCount: number;
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
