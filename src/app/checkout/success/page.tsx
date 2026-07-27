import { CheckCircle, ArrowRight, Package, LifeBuoy, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    orderId?: string;
    orderNumber?: string;
    ticketNumber?: string;
    pendingVerification?: string;
  }>;
}) {
  const { orderId, orderNumber, ticketNumber, pendingVerification } = await searchParams;
  const displayOrder = orderNumber ?? (orderId ? `#${orderId.slice(-8).toUpperCase()}` : null);
  const awaiting = pendingVerification === "1";

  return (
    <div className="container-site flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <div
        className={`mb-6 flex size-16 items-center justify-center rounded-full border ${
          awaiting
            ? "border-yellow-500/25 bg-yellow-500/10"
            : "border-emerald-500/20 bg-emerald-500/10"
        }`}
      >
        {awaiting ? (
          <Clock className="size-8 text-yellow-400" />
        ) : (
          <CheckCircle className="size-8 text-emerald-400" />
        )}
      </div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-white">
        {awaiting ? "Payment code submitted" : "Order received"}
      </h1>
      {displayOrder && (
        <p className="mt-2 font-mono text-sm text-primary">{displayOrder}</p>
      )}
      {awaiting ? (
        <div className="mt-6 max-w-md space-y-3 border border-yellow-500/25 bg-yellow-500/8 px-5 py-4 text-left">
          <p className="tech-label text-yellow-300">Pending Verification</p>
          <p className="text-sm text-white/80">Payment code submitted successfully.</p>
          <p className="text-sm text-white/60">
            Your order is being reviewed. Track status anytime in Mission Control → My Orders.
          </p>
        </div>
      ) : ticketNumber ? (
        <div className="mt-6 max-w-md border border-primary/30 bg-[rgb(200_255_0_/_0.06)] px-5 py-4">
          <p className="tech-label text-primary mb-2">Support</p>
          <p className="text-sm text-white/80">Your support ticket has been created.</p>
          <p className="mt-1 font-mono text-primary">{ticketNumber}</p>
        </div>
      ) : (
        <p className="mt-4 max-w-md text-white/60 leading-relaxed">
          Sign in to Mission Control to track this order and open support tickets.
        </p>
      )}
      {awaiting && ticketNumber && (
        <p className="mt-4 font-mono text-sm text-primary">Support ticket {ticketNumber}</p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-none">
          <Link href={orderNumber ? `/account/orders/${orderNumber}` : "/account/orders"}>
            <Package className="mr-1.5 size-4" />
            View order
          </Link>
        </Button>
        {ticketNumber && (
          <Button asChild variant="outline" className="rounded-none border-white/15">
            <Link href={`/account/tickets/${ticketNumber}`}>
              <LifeBuoy className="mr-1.5 size-4" />
              Open ticket
            </Link>
          </Button>
        )}
        <Button asChild variant="outline" className="rounded-none border-white/15">
          <Link href="/">
            Back to home
            <ArrowRight className="ml-1.5 size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
