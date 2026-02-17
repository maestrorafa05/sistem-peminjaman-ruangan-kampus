import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useLoan, useLoanHistory } from "@/api/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoanStatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/datetime";

export function LoanDetailPage() {
  const { id } = useParams();
  const loanId = id ?? "";

  const loan = useLoan(loanId);
  const history = useLoanHistory(loanId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link to="/loans">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Loan detail</h1>
            <p className="text-sm text-muted-foreground">{loanId}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Info</CardTitle>
        </CardHeader>
        <CardContent>
          {loan.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : loan.isError ? (
            <div className="text-sm text-destructive">Gagal load loan.</div>
          ) : !loan.data ? (
            <div className="text-sm text-muted-foreground">Data tidak ditemukan.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Room</div>
                <div className="mt-1 text-lg font-semibold">
                  {loan.data.roomCode} — {loan.data.roomName}
                </div>
                <div className="mt-3 grid gap-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Start:</span> {formatDateTime(loan.data.startTime)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">End:</span> {formatDateTime(loan.data.endTime)}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Peminjam</div>
                    <div className="mt-1 text-lg font-semibold">{loan.data.namaPeminjam}</div>
                    <div className="text-sm text-muted-foreground">NRP: {loan.data.nrp}</div>
                  </div>
                  <LoanStatusBadge status={loan.data.status} />
                </div>

                <div className="mt-3 text-sm">
                  <div className="text-muted-foreground">Notes</div>
                  <div className="mt-1 whitespace-pre-wrap">{loan.data.notes ?? "-"}</div>
                </div>

                <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                  <div>Created: {formatDateTime(loan.data.createdAt)}</div>
                  <div>Updated: {formatDateTime(loan.data.updatedAt)}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : history.isError ? (
            <div className="text-sm text-destructive">Gagal load history.</div>
          ) : (history.data?.length ?? 0) === 0 ? (
            <div className="text-sm text-muted-foreground">Belum ada history (baru dibuat).</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ChangedAt</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Changed By</TableHead>
                  <TableHead>Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.data!.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>{formatDateTime(h.changedAt)}</TableCell>
                    <TableCell>
                      <LoanStatusBadge status={h.fromStatus} />
                    </TableCell>
                    <TableCell>
                      <LoanStatusBadge status={h.toStatus} />
                    </TableCell>
                    <TableCell>{h.changedBy ?? "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{h.comment ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
