import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, ChevronRight, Users, MapPin, Mail, Phone, Pencil, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientInquiry } from "@/data/mockInquiries";
import { ServiceBadge } from "./ServiceBadge";
import { LanguageBadge } from "./LanguageBadge";
import { FormLanguageFlag } from "./FormLanguageFlag";
import { PromoBadge } from "./PromoBadge";

interface InquiryTableProps {
  data: ClientInquiry[];
  sortConfig: { key: string; direction: "asc" | "desc" } | null;
  onSort: (key: string) => void;
}

function SortIcon({ columnKey, sortConfig }: { columnKey: string; sortConfig: { key: string; direction: "asc" | "desc" } | null }) {
  if (sortConfig?.key !== columnKey) {
    return <ChevronDown className="w-4 h-4 opacity-30" />;
  }
  return sortConfig.direction === "asc" ? (
    <ChevronUp className="w-4 h-4 text-primary" />
  ) : (
    <ChevronDown className="w-4 h-4 text-primary" />
  );
}

function SortableHeader({ 
  children, 
  columnKey, 
  sortConfig, 
  onSort 
}: { 
  children: React.ReactNode; 
  columnKey: string; 
  sortConfig: { key: string; direction: "asc" | "desc" } | null;
  onSort: (key: string) => void;
}) {
  return (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
      onClick={() => onSort(columnKey)}
    >
      <div className="flex items-center gap-1">
        {children}
        <SortIcon columnKey={columnKey} sortConfig={sortConfig} />
      </div>
    </TableHead>
  );
}

export function InquiryTable({ data, sortConfig, onSort }: InquiryTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-8"></TableHead>
              <SortableHeader columnKey="id" sortConfig={sortConfig} onSort={onSort}>ID</SortableHeader>
              <SortableHeader columnKey="name" sortConfig={sortConfig} onSort={onSort}>Name</SortableHeader>
              <SortableHeader columnKey="city" sortConfig={sortConfig} onSort={onSort}>Location</SortableHeader>
              <SortableHeader columnKey="service" sortConfig={sortConfig} onSort={onSort}>Service</SortableHeader>
              <TableHead>Languages</TableHead>
              <SortableHeader columnKey="needHelpWith" sortConfig={sortConfig} onSort={onSort}>Need Help With</SortableHeader>
              <SortableHeader columnKey="howOften" sortConfig={sortConfig} onSort={onSort}>Frequency</SortableHeader>
              <SortableHeader columnKey="numberOfKids" sortConfig={sortConfig} onSort={onSort}>
                <Users className="w-4 h-4" />
              </SortableHeader>
              <SortableHeader columnKey="formLanguage" sortConfig={sortConfig} onSort={onSort}>Form</SortableHeader>
              <TableHead>Promo</TableHead>
              <SortableHeader columnKey="createdAt" sortConfig={sortConfig} onSort={onSort}>Created</SortableHeader>
              <SortableHeader columnKey="stage" sortConfig={sortConfig} onSort={onSort}>Stage</SortableHeader>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((inquiry) => (
              <>
                <TableRow 
                  key={inquiry.id} 
                  className="table-row-hover cursor-pointer"
                  onClick={() => toggleRow(inquiry.id)}
                >
                  <TableCell className="w-8">
                    <ChevronRight 
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                        expandedRow === inquiry.id ? "rotate-90" : ""
                      }`} 
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {inquiry.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-foreground">{inquiry.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      {inquiry.city}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ServiceBadge service={inquiry.service} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {inquiry.languages.slice(0, 2).map((lang) => (
                        <LanguageBadge key={lang} language={lang} />
                      ))}
                      {inquiry.languages.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{inquiry.languages.length - 2}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{inquiry.needHelpWith}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{inquiry.howOften}</span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-secondary-foreground font-semibold text-sm">
                      {inquiry.numberOfKids}
                    </span>
                  </TableCell>
                  <TableCell>
                    <FormLanguageFlag language={inquiry.formLanguage} />
                  </TableCell>
                  <TableCell>
                    <PromoBadge code={inquiry.promoCode} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{format(inquiry.createdAt, "MMM d, yyyy")}</div>
                      <div className="text-muted-foreground text-xs">{format(inquiry.createdAt, "h:mm a")}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/15 text-primary font-semibold text-sm">
                      {inquiry.stage}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Edit:", inquiry.id);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Delete:", inquiry.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedRow === inquiry.id && (
                  <TableRow key={`${inquiry.id}-expanded`} className="bg-muted/20 animate-fade-in">
                    <TableCell colSpan={14} className="p-0">
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <a href={`mailto:${inquiry.email}`} className="text-primary hover:underline">
                              {inquiry.email}
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(inquiry.email);
                                toast.success("Email copied to clipboard");
                              }}
                              className="p-1 rounded hover:bg-muted transition-colors"
                              title="Copy email"
                            >
                              <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <a href={`tel:${inquiry.phone}`} className="hover:text-primary">
                              {inquiry.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{inquiry.address}, {inquiry.city}</span>
                          </div>
                        </div>
                        {inquiry.comment && (
                          <div className="bg-card rounded-lg p-3 border border-border">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Comment
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">{inquiry.comment}</p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
