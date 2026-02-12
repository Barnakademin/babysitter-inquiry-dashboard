import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchClientsFull, type ClientInquiry } from "@/services/api";
import { fetchHistory } from "@/api/history";
import { ConversionStatistics } from "@/components/dashboard/ConversionStatistics";
import { InquiryTimingDistribution } from "@/components/dashboard/InquiryTimingDistribution";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function buildStage7FromHistory(history: { client_id: number; stage: string; date: string }[]) {
  const byClient = new Map<string, { everReachedStage7: boolean; firstStage7Date: Date }>();
  for (const row of history) {
    const stageNum = Number(row.stage);
    if (stageNum !== 7) continue;
    const clientKey = String(row.client_id);
    const date = row.date ? new Date(row.date) : null;
    if (!date || isNaN(date.getTime())) continue;
    const existing = byClient.get(clientKey);
    if (!existing || date < existing.firstStage7Date) {
      byClient.set(clientKey, { everReachedStage7: true, firstStage7Date: date });
    } else if (!existing.everReachedStage7) {
      byClient.set(clientKey, { ...existing, everReachedStage7: true });
    }
  }
  return byClient;
}

const Statistics = () => {
  const { data: inquiries = [], isLoading, error } = useQuery({
    queryKey: ['clients-full'],
    queryFn: fetchClientsFull,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['get-history'],
    queryFn: fetchHistory,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 60_000,
  });

  const enrichedInquiries = useMemo((): ClientInquiry[] => {
    const stage7Map = buildStage7FromHistory(history);
    return inquiries.map((inv) => {
      const fromHistory = stage7Map.get(inv.id);
      const everReachedStage7 = (inv.stage === 7 || inv.everReachedStage7 || fromHistory?.everReachedStage7) ?? false;
      const firstStage7Date =
        inv.stage === 7
          ? inv.stageDate
          : (inv.firstStage7Date ?? fromHistory?.firstStage7Date ?? undefined);
      return {
        ...inv,
        everReachedStage7: everReachedStage7 ? true : undefined,
        firstStage7Date: firstStage7Date ?? undefined,
      };
    });
  }, [inquiries, history]);

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

        <ConversionStatistics inquiries={enrichedInquiries} />

        <InquiryTimingDistribution inquiries={enrichedInquiries} />
      </div>
    </div>
  );
};

export default Statistics;
