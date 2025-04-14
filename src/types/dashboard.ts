
export type OrderStatus = 'pending' | 'processing' | 'delivered';

export interface Order {
  id: string;
  product: string;
  date: string;
  status: OrderStatus;
  amount: string;
}

export interface Product {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  rating: number;
  image: string;
  price: string;
}
