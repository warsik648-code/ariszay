import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          {siteConfig.name}
        </h1>
        <p className="text-muted-foreground max-w-md text-sm">
          Production-ready Next.js 15 foundation with TypeScript, Tailwind CSS,
          and shadcn/ui.
        </p>
      </div>
      <Button asChild>
        <a href="https://ui.shadcn.com" target="_blank" rel="noreferrer">
          Browse components
        </a>
      </Button>
    </main>
  );
}
