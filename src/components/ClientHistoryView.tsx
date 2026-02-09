import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
  CalendarDays,
  ExternalLink
} from "lucide-react";
import { HistoryItem, ConnectionItem } from "@/api/history";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ClientHistoryViewProps = {
  clientId: number;
  history: HistoryItem[];
  connections?: ConnectionItem[];
  showClientName?: boolean;
};

const getStatusColor = (status: string) => {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower === 'yes' || statusLower === 'y') return 'text-green-600';
  if (statusLower === 'no' || statusLower === 'n') return 'text-red-600';
  if (statusLower === 'maybe' || statusLower === 'm') return 'text-yellow-600';
  return 'text-muted-foreground';
};

const getStage = (stage: string, meeting: string) => {
  if (stage === '2') return '2';
  if (stage === '3') return '3';
  if (stage === '45') return '6';
  if (stage === '4') {
    return meeting ? '5' : '4';
  }
  return '';
};

export function ClientHistoryView({ clientId, history, connections = [], showClientName = false }: ClientHistoryViewProps) {
  const [stageFilter, setStageFilter] = useState<string>('all');

  const clientHistory = history
      .filter(h => h.client_id.toString() === clientId.toString())
      .sort((a, b) => b.id - a.id);

  const filteredHistory = clientHistory.filter(h => {
    if (stageFilter === 'all') return true;
    const stage = getStage(h.stage, h.meeting);
    return stage === stageFilter;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === '0000-00-00 00:00:00') return '';
    return dateStr.split(' ')[0];
  };

  return (
      <div className="space-y-3">
        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Stage:</span>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="2">I-II</SelectItem>
              <SelectItem value="3">III</SelectItem>
              <SelectItem value="4">IV</SelectItem>
              <SelectItem value="5">V</SelectItem>
              <SelectItem value="6">VI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* History Items */}
        <div className="space-y-2">
          {filteredHistory.length > 0 ? (
              filteredHistory.map((h) => {
                const stageNumber = getStage(h.stage, h.meeting);

                let mainDate = '';
                if (h.stage === '2') {
                  mainDate = h.asked_client ? formatDate(h.asked_client) : formatDate(h.date || h.sitter_stage_two);
                } else if (h.stage === '3') {
                  mainDate = h.date_client && h.date_client !== '0000-00-00' ? formatDate(h.date) : '';
                } else if (h.stage === '4' && h.meeting) {
                  mainDate = formatDate(h.meeting);
                } else if (h.stage === '4') {
                  mainDate = h.date_client && h.date_client !== '0000-00-00' ? formatDate(h.date) : '';
                } else if (h.stage === '45') {
                  const connectingData = connections.find(
                      conn => +conn.sitter_id === +h.sitter_id && +conn.client_id === +clientId
                  );
                  mainDate = connectingData?.connecting && connectingData.connecting !== '0000-00-00'
                      ? formatDate(connectingData.connecting)
                      : (h.date ? formatDate(h.date) : '');
                } else if (h.stage === '6') {
                  const connectingData = connections.find(
                      conn => +conn.sitter_id === +h.sitter_id && +conn.client_id === +clientId
                  );
                  mainDate = connectingData?.connecting && connectingData.connecting !== '0000-00-00'
                      ? formatDate(connectingData.connecting)
                      : (h.date ? formatDate(h.date) : '');
                }

                const reminderDate = formatDate(h.reminder);

                return (
                    <div
                        key={h.id}
                        className="grid grid-cols-[auto,auto,1fr,auto] gap-3 items-start p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      {/* Date Column */}
                      <div className="flex flex-col gap-1 min-w-[90px]">
                        {h.stage === '2' && (
                            <>
                              <div className="text-sm font-medium">{mainDate}</div>
                              {reminderDate && (
                                  <div className="text-sm text-red-600 font-medium">
                                    ({reminderDate})
                                  </div>
                              )}
                            </>
                        )}

                        {h.stage === '3' && h.date_client && (
                            <div className="text-sm font-medium">{formatDate(h.date)}</div>
                        )}

                        {h.stage === '4' && h.meeting && (
                            <div className="text-sm font-medium">{formatDate(h.meeting)}</div>
                        )}

                        {h.stage === '4' && !h.meeting && h.date_client && (
                            <div className="text-sm font-medium">{formatDate(h.date)}</div>
                        )}

                        {h.stage === '45' && (() => {
                          const connectingData = connections.find(
                              conn => +conn.sitter_id === +h.sitter_id && +conn.client_id === +clientId
                          );
                          const connectingDate = connectingData?.connecting && connectingData.connecting !== '0000-00-00'
                              ? formatDate(connectingData.connecting)
                              : (h.date ? formatDate(h.date) : '');
                          return connectingDate ? (
                              <div className="text-sm font-medium">{connectingDate}</div>
                          ) : null;
                        })()}
                      </div>

                      {/* Stage Badge with Icon */}
                      <div className="flex flex-col items-center gap-1 min-w-[60px]">
                        {h.stage === '2' && (
                            <>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs">I-II</Badge>
                                <ArrowLeft className={cn("h-4 w-4", getStatusColor(h.status_sitter))} />
                              </div>
                              {h.reminder && (
                                  <Badge variant="outline" className="text-xs text-red-600 border-red-300 bg-red-50">
                                    II-R
                                  </Badge>
                              )}
                            </>
                        )}

                        {h.stage === '3' && (
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">III</Badge>
                              <ArrowRight className={cn("h-4 w-4", getStatusColor(h.status_client))} />
                            </div>
                        )}

                        {h.stage === '4' && h.meeting && (
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">V</Badge>
                              <CalendarDays className="h-4 w-4 text-green-600" />
                            </div>
                        )}

                        {h.stage === '4' && !h.meeting && (
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">IV</Badge>
                              <ArrowLeftRight className="h-4 w-4" />
                            </div>
                        )}

                        {h.stage === '6' && (
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">V</Badge>
                              <CalendarDays className="h-4 w-4" />
                            </div>
                        )}

                        {h.stage === '45' && (
                            <Badge variant="outline" className="text-xs">VI</Badge>
                        )}
                      </div>

                      {/* Description Column */}
                      <div className="flex flex-col gap-1">
                        {h.stage === '2' && (
                            <>
                              <div className="text-sm">
                                Ask about family:
                                <span className={cn("ml-1 font-medium uppercase", getStatusColor(h.status_sitter))}>
                          {h.status_sitter}
                        </span>
                              </div>
                              {h.date && (
                                  <div className={cn("text-xs", getStatusColor(h.status_sitter))}>
                                    {formatDate(h.date)}
                                  </div>
                              )}
                            </>
                        )}

                        {h.stage === '3' && (
                            <>
                              <div className="text-sm">
                                Client wants to meet?
                                <span className={cn("ml-1 font-medium uppercase", getStatusColor(h.status_client))}>
                          {h.status_client}
                        </span>
                              </div>
                              {h.asked_client && (
                                  <div className="text-xs text-muted-foreground">
                                    {formatDate(h.asked_client)}
                                  </div>
                              )}
                            </>
                        )}

                        {h.stage === '4' && h.meeting && (
                            <div className="text-sm">Schedule the meeting</div>
                        )}

                        {h.stage === '4' && !h.meeting && (
                            <>
                              <div className="text-sm">
                                Client wants to meet?
                                <span className={cn("ml-1 font-medium uppercase", getStatusColor(h.status_client))}>
                          {h.status_client}
                        </span>
                              </div>
                              {h.asked_client && (
                                  <div className="text-xs text-muted-foreground">
                                    {formatDate(h.asked_client)}
                                  </div>
                              )}
                              {h.date && h.date !== '0000-00-00 00:00:00' && (
                                  <div className="text-xs text-muted-foreground">
                                    {formatDate(h.date)}
                                  </div>
                              )}
                            </>
                        )}

                        {h.stage === '6' && (
                            <div className="text-sm">Meeting scheduled</div>
                        )}

                        {h.stage === '45' && (
                            <div className="text-sm">Contract sent</div>
                        )}
                      </div>

                      {/* Name Column */}
                      <div className="flex items-center gap-1">
                        {showClientName ? (
                          <a
                              href={`/add/edit?id=${h.client_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {h.client_name || `Client ${h.client_id}`}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <a
                              href={`/sitter/edit?id=${h.sitter_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {h.sitter_name}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                );
              })
          ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                No history yet
              </div>
          )}
        </div>
      </div>
  );
}
