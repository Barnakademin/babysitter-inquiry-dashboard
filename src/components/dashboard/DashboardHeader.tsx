import { Baby, Users } from "lucide-react";

interface DashboardHeaderProps {
  totalInquiries: number;
}

export function DashboardHeader({ totalInquiries }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
          <Baby className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Client Inquiries</h1>
          <p className="text-muted-foreground text-sm">Manage and track babysitter requests</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border shadow-card">
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Total Inquiries:</span>
        <span className="font-bold text-foreground">{totalInquiries}</span>
      </div>
    </header>
  );
}
