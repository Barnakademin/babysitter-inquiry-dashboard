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
import {
  firstValidMatchingDate,
  formatMatchingDateOnly,
  isInvalidMatchingDate,
} from "@/utils/matchingDates";
import { dedupeHistoryRows } from "@/utils/dedupeHistoryRows";

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
    return !isInvalidMatchingDate(meeting) ? '5' : '4';
  }
  return '';
};

const isPipelineHistoryStage = (stage: string | number) => {
  const n = Number(stage);
  return !Number.isFinite(n) || n < 9000 || n >= 10000;
};

const connectingDateFor = (
  connections: ConnectionItem[],
  clientId: number,
  sitterId: number,
  fallbackDate: string,
) => {
  const connectingData = connections.find(
    (conn) => +conn.sitter_id === +sitterId && +conn.client_id === +clientId,
  );
  return firstValidMatchingDate(connectingData?.connecting, fallbackDate);
};

export function ClientHistoryView({ clientId, history, connections = [], showClientName = false }: ClientHistoryViewProps) {
  const [stageFilter, setStageFilter] = useState<string>('all');

  const clientHistory = dedupeHistoryRows(
    history
      .filter((h) => h.client_id.toString() === clientId.toString())
      .filter((h) => isPipelineHistoryStage(h.stage)),
  ).sort((a, b) => b.id - a.id);

  const filteredHistory = clientHistory.filter((h) => {
    if (stageFilter === 'all') return true;
    return getStage(h.stage, h.meeting) === stageFilter;
  });

  return (
    <div className="space-y-3">
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

      <div className="space-y-2">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((h) => {
            const stage = String(h.stage);
            const hasMeeting = !isInvalidMatchingDate(h.meeting);

            // Align with Matching History.jsx (+ stage 2 prefers event/log date, not later asked_client).
            let mainDate = '';
            if (stage === '2') {
              mainDate = firstValidMatchingDate(h.date, h.sitter_stage_two, h.asked_client);
            } else if (stage === '3') {
              mainDate = firstValidMatchingDate(h.asked_client, h.date, h.sitter_stage_two);
            } else if (stage === '4') {
              mainDate = hasMeeting
                ? firstValidMatchingDate(h.meeting, h.date)
                : firstValidMatchingDate(h.date_client, h.date, h.asked_client);
            } else if (stage === '45' || stage === '5') {
              mainDate = firstValidMatchingDate(h.meeting, h.date);
            } else if (stage === '6' || stage === '7') {
              mainDate = connectingDateFor(connections, clientId, h.sitter_id, h.date);
            }

            const reminderDate = formatMatchingDateOnly(h.reminder);
            const eventDate = formatMatchingDateOnly(h.date);
            const askedDate = formatMatchingDateOnly(h.asked_client);

            return (
              <div
                key={`${h.id}-${h.sitter_id}-${stage}`}
                className="grid grid-cols-[auto,auto,1fr,auto] gap-3 items-start p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex flex-col gap-1 min-w-[90px]">
                  {mainDate ? (
                    <div className="text-sm font-medium">{mainDate}</div>
                  ) : null}
                  {stage === '2' && reminderDate ? (
                    <div className="text-sm text-red-600 font-medium">({reminderDate})</div>
                  ) : null}
                </div>

                <div className="flex flex-col items-center gap-1 min-w-[60px]">
                  {stage === '2' && (
                    <>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">I-II</Badge>
                        <ArrowLeft className={cn("h-4 w-4", getStatusColor(h.status_sitter))} />
                      </div>
                      {reminderDate ? (
                        <Badge variant="outline" className="text-xs text-red-600 border-red-300 bg-red-50">
                          II-R
                        </Badge>
                      ) : null}
                    </>
                  )}

                  {stage === '3' && (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">III</Badge>
                      <ArrowRight className={cn("h-4 w-4", getStatusColor(h.status_client))} />
                    </div>
                  )}

                  {stage === '4' && hasMeeting && (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">V</Badge>
                      <CalendarDays className="h-4 w-4 text-green-600" />
                    </div>
                  )}

                  {stage === '4' && !hasMeeting && (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">IV</Badge>
                      <ArrowLeftRight className="h-4 w-4" />
                    </div>
                  )}

                  {(stage === '6' || stage === '7') && (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">VI</Badge>
                    </div>
                  )}

                  {(stage === '45' || stage === '5') && (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">V</Badge>
                      <CalendarDays className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  {stage === '2' && (
                    <>
                      <div className="text-sm">
                        Ask about family:
                        <span className={cn("ml-1 font-medium uppercase", getStatusColor(h.status_sitter))}>
                          {h.status_sitter}
                        </span>
                      </div>
                      {eventDate && eventDate !== mainDate ? (
                        <div className={cn("text-xs", getStatusColor(h.status_sitter))}>{eventDate}</div>
                      ) : null}
                    </>
                  )}

                  {stage === '3' && (
                    <>
                      <div className="text-sm">
                        Client wants to meet?
                        <span className={cn("ml-1 font-medium uppercase", getStatusColor(h.status_client))}>
                          {h.status_client}
                        </span>
                      </div>
                      {askedDate && askedDate !== mainDate ? (
                        <div className="text-xs text-muted-foreground">{askedDate}</div>
                      ) : null}
                    </>
                  )}

                  {stage === '4' && hasMeeting && (
                    <div className="text-sm">Schedule the meeting</div>
                  )}

                  {stage === '4' && !hasMeeting && (
                    <>
                      <div className="text-sm">
                        Client wants to meet?
                        <span className={cn("ml-1 font-medium uppercase", getStatusColor(h.status_client))}>
                          {h.status_client}
                        </span>
                      </div>
                      {mainDate ? (
                        <div className="text-xs text-muted-foreground">{mainDate}</div>
                      ) : null}
                    </>
                  )}

                  {(stage === '45' || stage === '5') && (
                    <div className="text-sm">Schedule the meeting</div>
                  )}

                  {(stage === '6' || stage === '7') && (
                    <div className="text-sm">Contract sent</div>
                  )}
                </div>

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
