
export interface PendingUser {
  id: string;
  name: string;
  email: string;
  tipo: string;
  conheceu?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface AdminStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalUsers: number;
}
