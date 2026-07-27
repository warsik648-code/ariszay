import { CheckCircle, ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return (
    <div className="container-site flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
        <CheckCircle className="size-8 text-emerald-400" />
      </div>

      <h1 className="text-3xl font-bold text-white">Order received</h1>

      {orderId && (
        <p className="mt-2 font-mono text-sm text-white/40">
          Order #{orderId.slice(-8).toUpperCase()}
        </p>
      )}

      <p className="mt-4 max-w-md text-white/60 leading-relaxed">
        Your payment was processed. Check your email for license details and setup instructions. They should arrive within a few minutes.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-xl">
          <Link href="/account">
            <Package className="mr-1.5 size-4" />
            View my orders
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/">
            Back to home
            <ArrowRight className="ml-1.5 size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
