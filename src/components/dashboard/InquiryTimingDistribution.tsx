import { useMemo, useState } from "react";
import { ClientInquiry } from "@/data/mockInquiries";
import {
  getInquiriesByDayOfWeek,
  getInquiriesByTimeOfDay,
  getAvailableYears,
  filterInquiriesWithKnownTime,
} from "@/lib/inquiryTimingStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Grid3X3, Calendar, X } from "lucide-react";
import { TimingHeatmap } from "./TimingHeatmap";

interface InquiryTimingDistributionProps {
  inquiries: ClientInquiry[];
}

function DistributionBars({
  data,
  total,
}: {
  data: { label: string; count: number; percentage: number }[];
  total: number;
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-2.5">
      {data.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{item.label}</span>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="tabular-nums font-medium text-foreground">
                {item.count}
              </span>
              <span className="text-xs w-10 text-right tabular-nums">
                {item.percentage}%
              </span>
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{
                width: `${total > 0 ? (item.count / maxCount) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InquiryTimingDistribution({
  inquiries,
}: InquiryTimingDistributionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(`year-${new Date().getFullYear()}`);

  const availableYears = useMemo(() => getAvailableYears(inquiries), [inquiries]);

  const filteredInquiries = useMemo(() => {
    if (selectedPeriod === "all") return inquiries;
    if (selectedPeriod.startsWith("year-")) {
      const year = selectedPeriod.replace("year-", "");
      return inquiries.filter((i) => i.createdAt.getFullYear().toString() === year);
    }
    return inquiries.filter((i) => {
      const monthKey = `${i.createdAt.getFullYear()}-${String(i.createdAt.getMonth() + 1).padStart(2, "0")}`;
      return monthKey === selectedPeriod;
    });
  }, [inquiries, selectedPeriod]);

  const inquiriesWithKnownTime = useMemo(
    () => filterInquiriesWithKnownTime(filteredInquiries),
    [filteredInquiries]
  );

  const selectedPeriodLabel = useMemo(() => {
    if (selectedPeriod === "all") return "All time";
    if (selectedPeriod.startsWith("year-")) return selectedPeriod.replace("year-", "");
    const match = availableYears
      .flatMap((y) => y.months)
      .find((m) => m.month === selectedPeriod);
    return match?.label ?? selectedPeriod;
  }, [availableYears, selectedPeriod]);

  const byDayOfWeek = useMemo(
    () => getInquiriesByDayOfWeek(inquiriesWithKnownTime),
    [inquiriesWithKnownTime]
  );
  const byTimeOfDay = useMemo(
    () => getInquiriesByTimeOfDay(inquiriesWithKnownTime),
    [inquiriesWithKnownTime]
  );
  const total = inquiriesWithKnownTime.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarDays className="w-4 h-4 text-primary shrink-0" />
            <CardTitle className="text-sm font-semibold">
              Inquiry Timing Patterns
            </CardTitle>
            {selectedPeriod !== "all" && (
              <Badge
                variant="secondary"
                className="h-6 gap-1 pl-2.5 pr-1 text-xs font-medium animate-in fade-in-0 slide-in-from-left-2 duration-200"
              >
                <Calendar className="w-3 h-3" />
                {selectedPeriodLabel}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 rounded-full hover:bg-destructive/20 hover:text-destructive"
                  onClick={() => setSelectedPeriod("all")}
                >
                  <X className="h-2.5 w-2.5" />
                </Button>
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground tabular-nums">
              {total} {total === 1 ? "inquiry" : "inquiries"}
            </span>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                {availableYears.map((y) => (
                  <SelectItem key={y.year} value={`year-${y.year}`}>
                    {y.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="day" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mb-4">
            <TabsTrigger value="day" className="gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              Day of Week
            </TabsTrigger>
            <TabsTrigger value="time" className="gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Time of Day
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="gap-1.5">
              <Grid3X3 className="w-3.5 h-3.5" />
              Heatmap
            </TabsTrigger>
          </TabsList>
          <TabsContent value="day">
            <DistributionBars data={byDayOfWeek} total={total} />
          </TabsContent>
          <TabsContent value="time">
            <DistributionBars data={byTimeOfDay} total={total} />
          </TabsContent>
          <TabsContent value="heatmap">
            <TimingHeatmap inquiries={inquiriesWithKnownTime} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
