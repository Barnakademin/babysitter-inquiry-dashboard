interface LanguageBadgeProps {
  language: string;
}

export function LanguageBadge({ language }: LanguageBadgeProps) {
  return (
    <span className="badge-language">
      {language}
    </span>
  );
}
