
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