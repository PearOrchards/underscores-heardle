import { icons, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

type IconType = keyof typeof icons;

interface IconProps extends LucideProps {
  name: keyof typeof icons;
  size?: number;
  color?: string;
  className?: string;
}

function Icon({ name, size, color, className, ...props }: IconProps) {
  const LucideIcon = icons[name];

  return (
    <LucideIcon
      size={size}
      color={color}
      className={cn(
        "size-8 hover:cursor-pointer hover:text-foreground-secondary",
        className,
      )}
      {...props}
    />
  );
}

export { Icon, type IconType };
