export type LoanStatus = 0 | 1 | 2 | 3;

export type StatusTone = "warning" | "success" | "destructive" | "muted";

export function loanStatusToLabel(s: LoanStatus) {
  switch (s) {
    case 0:
      return "menunggu";
    case 1:
      return "disetujui";
    case 2:
      return "ditolak";
    case 3:
      return "dibatalkan";
    default:
      return "-";
  }
}

export function loanStatusToTone(s: LoanStatus): StatusTone {
  switch (s) {
    case 0:
      return "warning";
    case 1:
      return "success";
    case 2:
      return "destructive";
    case 3:
      return "muted";
    default:
      return "muted";
  }
}
