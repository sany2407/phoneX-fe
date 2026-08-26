import Image from "next/image";
import { cn } from "@/lib/utils";

function isRemoteSrc(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}

export function DevicePhoto({
  src,
  alt,
  sizes,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (isRemoteSrc(src)) {
    return (
      // Remote CDN links — skip next/image until the host is in next.config.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn("absolute inset-0 h-full w-full object-contain object-center", className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={cn("object-contain object-center", className)}
      priority={priority}
    />
  );
}
