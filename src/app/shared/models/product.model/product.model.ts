export interface Product {
  id: number;
  name: string;
  imageUrl: string;
  category: string;
  price: number;
  quantity: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  description?: string;
  updatedAt?: Date;
}