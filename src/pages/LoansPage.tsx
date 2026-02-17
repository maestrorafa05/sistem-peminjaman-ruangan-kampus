import * as React from "react";
import { Link } from "react-router-dom";
import { Eye, XCircle } from "lucide-react";

import { useCancelLoan, useLoans } from "@/api/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoanStatusBadge } from "@/components/status-badge";
import { loanStatusToLabel } from "@/lib/status";
import { formatDateTime } from "@/lib/datetime";

const statusOptions = [
  { value: "all", label: "Semua" },
  { value: "0", label: loanStatusToLabel(0) },
  { value: "1", label: loanStatusToLabel(1) },
  { value: "2", label: loanStatusToLabel(2) },
  { value: "3", label: loanStatusToLabel(3) },
];

export function LoansPage() {
  const loans = useLoans();
  const cancel = useCancelLoan();
  const loansErrorStatus = (loans.error as any)?.response?.status;

  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("all");

  const filtered = React.useMemo(() => {
    const data = loans.data ?? [];
    const needle = q.trim().toLowerCase();
    return data
      .filter((l) => {
        if (status === "all") return true;
        return String(l.status) === status;
      })
      .filter((l) => {
        if (!needle) return true;
        return (
          l.roomCode.toLowerCase().includes(needle) ||
          l.roomName.toLowerCase().includes(needle) ||
          l.namaPeminjam.toLowerCase().includes(needle) ||
          l.nrp.toLowerCase().includes(needle)
        );
      });
  }, [loans.data, q, status]);

  async function handleCancel(id: string) {
    const ok = window.confirm("Batalkan peminjaman ini? (status akan jadi dibatalkan)");
    if (!ok) return;
    try {
      await cancel.mutateAsync(id);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.response?.data || e?.message || "Gagal cancel";
      window.alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Peminjaman</h1>
        <p className="text-sm text-muted-foreground">Daftar seluruh peminjaman ruangan + status & aksi.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Cari</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ruang / nama / nrp" />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end text-sm text-muted-foreground">
              Total: <span className="ml-2 font-medium text-foreground">{filtered.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar peminjaman</CardTitle>
        </CardHeader>
        <CardContent>
          {loans.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : loans.isError ? (
            <div className="text-sm text-destructive">
              {loansErrorStatus === 401
                ? "Gagal memuat loans: sesi belum login / token tidak valid."
                : "Gagal memuat loans."}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">Tidak ada data.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Peminjam</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <div className="font-medium">{l.roomCode}</div>
                      <div className="text-xs text-muted-foreground">{l.roomName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{l.namaPeminjam}</div>
                      <div className="text-xs text-muted-foreground">NRP: {l.nrp}</div>
                    </TableCell>
                    <TableCell>{formatDateTime(l.startTime)}</TableCell>
                    <TableCell>{formatDateTime(l.endTime)}</TableCell>
                    <TableCell>
                      <LoanStatusBadge status={l.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/loans/${l.id}`}>
                            <Eye className="h-4 w-4" />
                            Detail
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancel(l.id)}
                          disabled={l.status === 2 || l.status === 3}
                          title={l.status === 2 || l.status === 3 ? "Loan sudah final" : "Cancel"}
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
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
