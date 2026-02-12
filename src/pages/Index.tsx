import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClientInquiry, fetchClientsFull } from "@/services/api";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { InquiryTable } from "@/components/dashboard/InquiryTable";
import { Pagination } from "@/components/dashboard/Pagination";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, Loader2 } from "lucide-react";
const ITEMS_PER_PAGE = 100;

type SortConfig = { key: string; direction: "asc" | "desc" } | null;

const Index = () => {
  const { data: inquiries = [], isLoading, error } = useQuery({
    queryKey: ['clients-full'],
    queryFn: fetchClientsFull,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    service: "",
    language: "",
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "createdAt", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);

  const allLanguages = useMemo(() => {
    return [...new Set(inquiries.flatMap((i) => i.languages))].sort();
  }, [inquiries]);

  const allCities = useMemo(() => {
    return [...new Set(inquiries.map((i) => i.city).filter(Boolean))].sort();
  }, [inquiries]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value === "all" ? "" : value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ city: "", service: "", language: "" });
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...inquiries];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (inquiry) =>
          inquiry.name.toLowerCase().includes(query) ||
          inquiry.email.toLowerCase().includes(query) ||
          inquiry.city.toLowerCase().includes(query) ||
          inquiry.id.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.city) {
      result = result.filter((inquiry) => inquiry.city === filters.city);
    }
    if (filters.service) {
      result = result.filter((inquiry) => inquiry.service === filters.service);
    }
    if (filters.language) {
      result = result.filter((inquiry) => inquiry.languages.includes(filters.language));
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof ClientInquiry];
        const bValue = b[sortConfig.key as keyof ClientInquiry];

        if (aValue instanceof Date && bValue instanceof Date) {
          return sortConfig.direction === "asc"
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }

        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        return sortConfig.direction === "asc"
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    return result;
  }, [inquiries, searchQuery, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading clients data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Error loading data</h3>
          <p className="text-muted-foreground text-sm">
            {error instanceof Error ? error.message : 'Failed to load clients data'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8 space-y-6">
        <DashboardHeader totalInquiries={inquiries.length} />

        <Button variant="outline" asChild className="gap-2">
          <Link to="/statistics">
            <BarChart3 className="h-4 w-4" />
            Conversion Statistics
          </Link>
        </Button>

        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <SearchBar value={searchQuery} onChange={(v) => { setSearchQuery(v); setCurrentPage(1); }} />
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            allLanguages={allLanguages}
            allCities={allCities}
          />
        </div>

        {filteredAndSortedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No inquiries found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            <InquiryTable
              data={paginatedData}
              sortConfig={sortConfig}
              onSort={handleSort}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
            />
            
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredAndSortedData.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
