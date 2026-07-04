import { brandAssets } from "@/lib/brand-assets";
import { cn } from "@/lib/utils";

type BrandLogoSurface = "light" | "dark" | "default";

interface BrandLogoProps {
  className?: string;
  surface?: BrandLogoSurface;
}

function logoForSurface(surface: BrandLogoSurface) {
  if (surface === "dark") {
    return brandAssets.logoDark;
  }

  if (surface === "light") {
    return brandAssets.logoLight;
  }

  return brandAssets.logo;
}

export function BrandLogo({ className, surface = "default" }: BrandLogoProps) {
  return (
    <img
      src={logoForSurface(surface)}
      alt="CareerPilot AI"
      className={cn("block h-auto object-contain", className)}
      draggable={false}
    />
  );
}

