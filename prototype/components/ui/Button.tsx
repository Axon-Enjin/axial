import { Icon } from "./Icon";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "teal"
  | "surface";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: string;
  iconRight?: string;
  glow?: boolean;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary shadow-[0_0_15px_rgba(190,198,224,0.15)] hover:opacity-90",
  secondary:
    "border border-outline-variant/40 bg-transparent text-on-surface hover:bg-surface-variant/20",
  ghost: "bg-transparent text-on-surface-variant hover:text-primary",
  teal: "bioluminescent-glow border border-[#2DD4BF]/40 bg-[#2DD4BF]/20 text-[#2DD4BF] hover:bioluminescent-glow-active",
  surface:
    "border border-outline-variant/50 bg-surface-container text-on-surface-variant",
};

const sizeClass = {
  sm: "px-4 py-2 text-label-sm",
  md: "px-[18px] py-[11px] text-label-md",
  lg: "px-[22px] py-3.5 text-label-md",
};

export function Button({
  variant = "primary",
  icon,
  iconRight,
  glow = false,
  fullWidth = false,
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg font-label-md font-semibold tracking-wide transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40",
        variantClass[variant],
        sizeClass[size],
        glow && variant === "primary"
          ? "shadow-[0_0_20px_rgba(190,198,224,0.2)]"
          : "",
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {icon ? <Icon name={icon} size={size === "sm" ? 16 : 18} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={size === "sm" ? 16 : 18} /> : null}
    </button>
  );
}
