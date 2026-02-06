import { useMemo, useState } from "react";
import { ClientInquiry } from "@/data/mockInquiries";
import {
  calculateConversionStats,
  getBreakdownByCity,
  getBreakdownByLanguage,
  getBreakdownByNumberOfKids,
  getBreakdownByHelpType,
  getBreakdownByFrequency,
  getBreakdownByNannyLanguagePreference,
  getBreakdownByFormLanguage,
  getYearlyStats,
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
  X,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TimeToConvertDistribution } from "./TimeToConvertDistribution";

interface ConversionStatisticsProps {
  inquiries: ClientInquiry[];
}

export function ConversionStatistics({ inquiries }: ConversionStatisticsProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(true);

  // All yearly stats for the period selector dropdown
  const allYearlyStats = useMemo(() => getYearlyStats(inquiries), [inquiries]);

  const selectedPeriodLabel = useMemo(() => {
    if (selectedMonth === "all") return "All time";
    if (selectedMonth.startsWith("year-")) {
      const year = selectedMonth.replace("year-", "");
      return `Year ${year}`;
    }

    const monthMatch = allYearlyStats
      .flatMap((y) => y.months)
      .find((m) => m.month === selectedMonth);

    return monthMatch?.monthLabel ?? selectedMonth;
  }, [allYearlyStats, selectedMonth]);

  const filteredInquiries = useMemo(() => {
    if (selectedMonth === "all") return inquiries;
    // Check if it's a year selection
    if (selectedMonth.startsWith("year-")) {
      const year = selectedMonth.replace("year-", "");
      return inquiries.filter((i) => {
        return i.createdAt.getFullYear().toString() === year;
      });
    }
    // Month selection
    return inquiries.filter((i) => {
      const monthKey = `${i.createdAt.getFullYear()}-${String(i.createdAt.getMonth() + 1).padStart(2, "0")}`;
      return monthKey === selectedMonth;
    });
  }, [inquiries, selectedMonth]);

  // Yearly stats based on filtered data (for display)
  const yearlyStats = useMemo(() => getYearlyStats(filteredInquiries), [filteredInquiries]);

  const stats = useMemo(() => calculateConversionStats(filteredInquiries), [filteredInquiries]);
  const breakdownByCity = useMemo(() => getBreakdownByCity(filteredInquiries), [filteredInquiries]);
  const breakdownByLanguage = useMemo(() => getBreakdownByLanguage(filteredInquiries), [filteredInquiries]);
  const breakdownByKids = useMemo(() => getBreakdownByNumberOfKids(filteredInquiries), [filteredInquiries]);
  const breakdownByHelpType = useMemo(() => getBreakdownByHelpType(filteredInquiries), [filteredInquiries]);
  const breakdownByFrequency = useMemo(() => getBreakdownByFrequency(filteredInquiries), [filteredInquiries]);
  const breakdownByNannyPref = useMemo(() => getBreakdownByNannyLanguagePreference(filteredInquiries), [filteredInquiries]);
  const breakdownByFormLang = useMemo(() => getBreakdownByFormLanguage(filteredInquiries), [filteredInquiries]);

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
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl">Client Conversion Statistics</CardTitle>
                  {selectedMonth !== "all" && (
                    <Badge 
                      variant="secondary" 
                      className="h-7 gap-1.5 pl-3 pr-1.5 text-sm font-medium animate-in fade-in-0 slide-in-from-left-2 duration-200"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      {selectedPeriodLabel}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-full hover:bg-destructive/20 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMonth("all");
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Analyze inquiry-to-client conversion metrics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedMonth.startsWith("year-") || selectedMonth === "all" ? selectedMonth : `year-${selectedMonth.split("-")[0]}`} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  {allYearlyStats.map((y) => (
                    <SelectItem key={y.year} value={`year-${y.year}`}>
                      {y.year}
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

            {/* Yearly Overview */}
            {yearlyStats.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Yearly & Monthly Overview</h4>
                {yearlyStats.map((y) => (
                  <div key={y.year} className="space-y-3">
                    <Card 
                      className={`bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 cursor-pointer transition-all duration-200 hover:from-primary/10 hover:to-primary/15 hover:shadow-md hover:scale-[1.01] ${selectedMonth === `year-${y.year}` ? 'ring-2 ring-primary shadow-md' : ''}`}
                      onClick={() => setSelectedMonth(`year-${y.year}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-lg">{y.year}</span>
                          </div>
                          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to select year
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-foreground font-medium">
                            {y.stats.total} inquiries
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {y.stats.converted} converted ({y.stats.conversionRate}%)
                          </span>
                          {y.stats.avgDaysToConvert !== null && (
                            <span className="text-muted-foreground">
                              {y.stats.avgDaysToConvert}d avg
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 pl-2">
                      {y.months.map((m) => (
                        <Card 
                          key={m.month} 
                          className={`group bg-card cursor-pointer transition-all duration-200 hover:bg-accent hover:shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 ${selectedMonth === m.month ? 'ring-2 ring-primary border-primary bg-primary/5 shadow-sm' : 'border-muted'}`}
                          onClick={() => setSelectedMonth(m.month)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`font-medium text-sm transition-colors ${selectedMonth === m.month ? 'text-primary' : 'group-hover:text-primary'}`}>
                                {m.monthLabel}
                              </span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                {m.stats.total}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                {m.stats.converted} ({m.stats.conversionRate}%)
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Time-to-Convert Distribution */}
            <TimeToConvertDistribution inquiries={filteredInquiries} />

            {/* Breakdown Tabs */}
            <Tabs defaultValue="city" className="w-full">
              <TabsList className="grid w-full grid-cols-7 max-w-3xl">
                <TabsTrigger value="city">Location</TabsTrigger>
                <TabsTrigger value="language">Language</TabsTrigger>
                <TabsTrigger value="kids">Children</TabsTrigger>
                <TabsTrigger value="helpType">Help Type</TabsTrigger>
                <TabsTrigger value="frequency">Frequency</TabsTrigger>
                <TabsTrigger value="nannyPref">Nanny Pref</TabsTrigger>
                <TabsTrigger value="formLang">Form Lang</TabsTrigger>
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
              <TabsContent value="helpType" className="mt-4">
                <BreakdownTable data={breakdownByHelpType} title="By Help Type" />
              </TabsContent>
              <TabsContent value="frequency" className="mt-4">
                <BreakdownTable data={breakdownByFrequency} title="By Frequency" />
              </TabsContent>
              <TabsContent value="nannyPref" className="mt-4">
                <BreakdownTable data={breakdownByNannyPref} title="By Nanny Language Preference" />
              </TabsContent>
              <TabsContent value="formLang" className="mt-4">
                <BreakdownTable data={breakdownByFormLang} title="By Form Language" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
