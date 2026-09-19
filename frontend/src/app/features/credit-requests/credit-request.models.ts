export type CreditRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type CreditRequest = {
  id: string;
  applicantDocument: string;
  amount: string;
  termMonths: number;
  status: CreditRequestStatus;
  decisionComment: string | null;
  createdById: string;
  decidedById: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreditRequestListResponse = {
  data: CreditRequest[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};