import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  label?: string;
  index?: string;
};

export function SectionHeading({
  title,
  description,
  align = "left",
  className,
  label = "Section",
  index,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-10 space-y-3",
        align === "center" && "mx-auto max-w-2xl text-center",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3",
          align === "center" && "justify-center",
        )}
      >
        {index && (
          <span className="font-mono text-xs tracking-[0.2em] text-primary">{index}</span>
        )}
        <span className="tech-label">{label}</span>
      </div>
      <h2 className="font-display text-4xl font-extrabold tracking-tight text-[#f2f0eb] uppercase sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-xl text-sm leading-relaxed text-[rgb(242_240_235_/_0.45)] sm:text-base">
          {description}
        </p>
      ) : null}
      <div className="tech-divider mt-4 max-w-24" />
    </div>
  );
}
