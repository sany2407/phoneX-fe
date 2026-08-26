import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomizeClient } from "@/components/customizer/customize-client";

export const metadata: Metadata = {
  title: "Custom Skin Studio — Design Your Own Skin",
  description:
    "Upload your artwork and preview it on your exact phone or laptop. Pick a finish, save your design and we print it to fit.",
  alternates: { canonical: "/customize" },
};

export default function CustomizePage() {
  return (
    <Suspense fallback={<div className="container-x py-16"><div className="mx-auto h-96 max-w-3xl animate-pulse rounded-xl bg-muted" /></div>}>
      <CustomizeClient />
    </Suspense>
  );
}
