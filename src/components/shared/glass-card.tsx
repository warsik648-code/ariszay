import { cn } from "@/lib/utils";

type GlassCardProps = React.ComponentProps<"div"> & {
  hover?: boolean;
};

export function GlassCard({
  className,
  hover = true,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card h-full p-6",
        hover && "hover-lift hover:border-primary/40",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
