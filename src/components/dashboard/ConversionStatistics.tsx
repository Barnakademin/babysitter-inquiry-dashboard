import { useMemo, useState } from "react";
import { ClientInquiry } from "@/data/mockInquiries";
import {
  calculateConversionStats,
  getBreakdownByCity,
  getBreakdownByLanguage,
  getBreakdownByNumberOfKids,
  getMonthlyStats,
} from "@/lib/conversionStats";
import { StatCard } from "./StatCard";
import { BreakdownTable } from "./BreakdownTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Users,
  UserCheck,
  UserX,
  Hourglass,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ConversionStatisticsProps {
  inquiries: ClientInquiry[];
}

export function ConversionStatistics({ inquiries }: ConversionStatisticsProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(true);

  const monthlyStats = useMemo(() => getMonthlyStats(inquiries), [inquiries]);

  const filteredInquiries = useMemo(() => {
    if (selectedMonth === "all") return inquiries;
    return inquiries.filter((i) => {
      const monthKey = `${i.createdAt.getFullYear()}-${String(i.createdAt.getMonth() + 1).padStart(2, "0")}`;
      return monthKey === selectedMonth;
    });
  }, [inquiries, selectedMonth]);

  const stats = useMemo(() => calculateConversionStats(filteredInquiries), [filteredInquiries]);
  const breakdownByCity = useMemo(() => getBreakdownByCity(filteredInquiries), [filteredInquiries]);
  const breakdownByLanguage = useMemo(() => getBreakdownByLanguage(filteredInquiries), [filteredInquiries]);
  const breakdownByKids = useMemo(() => getBreakdownByNumberOfKids(filteredInquiries), [filteredInquiries]);

  const notConvertedRate = stats.total > 0 
    ? Math.round((stats.notConverted / stats.total) * 100) 
    : 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Client Conversion Statistics</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Analyze inquiry-to-client conversion metrics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  {monthlyStats.map((m) => (
                    <SelectItem key={m.month} value={m.month}>
                      {m.monthLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Primary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard
                title="Total Inquiries"
                value={stats.total}
                icon={<Users className="w-5 h-5" />}
              />
              <StatCard
                title="Converted"
                value={stats.converted}
                subtitle={`Stage 7`}
                icon={<UserCheck className="w-5 h-5" />}
                valueClassName="text-green-600 dark:text-green-400"
              />
              <StatCard
                title="Not Converted"
                value={stats.notConverted}
                subtitle={`${notConvertedRate}% of total`}
                icon={<UserX className="w-5 h-5" />}
                valueClassName="text-red-600 dark:text-red-400"
              />
              <StatCard
                title="In Progress"
                value={stats.inProgress}
                subtitle="Stage 1-6"
                icon={<Hourglass className="w-5 h-5" />}
                valueClassName="text-amber-600 dark:text-amber-400"
              />
              <StatCard
                title="Conversion Rate"
                value={`${stats.conversionRate}%`}
                icon={<TrendingUp className="w-5 h-5" />}
                valueClassName={
                  stats.conversionRate >= 50 ? "text-green-600 dark:text-green-400" : 
                  stats.conversionRate >= 25 ? "text-amber-600 dark:text-amber-400" : 
                  "text-red-600 dark:text-red-400"
                }
              />
              <StatCard
                title="Avg Days to Convert"
                value={stats.avgDaysToConvert !== null ? stats.avgDaysToConvert : "—"}
                subtitle={stats.medianDaysToConvert !== null ? `Median: ${stats.medianDaysToConvert}d` : undefined}
                icon={<Clock className="w-5 h-5" />}
              />
            </div>

            {/* Breakdown Tabs */}
            <Tabs defaultValue="city" className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="city">By Location</TabsTrigger>
                <TabsTrigger value="language">By Language</TabsTrigger>
                <TabsTrigger value="kids">By Children</TabsTrigger>
              </TabsList>
              <TabsContent value="city" className="mt-4">
                <BreakdownTable data={breakdownByCity} title="By Location" />
              </TabsContent>
              <TabsContent value="language" className="mt-4">
                <BreakdownTable data={breakdownByLanguage} title="By Language" />
              </TabsContent>
              <TabsContent value="kids" className="mt-4">
                <BreakdownTable data={breakdownByKids} title="By Number of Children" />
              </TabsContent>
            </Tabs>

            {/* Monthly Overview */}
            {monthlyStats.length > 1 && selectedMonth === "all" && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Monthly Overview</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {monthlyStats.map((m) => (
                    <Card key={m.month} className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{m.monthLabel}</span>
                          <span className="text-sm text-muted-foreground">
                            {m.stats.total} inquiries
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-green-600 dark:text-green-400">
                            {m.stats.converted} converted
                          </span>
                          <span className="text-muted-foreground">
                            {m.stats.conversionRate}% rate
                          </span>
                          {m.stats.avgDaysToConvert !== null && (
                            <span className="text-muted-foreground">
                              {m.stats.avgDaysToConvert}d avg
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
