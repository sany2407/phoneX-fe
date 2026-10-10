import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CustomizeClient } from "@/components/customizer/customize-client";

// ─── valid sub-types ──────────────────────────────────────────────────────────

const TYPE_META: Record<string, { title: string; description: string }> = {
  "phone-skin": {
    title: "Custom Phone Skin — Upload Your Artwork",
    description:
      "Upload your own artwork and get a precision-cut skin for your exact phone model.",
  },
  "laptop-skin": {
    title: "Custom Laptop Skin — Upload Your Artwork",
    description:
      "Upload your own artwork and get a full-lid wrap cut precisely for your laptop.",
  },
  "photo-case": {
    title: "Custom Photo Case — Print Your Photo",
    description:
      "Get your photo printed on a slim protective case for your phone.",
  },
  "metal-case": {
    title: "Custom Metal Case — Your Design on Metal",
    description:
      "A hard metal back with your artwork printed on it, cut for your device.",
  },
};

export function generateStaticParams() {
  return Object.keys(TYPE_META).map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const meta = TYPE_META[type];
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/customize/${type}` },
  };
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function CustomizeTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;

  if (!TYPE_META[type]) notFound();

  // CustomizeClient handles device selection and the full studio UI.
  // We render it directly — the user picks their device model first,
  // then uploads artwork. The type slug is informational (for SEO).
  return (
    <Suspense
      fallback={
        <div className="container-x py-16">
          <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-xl bg-muted" />
        </div>
      }
    >
      <CustomizeClient />
    </Suspense>
  );
}
