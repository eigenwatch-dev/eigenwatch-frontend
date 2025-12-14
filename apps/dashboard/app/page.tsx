"use client";

import { ComingSoon } from "@/components/shared/ComingSoon";
import { InspectIcon } from "lucide-react";


export default function DashboardPage() {
      return (
        <ComingSoon
          title="Dashboard"
          description="Get personalised insights into Operators, AVSs and Strategies you are currently involved with."
          icon={<InspectIcon className="h-12 w-12 text-primary mb-4" />}
        />
      );
}
