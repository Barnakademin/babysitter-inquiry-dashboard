interface FormLanguageFlagProps {
  language: 'sv' | 'en' | 'de' | 'fr' | 'es';
}

const languageConfig = {
  sv: { flag: "🇸🇪", label: "Swedish" },
  en: { flag: "🇬🇧", label: "English" },
  de: { flag: "🇩🇪", label: "German" },
  fr: { flag: "🇫🇷", label: "French" },
  es: { flag: "🇪🇸", label: "Spanish" },
};

export function FormLanguageFlag({ language }: FormLanguageFlagProps) {
  const config = languageConfig[language];

  return (
    <span className="inline-flex items-center gap-1.5 text-sm" title={config.label}>
      <span className="text-lg">{config.flag}</span>
      <span className="text-muted-foreground">{config.label}</span>
    </span>
  );
}
