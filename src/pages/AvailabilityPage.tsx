import { useMemo, useState } from "react";
import { CalendarSearch, DoorOpen, Search } from "lucide-react";

import { useCreateLoan, useRoomAvailability, useRooms } from "@/api/hooks";
import type { RoomAvailabilityResponse, RoomResponse } from "@/api/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

type RoomLike = Pick<RoomResponse, "id" | "code" | "name" | "capacity" | "location"> & {
  facilities?: string | null;
  isActive?: boolean;
};


/** parse value "YYYY-MM-DDTHH:mm" menjadi Date lokal (bukan UTC) */
function parseLocalDateTime(value: string): Date | null {
  if (!value) return null;
  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return null;

  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  if ([y, m, d, hh, mm].some((n) => Number.isNaN(n))) return null;

  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

/** format Date lokal -> "YYYY-MM-DDTHH:mm:00" (tanpa Z) agar backend kamu tidak salah timezone */
function toLocalIsoNoZ(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:00`;
}

/** default string untuk input datetime-local */
function defaultLocalInput(minutesFromNow: number) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutesFromNow);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function validateBooking(start: Date, end: Date, now: Date) {
  const errors: string[] = [];

  // validasi waktu dasar
  if (!(start instanceof Date) || isNaN(start.getTime())) errors.push("StartTime tidak valid.");
  if (!(end instanceof Date) || isNaN(end.getTime())) errors.push("EndTime tidak valid.");
  if (errors.length) return errors;

  if (start >= end) errors.push("StartTime harus lebih awal dari EndTime.");

  const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
  if (durationMinutes > 240) errors.push("Durasi maksimal 240 menit.");

  const minStart = new Date(now.getTime() + 10 * 60000);
  if (start < minStart) errors.push("StartTime minimal 10 menit dari sekarang.");

  // jam operasional: 07:00 - 20:00 (local time)
  const toHHMM = (d: Date) => d.getHours() * 60 + d.getMinutes();
  const startM = toHHMM(start);
  const endM = toHHMM(end);
  const open = 7 * 60;
  const close = 20 * 60;

  if (startM < open || endM > close) errors.push("Booking hanya boleh antara 07:00 - 20:00.");

  return errors;
}

export default function AvailabilityPage() {
  // input form (belum tentu akan dipakai query)
  const [startInput, setStartInput] = useState(() => defaultLocalInput(15));
  const [endInput, setEndInput] = useState(() => defaultLocalInput(75));

  // state query (dipakai fetch availability setelah klik Cari)
  const [submitted, setSubmitted] = useState(false);
  const [clientErrors, setClientErrors] = useState<string[]>([]);
  const [qStart, setQStart] = useState<string>("");
  const [qEnd, setQEnd] = useState<string>("");

  const roomsQ = useRooms();
  const availableQ = useRoomAvailability(qStart, qEnd, submitted);


  const allRooms: RoomResponse[] = roomsQ.data ?? [];
  const availableRooms: RoomAvailabilityResponse[] = availableQ.data ?? [];

  const roomsById = useMemo(() => {
    const map = new Map<string, RoomResponse>();
    allRooms.forEach((r) => map.set(r.id, r));
    return map;
  }, [allRooms]);

  const onSearch = () => {
    // validasi sisi UI hanya muncul setelah tombol Cari ditekan
    const now = new Date();

    const start = parseLocalDateTime(startInput);
    const end = parseLocalDateTime(endInput);

    const errors: string[] = [];
    if (!start) errors.push("StartTime tidak valid.");
    if (!end) errors.push("EndTime tidak valid.");

    if (start && end) {
      errors.push(...validateBooking(start, end, now));
    }

    setClientErrors(errors);

    if (errors.length > 0) {
      setSubmitted(false);
      return;
    }

    // lolos validasi => set query untuk fetch ke backend
    setQStart(toLocalIsoNoZ(start!));
    setQEnd(toLocalIsoNoZ(end!));
    setSubmitted(true);
  };

  // supaya BookDialog pakai range yang sedang dicari (bukan range input yg mungkin sudah berubah)
  const qStartDate = qStart ? parseLocalDateTime(qStart.slice(0, 16)) : null; // ambil "YYYY-MM-DDTHH:mm"
  const qEndDate = qEnd ? parseLocalDateTime(qEnd.slice(0, 16)) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Ketersediaan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cari ruangan yang tersedia pada rentang waktu tertentu, lalu ajukan peminjaman.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarSearch className="h-5 w-5" />
            Cari ruangan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* form */}
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div>
              <div className="mb-1 text-sm font-medium">Start</div>
              <Input
                type="datetime-local"
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
                className="h-11"
              />
            </div>
            <div>
              <div className="mb-1 text-sm font-medium">End</div>
              <Input
                type="datetime-local"
                value={endInput}
                onChange={(e) => setEndInput(e.target.value)}
                className="h-11"
              />
            </div>
            <Button className="h-11" onClick={onSearch}>
              <Search className="mr-2 h-4 w-4" />
              Cari
            </Button>
          </div>

          {/* errors: UI (muncul setelah klik Cari) */}
          {clientErrors.length > 0 && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
              <div className="mb-2 font-semibold text-destructive">Periksa input:</div>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {clientErrors.map((e, idx) => (
                  <li key={idx}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {/* errors: backend */}
          {availableQ.isError && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
              <div className="mb-1 font-semibold text-destructive">Gagal mencari ketersediaan</div>
              <div className="text-muted-foreground">
                {(availableQ.error as Error).message}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catatan rules</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc space-y-1 pl-5">
            <li>Durasi maksimal 240 menit (4 jam).</li>
            <li>StartTime minimal 10 menit dari sekarang.</li>
            <li>Booking hanya boleh antara 07:00 – 20:00.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hasil pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          {!submitted ? (
            <div className="text-sm text-muted-foreground">Pilih waktu lalu tekan Cari.</div>
          ) : availableQ.isLoading ? (
            <div className="text-sm text-muted-foreground">Memuat data...</div>
          ) : availableRooms.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Tidak ada ruangan yang available pada rentang waktu tersebut.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {availableRooms.map((r) => {
                const full =
                  roomsById.get(r.id) ??
                  ({
                    id: r.id,
                    code: r.code,
                    name: r.name,
                    location: r.location ?? null,
                    capacity: r.capacity,
                    facilities: r.facilities ?? null,
                    isActive: true,
                  } as RoomLike);

                return (
                  <div key={r.id} className="rounded-xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">
                          {full.code} · {full.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {full.location ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Kapasitas: {full.capacity}
                        </div>
                      </div>

                      <BookDialog
                        room={full}
                        start={qStartDate ?? parseLocalDateTime(startInput)!}
                        end={qEndDate ?? parseLocalDateTime(endInput)!}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BookDialog({ room, start, end }: { room: RoomLike; start: Date; end: Date }) {
  const createLoan = useCreateLoan();
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);

  const onSubmit = async () => {
    try {
      await createLoan.mutateAsync({
        roomId: room.id,
        startTime: toLocalIsoNoZ(start),
        endTime: toLocalIsoNoZ(end),
        notes: notes.trim() ? notes : null,
      });
    } catch {
      return;
    }

    setOpen(false);
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <DoorOpen className="mr-2 h-4 w-4" />
          Ajukan
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajukan peminjaman</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border p-3 text-sm">
            <div className="font-medium">
              {room.code} · {room.name}
            </div>
            <div className="text-xs text-muted-foreground">{room.location ?? "-"}</div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
              Identitas peminjam otomatis diambil dari akun login (NRP dan nama user backend).
            </div>
            <div>
              <div className="mb-1 text-sm font-medium">Catatan</div>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Opsional"
              />
            </div>
          </div>

          {createLoan.isError && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm">
              <div className="font-semibold text-destructive">Gagal mengajukan</div>
              <div className="text-muted-foreground">{(createLoan.error as Error).message}</div>
            </div>
          )}

          <Separator />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={onSubmit}
              disabled={createLoan.isPending}
            >
              {createLoan.isPending ? "Mengirim..." : "Kirim"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
