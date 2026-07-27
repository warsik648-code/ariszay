import type { FaqItem } from "@/types";

export const faqs: FaqItem[] = [
  {
    id: "delivery",
    question: "How does delivery work after payment?",
    answer:
      "After your payment is confirmed, license details and setup instructions are sent to your email address and are available in your account dashboard.",
  },
  {
    id: "install",
    question: "Do I need technical knowledge to install?",
    answer:
      "No. Every product includes a written step-by-step installation guide. Private tier customers also receive access to a dedicated support channel.",
  },
  {
    id: "status",
    question: "How do I know if a product is currently working?",
    answer:
      "Each product page displays a current status indicator: Available, Updating, or Unavailable. We update these whenever the product state changes. Check the product page before purchasing.",
  },
  {
    id: "refund",
    question: "What is your refund policy?",
    answer:
      "If a product cannot be activated due to an issue on our side, contact support within 24 hours of purchase for a replacement or refund review.",
  },
  {
    id: "tiers",
    question: "What is the difference between Xray, Pro, and Private?",
    answer:
      "Xray focuses on ESP and awareness. Pro adds aim assist tools. Private is the top tier with the strongest aimbot features and a dedicated support channel.",
  },
  {
    id: "stream",
    question: "Is stream-safe overlay mode available?",
    answer:
      "Stream-capture exclusion is included with Private tier cheats, so overlays stay hidden from capture software like OBS and Streamlabs.",
  },
  {
    id: "os",
    question: "Which operating systems are supported?",
    answer:
      "All tools target Windows 10 and Windows 11 (64-bit). Secure Boot compatible options are available on Pro and Private tiers.",
  },
  {
    id: "payment",
    question: "Which payment methods do you accept?",
    answer:
      "Checkout is handled by our payment partners and supports major credit/debit cards and popular regional methods depending on your location.",
  },
];

export const gameFaqs: FaqItem[] = [
  {
    id: "isle-status",
    game: "isle",
    question: "How do I check the current status of Isle products?",
    answer:
      "Each Isle cheat page shows a live status badge. If the status is 'Updating', we temporarily pause sales while we verify compatibility with the latest game build.",
  },
  {
    id: "isle-evrima",
    game: "isle",
    question: "Does it work on both Evrima and Legacy?",
    answer:
      "Compatibility varies by product. Check the product page under 'System Requirements' for the specific builds each product supports.",
  },
  {
    id: "naraka-status",
    game: "naraka",
    question: "How do you handle Naraka anti-cheat updates?",
    answer:
      "When a significant update ships, we pause sales and run internal testing before re-enabling. The status badge on each cheat page reflects the current situation.",
  },
  {
    id: "naraka-competitive",
    game: "naraka",
    question: "What features are available for competitive play?",
    answer:
      "Pro and Private tiers include competitive-focused tools. Private includes stream-capture exclusion. Review the full feature list on each product page before purchasing.",
  },
];
