import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cities, services, formLanguages } from "@/data/mockInquiries";

interface FilterBarProps {
  filters: {
    city: string;
    service: string;
    formLanguage: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

const serviceLabels: Record<string, string> = {
  babysitting: "BB",
  nanny: "KB",
};

const languageLabels: Record<string, string> = {
  sv: "🇸🇪 Swedish",
  en: "🇬🇧 English",
  de: "🇩🇪 German",
  fr: "🇫🇷 French",
  es: "🇪🇸 Spanish",
};

export function FilterBar({ filters, onFilterChange, onClearFilters }: FilterBarProps) {
  const hasActiveFilters = filters.city || filters.service || filters.formLanguage;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      <Select value={filters.city} onValueChange={(v) => onFilterChange("city", v)}>
        <SelectTrigger className="w-[140px] bg-card">
          <SelectValue placeholder="All Cities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cities</SelectItem>
          {cities.map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.service} onValueChange={(v) => onFilterChange("service", v)}>
        <SelectTrigger className="w-[140px] bg-card">
          <SelectValue placeholder="All Services" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Services</SelectItem>
          {services.map((service) => (
            <SelectItem key={service} value={service}>
              {serviceLabels[service]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.formLanguage} onValueChange={(v) => onFilterChange("formLanguage", v)}>
        <SelectTrigger className="w-[160px] bg-card">
          <SelectValue placeholder="All Languages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Languages</SelectItem>
          {formLanguages.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {languageLabels[lang]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
