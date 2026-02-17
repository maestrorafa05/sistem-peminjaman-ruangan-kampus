import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

import type { LoanResponse } from "@/api/types";
import { useChangeLoanStatus, useLoans } from "@/api/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoanStatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/datetime";

const actionSchema = z.object({
  comment: z.string().optional().nullable(),
});

type ActionValues = z.infer<typeof actionSchema>;

function ActionDialog({ loan, action }: { loan: LoanResponse; action: "approve" | "reject" }) {
  const [open, setOpen] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const mutate = useChangeLoanStatus();

  const form = useForm<ActionValues>({
    resolver: zodResolver(actionSchema),
    defaultValues: { comment: "" },
  });

  async function submit(values: ActionValues) {
    const toStatus = action === "approve" ? 1 : 2;
    try {
      setServerError(null);
      await mutate.mutateAsync({
        id: loan.id,
        payload: {
          toStatus,
          comment: values.comment?.trim() || null,
        },
      });
      setOpen(false);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.response?.data || e?.message || "Gagal";
      setServerError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={action === "approve" ? "default" : "destructive"} size="sm">
          {action === "approve" ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Approve
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4" /> Reject
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action === "approve" ? "Approve loan" : "Reject loan"}</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border p-3 text-sm">
          <div className="font-medium">
            {loan.roomCode} — {loan.roomName}
          </div>
          <div className="text-muted-foreground">
            {loan.namaPeminjam} (NRP: {loan.nrp})
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-muted-foreground">Start</div>
              <div className="font-medium">{formatDateTime(loan.startTime)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">End</div>
              <div className="font-medium">{formatDateTime(loan.endTime)}</div>
            </div>
          </div>
        </div>

        <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
          <div className="grid gap-2">
            <Label>Comment</Label>
            <Textarea rows={3} placeholder="optional" {...form.register("comment")} />
          </div>

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <DialogFooter>
            <Button type="submit" disabled={mutate.isPending}>
              {mutate.isPending ? "Saving..." : action === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminPage() {
  const loans = useLoans();

  const pending = React.useMemo(() => {
    return (loans.data ?? []).filter((l) => l.status === 0);
  }, [loans.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          <h1 className="text-2xl font-semibold">Admin</h1>
        </div>
        <p className="text-sm text-muted-foreground">Approve / Reject loan (pending).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pending loans</CardTitle>
        </CardHeader>
        <CardContent>
          {loans.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : loans.isError ? (
            <div className="text-sm text-destructive">Gagal load loans.</div>
          ) : pending.length === 0 ? (
            <div className="text-sm text-muted-foreground">Tidak ada loan pending.</div>
          ) : (
            <div className="space-y-3">
              {pending.map((l) => (
                <div key={l.id} className="rounded-xl border p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-base font-semibold">
                          {l.roomCode} — {l.roomName}
                        </div>
                        <LoanStatusBadge status={l.status} />
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {l.namaPeminjam} (NRP: {l.nrp})
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(l.startTime)} — {formatDateTime(l.endTime)}
                      </div>
                      {l.notes && <div className="mt-2 text-xs text-muted-foreground">Notes: {l.notes}</div>}
                    </div>

                    <div className="flex gap-2">
                      <ActionDialog loan={l} action="approve" />
                      <ActionDialog loan={l} action="reject" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
