interface PromoBadgeProps {
  code: string | null;
}

export function PromoBadge({ code }: PromoBadgeProps) {
  if (!code) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  return (
    <span className="badge-promo">
      {code}
    </span>
  );
}
