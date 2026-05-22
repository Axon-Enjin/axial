type StatTileProps = {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
};

export function StatTile({ label, value, unit, accent }: StatTileProps) {
  return (
    <div className="glass-panel rounded-lg border-t border-outline-variant/10 bg-surface-container-low/50 p-3 sm:p-4">
      <p className="mb-1.5 sm:mb-2 font-label-sm text-[10px] sm:text-label-sm uppercase tracking-wider text-on-surface-variant">
        {label}
      </p>
      <p
        className={`font-headline-lg text-[20px] sm:text-[24px] md:text-headline-lg ${accent ? "text-primary" : "text-on-surface"}`}
      >
        {value}{" "}
        {unit ? (
          <span className="font-headline-md text-[16px] sm:text-[18px] md:text-headline-md text-on-surface-variant">{unit}</span>
        ) : null}
      </p>
    </div>
  );
}
