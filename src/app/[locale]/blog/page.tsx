import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { BlogListing } from "@/components/blog/blog-listing";
import { SectionHeading } from "@/components/shared/section-heading";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Blog",
  description: "Guides, comparisons, and updates from the ArisZay team.",
};

export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container-site py-14">
      <SectionHeading
        title="ArisZay Blog"
        description="Guides for Isle, Naraka, and the tools that keep you online."
      />
      <BlogListing />
    </div>
  );
}
