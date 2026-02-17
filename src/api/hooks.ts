import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelLoan,
  changeLoanStatus,
  createLoan,
  createRoom,
  dbPing,
  deleteRoom,
  getLoan,
  getLoanHistory,
  getRoomsAvailability,
  getSystemStatus,
  listLoans,
  listRooms,
  updateRoom,
} from "@/api/paras";
import type { ChangeLoanStatusRequest, CreateLoanRequest, CreateRoomRequest, UpdateRoomRequest } from "@/api/types";

export const qk = {
  system: ["system"],
  db: ["db"],
  rooms: ["rooms"],
  roomAvailability: (start: string, end: string) => ["roomAvailability", start, end],
  loans: ["loans"],
  loan: (id: string) => ["loan", id],
  loanHistory: (id: string) => ["loanHistory", id],
};

export function useSystemStatus() {
  return useQuery({ queryKey: qk.system, queryFn: getSystemStatus, staleTime: 10_000 });
}

export function useDbPing() {
  return useQuery({ queryKey: qk.db, queryFn: dbPing, staleTime: 10_000 });
}

export function useRooms() {
  return useQuery({ queryKey: qk.rooms, queryFn: listRooms });
}

export function useLoans() {
  return useQuery({ queryKey: qk.loans, queryFn: listLoans });
}

export function useLoan(id: string) {
  return useQuery({ queryKey: qk.loan(id), queryFn: () => getLoan(id), enabled: !!id });
}

export function useLoanHistory(id: string) {
  return useQuery({ queryKey: qk.loanHistory(id), queryFn: () => getLoanHistory(id), enabled: !!id });
}

export function useRoomAvailability(start: string, end: string, enabled: boolean) {
  return useQuery({
    queryKey: qk.roomAvailability(start, end),
    queryFn: () => getRoomsAvailability(start, end),
    enabled,
  });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRoomRequest) => createRoom(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.rooms }),
  });
}

export function useUpdateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRoomRequest }) => updateRoom(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.rooms }),
  });
}

export function useDeleteRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRoom(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.rooms }),
  });
}

export function useCreateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLoanRequest) => createLoan(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.loans });
      qc.invalidateQueries({ queryKey: qk.rooms });
    },
  });
}

export function useCancelLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelLoan(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.loans }),
  });
}

export function useChangeLoanStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ChangeLoanStatusRequest }) => changeLoanStatus(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: qk.loans });
      qc.invalidateQueries({ queryKey: qk.loan(vars.id) });
      qc.invalidateQueries({ queryKey: qk.loanHistory(vars.id) });
    },
  });
}
