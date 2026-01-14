export const AUTH_PROTO_PACKAGE = 'auth';
export const AUTH_SERVICE_NAME = 'AuthService';

export interface ValidateTokenRequest {
  accessToken: string;
}

export interface ValidateTokenResponse {
  isValid: boolean;
  userId: string;
  role: string;
}
