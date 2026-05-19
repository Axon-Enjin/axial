import { Icon } from "./Icon";

type CardHeaderProps = {
  icon?: string;
  label: string;
  action?: React.ReactNode;
};

export function CardHeader({ icon, label, action }: CardHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-on-surface-variant">
        {icon ? <Icon name={icon} size={18} /> : null}
        <span className="font-label-sm text-label-sm uppercase tracking-wider">{label}</span>
      </div>
      {action}
    </div>
  );
}
