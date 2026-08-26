import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/forms";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a phoneX account to save designs, track orders and check out faster.",
};

export default function SignupPage() {
  return <SignupForm />;
}
