import { useMemo } from "react";
import { ClientInquiry } from "@/data/mockInquiries";
import {
  getInquiriesByDayOfWeek,
  getInquiriesByTimeOfDay,
} from "@/lib/inquiryTimingStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Clock } from "lucide-react";

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
  const byDayOfWeek = useMemo(
    () => getInquiriesByDayOfWeek(inquiries),
    [inquiries]
  );
  const byTimeOfDay = useMemo(
    () => getInquiriesByTimeOfDay(inquiries),
    [inquiries]
  );
  const total = inquiries.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-semibold">
            Inquiry Timing Patterns
          </CardTitle>
          <span className="text-xs text-muted-foreground ml-auto">
            {total} {total === 1 ? "inquiry" : "inquiries"}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="day" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-xs mb-4">
            <TabsTrigger value="day" className="gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              Day of Week
            </TabsTrigger>
            <TabsTrigger value="time" className="gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Time of Day
            </TabsTrigger>
          </TabsList>
          <TabsContent value="day">
            <DistributionBars data={byDayOfWeek} total={total} />
          </TabsContent>
          <TabsContent value="time">
            <DistributionBars data={byTimeOfDay} total={total} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
