import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { useAuth } from "@/auth/auth-context";
import type { RoomResponse } from "@/api/types";
import { useCreateRoom, useDeleteRoom, useRooms, useUpdateRoom } from "@/api/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const roomSchema = z.object({
  code: z.string().min(1, "Code wajib diisi"),
  name: z.string().min(1, "Name wajib diisi"),
  location: z.string().optional().nullable(),
  capacity: z.coerce.number().int().min(1, "Capacity minimal 1"),
  facilities: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

type RoomFormValues = z.infer<typeof roomSchema>;

function RoomFormDialog({
  mode,
  initial,
  onSubmit,
  trigger,
}: {
  mode: "create" | "edit";
  initial?: RoomResponse;
  onSubmit: (values: RoomFormValues) => Promise<void>;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: initial
      ? {
          code: initial.code,
          name: initial.name,
          location: initial.location ?? "",
          capacity: initial.capacity,
          facilities: initial.facilities ?? "",
          isActive: initial.isActive,
        }
      : {
          code: "",
          name: "",
          location: "",
          capacity: 1,
          facilities: "",
          isActive: true,
        },
  });

  React.useEffect(() => {
    if (!open) return;
    setServerError(null);
    if (initial) {
      form.reset({
        code: initial.code,
        name: initial.name,
        location: initial.location ?? "",
        capacity: initial.capacity,
        facilities: initial.facilities ?? "",
        isActive: initial.isActive,
      });
    } else {
      form.reset({ code: "", name: "", location: "", capacity: 1, facilities: "", isActive: true });
    }
  }, [open, initial, form]);

  async function handleSubmit(values: RoomFormValues) {
    try {
      setServerError(null);
      await onSubmit(values);
      setOpen(false);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.response?.data || e?.message || "Gagal";
      setServerError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create room" : "Edit room"}</DialogTitle>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="code">Code</Label>
            <Input id="code" placeholder="R-101" {...form.register("code")} />
            {form.formState.errors.code && (
              <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Ruang Meeting" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="Gedung A - Lantai 2" {...form.register("location")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input id="capacity" type="number" min={1} {...form.register("capacity")} />
            {form.formState.errors.capacity && (
              <p className="text-sm text-destructive">{form.formState.errors.capacity.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="facilities">Facilities</Label>
            <Input id="facilities" placeholder="Projector, Whiteboard" {...form.register("facilities")} />
          </div>

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RoomsPage() {
  const { isAdmin } = useAuth();
  const rooms = useRooms();
  const create = useCreateRoom();
  const update = useUpdateRoom();
  const del = useDeleteRoom();

  const sorted = React.useMemo(() => {
    return (rooms.data ?? []).slice().sort((a, b) => a.code.localeCompare(b.code));
  }, [rooms.data]);

  async function handleCreate(values: RoomFormValues) {
    await create.mutateAsync({
      code: values.code.trim(),
      name: values.name.trim(),
      location: values.location?.trim() || null,
      capacity: values.capacity,
      facilities: values.facilities?.trim() || null,
    });
  }

  async function handleUpdate(room: RoomResponse, values: RoomFormValues) {
    await update.mutateAsync({
      id: room.id,
      payload: {
        code: values.code.trim(),
        name: values.name.trim(),
        location: values.location?.trim() || null,
        capacity: values.capacity,
        facilities: values.facilities?.trim() || null,
        isActive: room.isActive,
      },
    });
  }

  async function handleDelete(room: RoomResponse) {
    const ok = window.confirm(`Hapus ruangan ${room.code}?`);
    if (!ok) return;
    await del.mutateAsync(room.id);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Ruangan</h1>
          {isAdmin && (
            <RoomFormDialog
              mode="create"
              onSubmit={handleCreate}
              trigger={
                <Button>
                  <Plus className="h-4 w-4" />
                  Tambah ruangan
                </Button>
              }
            />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? "Kelola data ruangan (aktif/nonaktif) dan informasi dasar."
            : "Lihat data ruangan dan informasi kapasitas/fasilitas."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar ruangan</CardTitle>
        </CardHeader>
        <CardContent>
          {rooms.isLoading ? (
            <div className="text-sm text-muted-foreground">Memuat...</div>
          ) : rooms.isError ? (
            <div className="text-sm text-destructive">Gagal memuat data ruangan.</div>
          ) : sorted.length === 0 ? (
            <div className="text-sm text-muted-foreground">Belum ada ruangan. Klik “Tambah ruangan”.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.code}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell className="text-muted-foreground">{r.location ?? "-"}</TableCell>
                    <TableCell className="text-right">{r.capacity}</TableCell>
                    <TableCell>
                      {r.isActive ? <Badge variant="success">active</Badge> : <Badge variant="muted">inactive</Badge>}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <RoomFormDialog
                            mode="edit"
                            initial={r}
                            onSubmit={(values) => handleUpdate(r, values)}
                            trigger={
                              <Button variant="outline" size="sm">
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Button>
                            }
                          />
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(r)}>
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    )}
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
