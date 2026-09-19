export type ApiErrorBody = {
  statusCode: number;
  error: string;
  message: string;
  details?: string[];
};