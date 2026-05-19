type IconProps = {
  name: string;
  size?: number;
  fill?: boolean;
  className?: string;
};

export function Icon({ name, size = 20, fill = false, className = "" }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${fill ? "fill" : ""} ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
      }}
    >
      {name}
    </span>
  );
}
