export type AuthUser = {
  id: string;
  email: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AuthUser;
};

export type ApiErrorBody = {
  statusCode: number;
  error: string;
  message: string;
  details?: string[];
};