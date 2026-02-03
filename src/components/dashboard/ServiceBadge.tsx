import { Baby, Heart } from "lucide-react";

interface ServiceBadgeProps {
  service: 'babysitting' | 'nanny';
}

const serviceConfig = {
  babysitting: {
    label: "BB",
    icon: Baby,
    className: "bg-secondary text-secondary-foreground",
  },
  nanny: {
    label: "KB",
    icon: Heart,
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
