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

export interface Order {
  id: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: 'pending' | 'dispached' | 'cancelled';
  createdAt: string;
  customer?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}