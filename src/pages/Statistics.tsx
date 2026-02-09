import { useQuery } from "@tanstack/react-query";
import { fetchClientsFull } from "@/services/api";
import { ConversionStatistics } from "@/components/dashboard/ConversionStatistics";
import { InquiryTimingDistribution } from "@/components/dashboard/InquiryTimingDistribution";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Statistics = () => {
  const { data: inquiries = [], isLoading, error } = useQuery({
    queryKey: ['clients-full'],
    queryFn: fetchClientsFull,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading statistics data...</p>
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
            {error instanceof Error ? error.message : 'Failed to load statistics data'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8 px-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Conversion Statistics</h1>
            <p className="text-sm text-muted-foreground">
              Analyze inquiry-to-client conversion metrics
            </p>
          </div>
        </div>

        <ConversionStatistics inquiries={inquiries} />

        <InquiryTimingDistribution inquiries={inquiries} />
      </div>
    </div>
  );
};

export default Statistics;
