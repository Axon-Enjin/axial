type CardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "md" | "lg";
};

const paddingClass = {
  none: "",
  md: "p-4 sm:p-5 md:p-6",
  lg: "p-5 sm:p-6 md:p-8",
};

export function Card({ children, className = "", padding = "md" }: CardProps) {
  return (
    <div
      className={[
        "glass-panel relative overflow-hidden rounded-xl sm:rounded-2xl border border-outline-variant/10 border-t-outline-variant/10 bg-surface-container/40",
        paddingClass[padding],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
