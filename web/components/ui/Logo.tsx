type LogoMarkProps = {
  size?: number;
  className?: string;
};

/**
 * The Axial mark — an open-apex "A": two structural beams bridged by a teal
 * axial crossbar. Beams inherit `currentColor`; the crossbar is fixed brand teal.
 */
export function LogoMark({ size = 32, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7 26L14 7"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
      />
      <path
        d="M25 26L18 7"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
      />
      <path
        d="M10.75 18.5L21.25 18.5"
        stroke="#2DD4BF"
        strokeWidth="2.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

/** Full Axial lockup — boxed mark plus optional "Axial" wordmark. */
export function Logo({ size = 40, showWordmark = true, className }: LogoProps) {
  return (
    <span
      className={["inline-flex items-center gap-3", className]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className="flex shrink-0 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container text-primary shadow-[0_0_15px_rgba(190,198,224,0.1)]"
        style={{ height: size, width: size }}
      >
        <LogoMark size={Math.round(size * 0.58)} />
      </span>
      {showWordmark ? (
        <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">
          Axial
        </span>
      ) : null}
    </span>
  );
}
