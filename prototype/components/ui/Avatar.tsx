type AvatarProps = {
  initials: string;
  size?: number;
};

export function Avatar({ initials, size = 40 }: AvatarProps) {
  return (
    <div
      className="flex items-center justify-center rounded-full border border-outline-variant/20 bg-surface-variant font-label-md text-label-md text-on-surface"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}
