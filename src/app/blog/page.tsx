import type { Metadata } from "next";

import { BlogListing } from "@/components/blog/blog-listing";
import { SectionHeading } from "@/components/shared/section-heading";

export const metadata: Metadata = {
  title: "Blog",
  description: "Guides, comparisons, and updates from the ArisZay team.",
};

export default function BlogPage() {
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
