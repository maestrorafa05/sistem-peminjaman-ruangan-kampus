import { Badge } from "@/components/ui/badge";
import type { LoanStatus } from "@/api/types";
import { loanStatusToLabel, loanStatusToTone } from "@/lib/status";

export function LoanStatusBadge({ status }: { status: LoanStatus }) {
  const label = loanStatusToLabel(status);
  const tone = loanStatusToTone(status);

  return <Badge variant={tone}>{label}</Badge>;
}
