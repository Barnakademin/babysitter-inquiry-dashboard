import { Baby, Heart, Globe, AlertCircle } from "lucide-react";

interface ServiceBadgeProps {
  service: 'babysitting' | 'nanny' | 'au-pair' | 'emergency';
}

const serviceConfig = {
  babysitting: {
    label: "Babysitting",
    icon: Baby,
    className: "bg-secondary text-secondary-foreground",
  },
  nanny: {
    label: "Nanny",
    icon: Heart,
    className: "bg-primary/15 text-primary",
  },
  "au-pair": {
    label: "Au Pair",
    icon: Globe,
    className: "bg-accent text-accent-foreground",
  },
  emergency: {
    label: "Emergency",
    icon: AlertCircle,
    className: "bg-destructive/15 text-destructive",
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
