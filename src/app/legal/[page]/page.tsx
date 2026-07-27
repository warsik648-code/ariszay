import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/shared/section-heading";

type LegalSection = {
  title: string;
  paragraphs: string[];
  subsections?: { title: string; paragraphs: string[] }[];
};

type LegalPageEntry = {
  slug: string;
  title: string;
  intro?: string;
  sections: LegalSection[];
  lastUpdated: string;
};

const pages: LegalPageEntry[] = [
  {
    slug: "terms",
    title: "Terms of Service",
    intro:
      "Please review these Terms of Service carefully before accessing or using our software selling platform (ArisZay). This Agreement establishes the legally binding terms and conditions governing the use of the Website and related channels (including Discord).",
    lastUpdated: "July 27, 2026",
    sections: [
      {
        title: "1. Acceptance of Terms",
        paragraphs: [
          "By accessing or using the Website, you agree to be bound by this Agreement and all applicable laws and regulations. If you do not agree with any part of this Agreement, you must refrain from using the Website.",
        ],
      },
      {
        title: "2. Purchases and Refunds",
        paragraphs: [],
        subsections: [
          {
            title: "2.1 Payment and Pricing",
            paragraphs: [
              "All software purchases made through the Website are subject to the specified pricing. You agree to provide accurate payment information and complete the transaction promptly.",
            ],
          },
          {
            title: "2.2 Private Product Access & Approval",
            paragraphs: [
              "Purchases of private products are subject to an internal approval process designed to maintain the highest level of security and integrity of our services. Customers may be accepted or denied access based on factors such as account history and trust level within our ecosystem.",
              "In cases where access is not approved, the purchase will not be fulfilled for the requested private product, and a suitable replacement product or alternative solution will be provided instead.",
            ],
          },
          {
            title: "2.3 Refunds",
            paragraphs: [
              "Once a purchase is made, refunds are generally not available unless explicitly stated otherwise. Please review the product description and any refund policies provided before making a purchase. Additionally, if the lifecycle of a product has ended, we are not under any obligation to replace, transfer, or upgrade the purchase to a newer version or alternative product.",
            ],
          },
          {
            title: "2.4 Compatibility Responsibility",
            paragraphs: [
              "It is your responsibility to ensure that the software is compatible with your system specifications before making a purchase. We do not guarantee compatibility with all systems, and any issues arising from system incompatibility are not eligible for refunds.",
            ],
          },
        ],
      },
      {
        title: "3. Chargebacks and Account Termination",
        paragraphs: [],
        subsections: [
          {
            title: "3.1 Chargebacks",
            paragraphs: [
              "In the event of a chargeback or payment dispute initiated by you, we reserve the right to suspend or terminate your access to the software and services provided through the Website.",
            ],
          },
          {
            title: "3.2 Account Termination",
            paragraphs: [
              "We reserve the right to terminate or suspend your account and access to the Website, including any associated software or services, if you violate this Agreement or engage in any illegal or unauthorized use of the Website.",
            ],
          },
        ],
      },
      {
        title: "4. Disclaimer of Warranties",
        paragraphs: [
          "We do not make any warranties or representations regarding the software, services, or information provided on the Website. Your use of the Website is at your own risk, and we disclaim all liability for any damages or losses, including those arising from your use of or reliance on the Website.",
        ],
      },
      {
        title: "5. Modifications",
        paragraphs: [
          "We reserve the right to modify or update this Agreement at any time without prior notice. Your continued use of the Website after any changes to this Agreement constitutes your acceptance of the revised terms.",
          "By accepting these terms, you acknowledge and agree to the responsibility of checking your system for compatibility before purchasing our software.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    intro:
      "This Privacy Policy explains how ArisZay collects, uses, and protects information when you use our Website and related services.",
    lastUpdated: "July 27, 2026",
    sections: [
      {
        title: "1. Information We Collect",
        paragraphs: [
          "We may collect account details (such as email), order information, Discord usernames provided at checkout, payment verification metadata, support messages, and technical data such as IP address and browser information when you use the Website.",
        ],
      },
      {
        title: "2. How We Use Information",
        paragraphs: [
          "We use this information to process orders, verify payments, provide support, improve our services, prevent fraud or abuse, and communicate about your purchases when contact details are available.",
        ],
      },
      {
        title: "3. Sharing",
        paragraphs: [
          "We do not sell your personal information. We may share information with trusted service providers who help operate payments, hosting, or communications, and when required by law.",
        ],
      },
      {
        title: "4. Contact",
        paragraphs: [
          "For privacy-related questions, contact support through your ArisZay account or the channels listed on the Website.",
        ],
      },
    ],
  },
  {
    slug: "refund",
    title: "Refund Policy",
    intro:
      "Please read this Refund Policy carefully before purchasing software on ArisZay. This policy forms part of our Terms of Service.",
    lastUpdated: "July 27, 2026",
    sections: [
      {
        title: "1. General Rule",
        paragraphs: [
          "Once a purchase is made, refunds are generally not available unless explicitly stated otherwise. Please review the product description and related policies before completing your order.",
        ],
      },
      {
        title: "2. Compatibility",
        paragraphs: [
          "It is your responsibility to ensure the software is compatible with your system before purchase. Issues arising from system incompatibility are not eligible for refunds.",
        ],
      },
      {
        title: "3. Product Lifecycle",
        paragraphs: [
          "If the lifecycle of a product has ended, we are not obligated to replace, transfer, or upgrade the purchase to a newer version or alternative product.",
        ],
      },
      {
        title: "4. Private Product Access",
        paragraphs: [
          "Private product purchases may require internal approval. If access is not approved, the private product will not be fulfilled and a suitable replacement product or alternative solution will be provided instead.",
        ],
      },
      {
        title: "5. Chargebacks",
        paragraphs: [
          "Initiating a chargeback or payment dispute may result in suspension or termination of your access to ArisZay software and services.",
        ],
      },
      {
        title: "6. Support",
        paragraphs: [
          "If you believe an exception applies, contact support through your ArisZay account with your order number so we can review your case.",
        ],
      },
    ],
  },
];

export function generateStaticParams() {
  return pages.map((p) => ({ page: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const entry = pages.find((p) => p.slug === page);
  if (!entry) return {};
  return {
    title: entry.title,
    description: entry.intro ?? entry.title,
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const entry = pages.find((p) => p.slug === page);
  if (!entry) notFound();

  return (
    <div className="container-site py-16">
      <div className="mx-auto max-w-3xl">
        <SectionHeading title={entry.title} align="left" />
        {entry.intro ? (
          <p className="mt-4 text-sm leading-relaxed text-white/60">{entry.intro}</p>
        ) : null}
        <p className="mt-3 font-mono text-[10px] tracking-[0.18em] text-white/35 uppercase">
          Last updated: {entry.lastUpdated}
        </p>

        <div className="mt-10 space-y-10">
          {entry.sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-white">
                {section.title}
              </h2>
              {section.paragraphs.map((p, i) => (
                <p key={`${section.title}-${i}`} className="text-sm leading-relaxed text-white/65">
                  {p}
                </p>
              ))}
              {section.subsections?.map((sub) => (
                <div key={sub.title} className="mt-4 space-y-2 border-l border-white/10 pl-4">
                  <h3 className="text-sm font-semibold text-white/90">{sub.title}</h3>
                  {sub.paragraphs.map((p, i) => (
                    <p key={`${sub.title}-${i}`} className="text-sm leading-relaxed text-white/60">
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
