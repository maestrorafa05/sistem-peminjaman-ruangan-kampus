export type Guid = string;

export type LoanStatus = 0 | 1 | 2 | 3;
export type AppRole = "Admin" | "User" | (string & {});

export interface LoginRequest {
  nrp: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresInMinutes: number;
  userId: string;
  nrp: string;
  fullName?: string | null;
  roles: string[];
}

export interface MeResponse {
  userId: string;
  nrp: string;
  fullName?: string | null;
  roles: string[];
}

export interface RoomResponse {
  id: Guid;
  code: string;
  name: string;
  location?: string | null;
  capacity: number;
  facilities?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomRequest {
  code: string;
  name: string;
  location?: string | null;
  capacity: number;
  facilities?: string | null;
}

export interface UpdateRoomRequest {
  code: string;
  name: string;
  location?: string | null;
  capacity: number;
  facilities?: string | null;
  isActive: boolean;
}

export interface LoanResponse {
  id: Guid;
  roomId: Guid;
  roomCode: string;
  roomName: string;
  namaPeminjam: string;
  nrp: string;
  startTime: string;
  endTime: string;
  status: LoanStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanRequest {
  roomId: Guid;
  startTime: string; // DateTime string
  endTime: string; // DateTime string
  notes?: string | null;
}

export interface ChangeLoanStatusRequest {
  toStatus: LoanStatus;
  comment?: string | null;
}

export interface LoanStatusHistoryResponse {
  id: Guid;
  loanId: Guid;
  fromStatus: LoanStatus;
  toStatus: LoanStatus;
  changedBy?: string | null;
  comment?: string | null;
  changedAt: string;
}

export interface RoomAvailabilityResponse {
  id: Guid;
  code: string;
  name: string;
  location?: string | null;
  capacity: number;
  facilities?: string | null;
}
