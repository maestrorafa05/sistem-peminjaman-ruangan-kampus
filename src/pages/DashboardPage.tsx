import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, DoorOpen, HandCoins } from "lucide-react";

import { useAuth } from "@/auth/auth-context";
import { useLoans, useRooms } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoanStatusBadge } from "@/components/status-badge";

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const roomsQ = useRooms();
  const loansQ = useLoans();

  const rooms = roomsQ.data ?? [];
  const loans = loansQ.data ?? [];

  const roomsTotal = rooms.length;
  const roomsActive = rooms.filter((r) => r.isActive).length;

  const loansTotal = loans.length;
  const byStatus = {
    pending: loans.filter((l) => l.status === 0).length,
    approved: loans.filter((l) => l.status === 1).length,
    rejected: loans.filter((l) => l.status === 2).length,
    cancelled: loans.filter((l) => l.status === 3).length,
  };

  const latestLoans = [...loans]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Beranda</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan sistem PARAS & akses cepat untuk pengelolaan ruangan dan peminjaman.
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/availability">Cek ketersediaan</Link>
          </Button>
          <Button asChild>
            <Link to="/rooms">{isAdmin ? "Kelola ruangan" : "Lihat ruangan"}</Link>
          </Button>
        </div>
      </div>

      {/* Tentang PARAS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Tentang PARAS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <span className="font-medium">PARAS</span> adalah <span className="font-medium">Sistem Peminjaman Ruangan Kampus</span>{" "}
            berbasis web untuk membantu mahasiswa/dosen/staff melakukan booking ruangan secara rapi, terjadwal, dan terdokumentasi.
          </p>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border p-4">
              <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                <DoorOpen className="h-4 w-4" />
                Manajemen ruangan
              </div>
              <div className="text-xs text-muted-foreground">Tambah, ubah, nonaktifkan, dan kelola kapasitas/fasilitas.</div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                <HandCoins className="h-4 w-4" />
                Peminjaman & persetujuan
              </div>
              <div className="text-xs text-muted-foreground">Ajukan peminjaman, pantau status, dan approve/reject oleh admin.</div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                <ArrowRight className="h-4 w-4" />
                Cek ketersediaan
              </div>
              <div className="text-xs text-muted-foreground">Cari ruangan kosong pada rentang waktu tertentu sebelum booking.</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ringkasan angka */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total ruangan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{roomsTotal}</div>
            <div className="mt-1 text-xs text-muted-foreground">Aktif: {roomsActive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total peminjaman</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{loansTotal}</div>
            <div className="mt-1 text-xs text-muted-foreground">Semua status</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Menunggu persetujuan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{byStatus.pending}</div>
            <div className="mt-1 text-xs text-muted-foreground">Butuh action admin</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Status lainnya</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Disetujui</span>
              <span className="font-medium">{byStatus.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ditolak</span>
              <span className="font-medium">{byStatus.rejected}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Dibatalkan</span>
              <span className="font-medium">{byStatus.cancelled}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peminjaman terbaru */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Peminjaman terbaru</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link to="/loans">Buka daftar</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loansQ.isLoading ? (
            <div className="text-sm text-muted-foreground">Memuat data...</div>
          ) : latestLoans.length === 0 ? (
            <div className="text-sm text-muted-foreground">Belum ada data peminjaman.</div>
          ) : (
            <div className="space-y-3">
              {latestLoans.map((l) => (
                <div key={l.id} className="flex flex-col gap-2 rounded-xl border p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-medium">
                      {l.roomCode} · {l.roomName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {l.namaPeminjam} · {l.nrp}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <LoanStatusBadge status={l.status} />
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/loans?focus=${l.id}`}>Detail</Link>
                    </Button>
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
