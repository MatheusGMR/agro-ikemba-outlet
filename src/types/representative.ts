export interface Representative {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  commission_percentage: number;
  region?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface RepClient {
  id: string;
  representative_id: string;
  company_name: string;
  cnpj_cpf?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  state_registration?: string;
  credit_limit: number;
  payment_terms?: string;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  representative_id: string;
  client_id: string;
  title: string;
  description?: string;
  stage: 'com_oportunidade' | 'proposta_apresentada' | 'em_negociacao' | 'em_aprovacao' | 'em_entrega';
  estimated_value: number;
  estimated_commission: number;
  probability: number;
  expected_close_date?: string;
  next_action?: string;
  next_action_date?: string;
  status: 'active' | 'paused' | 'closed';
  created_at: string;
  updated_at: string;
  client?: RepClient;
  items?: OpportunityItem[];
}

export interface OpportunityItem {
  id: string;
  opportunity_id: string;
  product_sku: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  commission_unit: number;
  total_commission: number;
  created_at: string;
}

export interface Proposal {
  id: string;
  opportunity_id: string;
  proposal_number: string;
  total_value: number;
  total_commission: number;
  shipping_cost: number;
  payment_terms?: string;
  delivery_terms?: string;
  validity_date: string;
  observations?: string;
  status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired';
  client_approved_at?: string;
  client_comments?: string;
  created_at: string;
  updated_at: string;
  opportunity?: Opportunity;
}

export interface SalesOrder {
  id: string;
  proposal_id: string;
  order_number: string;
  client_id: string;
  representative_id: string;
  total_value: number;
  total_commission: number;
  status: 'pending_invoice' | 'invoiced' | 'shipped' | 'delivered' | 'cancelled';
  invoice_date?: string;
  expected_delivery?: string;
  actual_delivery?: string;
  tracking_code?: string;
  created_at: string;
  updated_at: string;
  client?: RepClient;
  proposal?: Proposal;
}

export interface Commission {
  id: string;
  representative_id: string;
  order_id?: string;
  commission_amount: number;
  commission_percentage: number;
  base_value: number;
  status: 'pending' | 'invoiced' | 'paid';
  due_date?: string;
  paid_date?: string;
  created_at: string;
  updated_at: string;
  order?: SalesOrder;
}

export interface RepActivity {
  id: string;
  representative_id: string;
  client_id?: string;
  opportunity_id?: string;
  activity_type: 'call' | 'email' | 'whatsapp' | 'visit' | 'note' | 'task';
  title: string;
  description?: string;
  completed: boolean;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  client?: RepClient;
  opportunity?: Opportunity;
}

export interface RepNotification {
  id: string;
  representative_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link?: string;
  created_at: string;
}

export interface RepDashboardStats {
  potential_commission: number;
  active_opportunities: number;
  pending_proposals: number;
  total_commission_this_month: number;
  pipeline_stages: {
    stage: string;
    count: number;
    value: number;
  }[];
  top_opportunities: Opportunity[];
  recent_activities: RepActivity[];
  pending_notifications: RepNotification[];
}

export interface PipelineStage {
  key: string;
  label: string;
  probability: number;
  color: string;
}