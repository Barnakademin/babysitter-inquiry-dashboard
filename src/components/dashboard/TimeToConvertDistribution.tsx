import { useMemo } from "react";
import { ClientInquiry } from "@/data/mockInquiries";
import { getTimeToConvertDistribution } from "@/lib/conversionDistribution";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "lucide-react";

interface TimeToConvertDistributionProps {
  inquiries: ClientInquiry[];
}

export function TimeToConvertDistribution({ inquiries }: TimeToConvertDistributionProps) {
  const distribution = useMemo(() => getTimeToConvertDistribution(inquiries), [inquiries]);
  const totalConverted = useMemo(() => distribution.reduce((sum, r) => sum + r.count, 0), [distribution]);
  const maxCount = useMemo(() => Math.max(...distribution.map((r) => r.count), 1), [distribution]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-semibold">Time-to-Convert Distribution</CardTitle>
          <span className="text-xs text-muted-foreground ml-auto">
            {totalConverted} converted {totalConverted === 1 ? "inquiry" : "inquiries"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {distribution.map((range) => (
          <div key={range.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{range.label}</span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="tabular-nums font-medium text-foreground">{range.count}</span>
                <span className="text-xs w-10 text-right tabular-nums">
                  {range.percentage}%
                </span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${totalConverted > 0 ? (range.count / maxCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
