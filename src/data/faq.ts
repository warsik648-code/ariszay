import type { FaqItem, Testimonial } from "@/types";

export const faqs: FaqItem[] = [
  {
    id: "safe",
    question: "Is ArisZay software undetected?",
    answer:
      "We continuously monitor anti-cheat updates and ship status changes immediately. Current products are marked Undetected unless otherwise noted on the product page.",
  },
  {
    id: "delivery",
    question: "How fast is delivery after payment?",
    answer:
      "Delivery is instant for most licenses. After checkout you receive download instructions and activation details by email.",
  },
  {
    id: "install",
    question: "Do I need technical knowledge to install?",
    answer:
      "No. Every product includes a step-by-step guide. Private tier customers also get a direct support channel.",
  },
  {
    id: "refund",
    question: "What is your refund policy?",
    answer:
      "If the product cannot be activated due to an issue on our side, contact support within 24 hours for a replacement or refund review.",
  },
  {
    id: "hwid",
    question: "Can I use HWID Spoofer after a ban?",
    answer:
      "Yes. Follow the post-ban checklist included with HWID Spoofer, then spoof and restore before launching supported games.",
  },
  {
    id: "stream",
    question: "Is stream-safe mode available?",
    answer:
      "Stream-Safe Mode is included with Private tier cheats so overlays stay hidden from capture software.",
  },
  {
    id: "os",
    question: "Which operating systems are supported?",
    answer:
      "All current tools target Windows 10 and Windows 11. Secure Boot compatible options are available on Pro and Private tiers.",
  },
  {
    id: "payment",
    question: "Which payment methods do you accept?",
    answer:
      "Checkout is handled by our payment partners and typically supports major cards and popular local methods depending on your region.",
  },
];

export const gameFaqs: FaqItem[] = [
  {
    id: "isle-ac",
    game: "isle",
    question: "Does The Isle anti-cheat detect ArisZay?",
    answer:
      "Isle products are actively maintained against current Evrima and Legacy builds. Check the status badge on each cheat page before purchase.",
  },
  {
    id: "isle-evrima",
    game: "isle",
    question: "Does it work on Evrima and Legacy?",
    answer:
      "Yes. Private and Pro builds include compatibility notes for both Evrima and Legacy servers.",
  },
  {
    id: "naraka-ac",
    game: "naraka",
    question: "How do you handle Naraka anti-cheat updates?",
    answer:
      "We pause sales if a risky update ships, then re-enable after internal testing. Status is always shown on the cheat page.",
  },
  {
    id: "naraka-rank",
    game: "naraka",
    question: "Can I use this in ranked matches?",
    answer:
      "Private and Pro include competitive features. Always follow fair-use guidance in your region and stream-safe settings when broadcasting.",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Kai M.",
    role: "Isle Private customer",
    rating: 5,
    quote:
      "Radar and stream-safe mode are excellent. Support replied in minutes when I needed a config tip.",
  },
  {
    id: "2",
    name: "Lina R.",
    role: "Naraka Pro customer",
    rating: 5,
    quote:
      "Clean overlay, stable aim assist, and instant delivery. Exactly what I wanted for ranked nights.",
  },
  {
    id: "3",
    name: "Devon S.",
    role: "Cloud DMA customer",
    rating: 5,
    quote:
      "Single-PC setup was clearer than other providers. Lifetime license was worth it.",
  },
];
