import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BreakdownItem } from "@/lib/conversionStats";
import { cn } from "@/lib/utils";

interface BreakdownTableProps {
  data: BreakdownItem[];
  title: string;
  maxVisibleRows?: number;
}

const DEFAULT_MAX_VISIBLE_ROWS = 10;

export function BreakdownTable({ data, title, maxVisibleRows = DEFAULT_MAX_VISIBLE_ROWS }: BreakdownTableProps) {
  const hasMoreRows = data.length > maxVisibleRows;

  const rowHeightPx = 41;
  const headerHeightPx = 48;
  const fixedHeightPx = Math.min(maxVisibleRows, data.length) * rowHeightPx + headerHeightPx;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {hasMoreRows && (
          <span className="text-xs text-muted-foreground">
            Showing {data.length} items (scroll for more)
          </span>
        )}
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div
          className={cn("w-full", hasMoreRows && "overflow-y-auto")}
          style={hasMoreRows ? { height: `${fixedHeightPx}px` } : undefined}
        >
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="sticky top-0 bg-muted/50 z-10">
              <TableRow>
                <TableHead className="font-semibold">{title.replace("By ", "")}</TableHead>
                <TableHead className="text-center font-semibold">Total</TableHead>
                <TableHead className="text-center font-semibold">Converted</TableHead>
                <TableHead className="text-center font-semibold">Not Conv.</TableHead>
                <TableHead className="text-center font-semibold">In Progress</TableHead>
                <TableHead className="text-center font-semibold">Conv. Rate</TableHead>
                <TableHead className="text-center font-semibold">Avg Days</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((item) => (
                <TableRow key={item.label}>
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell className="text-center">{item.total}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium dark:bg-green-900/30 dark:text-green-400">
                      {item.converted}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium dark:bg-red-900/30 dark:text-red-400">
                      {item.notConverted}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium dark:bg-amber-900/30 dark:text-amber-400">
                      {item.inProgress}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={cn(
                        "font-semibold",
                        item.conversionRate >= 50
                          ? "text-green-600 dark:text-green-400"
                          : item.conversionRate >= 25
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-600 dark:text-red-400",
                      )}
                    >
                      {item.conversionRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {item.avgDaysToConvert !== null ? `${item.avgDaysToConvert}d` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </table>
        </div>
      </div>
    </div>
  );
}
