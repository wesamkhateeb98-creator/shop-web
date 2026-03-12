export interface SigninRequest {
  phoneNumber: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  phoneNumber: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
}
