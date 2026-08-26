import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PhoneFrame } from "@/components/artwork/device-frame";

export default function NotFound() {
  return (
    <div className="container-x grid place-items-center py-20 lg:py-28">
      <div className="grid max-w-lg items-center gap-10 text-center sm:text-left">
        <div className="mx-auto w-36 rotate-6 opacity-90 sm:mx-0">
          <PhoneFrame
            colors={["#b6c4ff", "#0041c8"]}
            pattern="neon-grid"
            showCamera={false}
          />
        </div>
        <div>
          <p className="text-label-sm text-primary">404</p>
          <h1 className="mt-2 font-heading text-headline-lg tracking-tight">
            This page slipped off the roll
          </h1>
          <p className="mt-3 text-muted-foreground">
            The link may be old or mistyped. Your device, however, is still very
            findable.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 sm:justify-start">
            <Button size="lg" className="h-12" asChild>
              <Link href="/">Back home</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12" asChild>
              <Link href="/shop">Shop skins</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
