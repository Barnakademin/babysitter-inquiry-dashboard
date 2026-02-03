interface FormLanguageFlagProps {
  language: 'sv' | 'en' | 'de' | 'fr' | 'es';
}

const languageConfig = {
  sv: { label: "Sw", fullName: "Swedish" },
  en: { label: "Eng", fullName: "English" },
  de: { label: "De", fullName: "German" },
  fr: { label: "Fr", fullName: "French" },
  es: { label: "Es", fullName: "Spanish" },
};

export function FormLanguageFlag({ language }: FormLanguageFlagProps) {
  const config = languageConfig[language];

  return (
    <span className="text-sm text-muted-foreground" title={config.fullName}>
      {config.label}
    </span>
  );
}
