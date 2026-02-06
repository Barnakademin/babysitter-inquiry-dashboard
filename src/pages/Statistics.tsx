import { mockInquiries } from "@/data/mockInquiries";
import { ConversionStatistics } from "@/components/dashboard/ConversionStatistics";
import { InquiryTimingDistribution } from "@/components/dashboard/InquiryTimingDistribution";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Statistics = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Conversion Statistics</h1>
            <p className="text-sm text-muted-foreground">
              Analyze inquiry-to-client conversion metrics
            </p>
          </div>
        </div>

        <InquiryTimingDistribution inquiries={mockInquiries} />

        <ConversionStatistics inquiries={mockInquiries} />
      </div>
    </div>
  );
};

export default Statistics;
