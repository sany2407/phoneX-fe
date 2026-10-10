import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your phoneX account password.",
};

export default function ForgotPasswordPage() {
  return (
    <main className="container-x grid min-h-[calc(100dvh-4rem)] place-items-center py-10">
      <section className="w-full max-w-md">
        <div className="rounded-lg border bg-card p-8 shadow-pop sm:p-10">
          <h1 className="font-heading text-headline-xl">Reset password</h1>
          <p className="mt-2 text-body-md text-muted-foreground">
            We&apos;ll email you a reset link.
          </p>
          <div className="mt-8">
            <ForgotForm />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
