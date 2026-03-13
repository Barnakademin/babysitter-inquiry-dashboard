import { Baby } from "lucide-react";

interface ServiceBadgeProps {
  service: 'babysitting' | 'nanny';
}

const serviceConfig = {
  babysitting: {
    label: "BB",
    icon: Baby,
    className: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  nanny: {
    label: "KB",
    icon: Baby,
    className: "bg-primary/15 text-primary",
  },
};

export function ServiceBadge({ service }: ServiceBadgeProps) {
  const config = serviceConfig[service];
  const Icon = config.icon;

  return (
    <span className={`badge-service ${config.className}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
