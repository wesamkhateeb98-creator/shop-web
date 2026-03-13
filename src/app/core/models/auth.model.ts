export interface SigninRequest {
  phoneNumber: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  phoneNumber: string;
  password: string;
}

export enum Role {
  Customer = 0,
  Admin = 1,
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  id: number;
  role: Role;
}
