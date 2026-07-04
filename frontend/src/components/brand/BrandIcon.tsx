import { brandAssets } from "@/lib/brand-assets";
import { cn } from "@/lib/utils";

interface BrandIconProps {
  className?: string;
}

export function BrandIcon({ className }: BrandIconProps) {
  return (
    <img
      src={brandAssets.icon}
      alt="CareerPilot AI"
      className={cn("block aspect-square object-contain", className)}
      draggable={false}
    />
  );
}

