export interface User {
  id: number;
  username: string;
  createdAt: string;
}

export interface LoginData {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  ipAddress?: string;
}

export interface ActivityLogData {
  action: string;
  details?: string;
  ipAddress?: string;
  userId?: number;
}

export interface ActivityLog {
  id: number;
  action: string;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  userId: number | null;
  timestamp: Date;
  user?: {
    username: string;
  } | null;
}