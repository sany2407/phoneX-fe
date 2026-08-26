import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/forms";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your phoneX account to track orders and access saved designs.",
};

export default function LoginPage() {
  return <LoginForm />;
}
