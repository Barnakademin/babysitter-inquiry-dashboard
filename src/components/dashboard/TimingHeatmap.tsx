import { useMemo } from "react";
import { ClientInquiry } from "@/data/mockInquiries";
import { getHeatmapData } from "@/lib/inquiryTimingStats";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TimingHeatmapProps {
  inquiries: ClientInquiry[];
}

function getIntensityClass(count: number, maxCount: number): string {
  if (maxCount === 0 || count === 0) return "bg-muted";
  const ratio = count / maxCount;
  if (ratio <= 0.2) return "bg-primary/15";
  if (ratio <= 0.4) return "bg-primary/30";
  if (ratio <= 0.6) return "bg-primary/50";
  if (ratio <= 0.8) return "bg-primary/70";
  return "bg-primary/90";
}

export function TimingHeatmap({ inquiries }: TimingHeatmapProps) {
  const { cells, days, timeRanges, maxCount } = useMemo(
    () => getHeatmapData(inquiries),
    [inquiries]
  );

  return (
    <div className="space-y-3">
      <TooltipProvider delayDuration={100}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-xs font-medium text-muted-foreground p-1.5 text-left w-12" />
                {timeRanges.map((t) => (
                  <th
                    key={t}
                    className="text-[10px] sm:text-xs font-medium text-muted-foreground p-1 text-center"
                  >
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day, dayIdx) => (
                <tr key={day}>
                  <td className="text-xs font-medium text-muted-foreground p-1.5 pr-2 text-right">
                    {day}
                  </td>
                  {timeRanges.map((_, timeIdx) => {
                    const cell = cells.find(
                      (c) => c.dayIndex === dayIdx && c.timeIndex === timeIdx
                    )!;
                    return (
                      <td key={timeIdx} className="p-0.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`aspect-square rounded-sm ${getIntensityClass(
                                cell.count,
                                maxCount
                              )} transition-colors cursor-default flex items-center justify-center min-w-[28px] min-h-[28px]`}
                            >
                              {cell.count > 0 && (
                                <span className="text-[10px] font-medium text-foreground/80 tabular-nums">
                                  {cell.count}
                                </span>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            <p className="font-medium">
                              {cell.day} {timeRanges[cell.timeIndex]}
                            </p>
                            <p className="text-muted-foreground">
                              {cell.count} {cell.count === 1 ? "inquiry" : "inquiries"}{" "}
                              ({cell.percentage}%)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TooltipProvider>

      {/* Legend */}
      <div className="flex items-center gap-2 justify-end text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-0.5">
          <div className="w-3.5 h-3.5 rounded-sm bg-muted" />
          <div className="w-3.5 h-3.5 rounded-sm bg-primary/15" />
          <div className="w-3.5 h-3.5 rounded-sm bg-primary/30" />
          <div className="w-3.5 h-3.5 rounded-sm bg-primary/50" />
          <div className="w-3.5 h-3.5 rounded-sm bg-primary/70" />
          <div className="w-3.5 h-3.5 rounded-sm bg-primary/90" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
