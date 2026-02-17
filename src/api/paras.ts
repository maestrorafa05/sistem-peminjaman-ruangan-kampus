import { api } from "@/api/client";
import type {
  ChangeLoanStatusRequest,
  CreateLoanRequest,
  CreateRoomRequest,
  LoginRequest,
  LoginResponse,
  MeResponse,
  LoanResponse,
  LoanStatusHistoryResponse,
  RoomAvailabilityResponse,
  RoomResponse,
  UpdateRoomRequest,
} from "@/api/types";

export async function getSystemStatus() {
  const { data } = await api.get("/");
  return data as { service: string; status: string };
}

export async function dbPing() {
  const { data } = await api.get("/db-ping");
  return data as { canConnect: boolean };
}

export async function login(payload: LoginRequest) {
  const { data } = await api.post("/auth/login", {
    Nrp: payload.nrp,
    Password: payload.password,
  });

  return {
    accessToken: data.accessToken,
    tokenType: data.tokenType,
    expiresInMinutes: data.expiresInMinutes,
    userId: data.userId,
    nrp: data.nrp,
    fullName: data.fullName,
    roles: data.roles,
  } as LoginResponse;
}

export async function me() {
  const { data } = await api.get("/auth/me");

  return {
    userId: String(data.userId),
    nrp: data.nrp,
    fullName: data.fullName,
    roles: Array.isArray(data.roles) ? data.roles : [],
  } as MeResponse;
}

// Rooms
export async function listRooms() {
  const { data } = await api.get("/rooms");
  return data as RoomResponse[];
}

export async function createRoom(payload: CreateRoomRequest) {
  const { data } = await api.post("/rooms", payload);
  return data as RoomResponse;
}

export async function updateRoom(id: string, payload: UpdateRoomRequest) {
  const { data } = await api.put(`/rooms/${id}`, payload);
  return data as RoomResponse;
}

export async function deleteRoom(id: string) {
  await api.delete(`/rooms/${id}`);
}

export async function getRoom(id: string) {
  const { data } = await api.get(`/rooms/${id}`);
  return data as RoomResponse;
}

export async function getRoomsAvailability(start: string, end: string) {
  const { data } = await api.get("/rooms/available", { params: { start, end } });
  return data as RoomAvailabilityResponse[];
}

// Loans
export async function listLoans() {
  const { data } = await api.get("/loans");
  return data as LoanResponse[];
}

export async function getLoan(id: string) {
  const { data } = await api.get(`/loans/${id}`);
  return data as LoanResponse;
}

export async function getLoanHistory(id: string) {
  const { data } = await api.get(`/loans/${id}/history`);
  return data as LoanStatusHistoryResponse[];
}

export async function createLoan(payload: CreateLoanRequest) {
  const { data } = await api.post("/loans", payload);
  return data as LoanResponse;
}

export async function cancelLoan(id: string) {
  await api.delete(`/loans/${id}`);
}

export async function changeLoanStatus(id: string, payload: ChangeLoanStatusRequest) {
  const { data } = await api.patch(`/loans/${id}/status`, payload);
  return data as { loanId: string; fromStatus: number; toStatus: number };
}
