"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeNewsletter } from "@/app/actions/newsletter";

type Props = {
  emailPlaceholder?: string;
  subscribeLabel?: string;
};

const initialState = { success: false as boolean, error: "", message: "" };

export default function NewsletterForm({
  emailPlaceholder = "Your email address",
  subscribeLabel = "Subscribe",
}: Props) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await subscribeNewsletter(formData);
      if (result.success) return { success: true, message: result.message, error: "" };
      return { success: false, error: result.error, message: "" };
    },
    initialState,
  );

  if (state.success) {
    return (
      <p className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-3 sm:flex-row">
      <Input
        type="email"
        name="email"
        required
        placeholder={emailPlaceholder}
        disabled={isPending}
        className="h-11 flex-1 rounded-xl border-white/10 bg-black/20"
        aria-label="Email address"
      />
      <Button type="submit" disabled={isPending} className="h-11 rounded-xl px-6">
        {isPending ? "Subscribing…" : subscribeLabel}
      </Button>
      {state.error && (
        <p className="w-full text-xs text-red-400 text-left">{state.error}</p>
      )}
    </form>
  );
}
