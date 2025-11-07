import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../../shared/models/product.model/product.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) { }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`);
  }

  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, order);
  }

  updateOrder(id: number, order: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/orders/${id}`, order);
  }

  cancelOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/orders/${id}`);
  }

  viewDetails(order: Order): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${order.id}`);
  }

  processOrder(order: Order): Observable<Order> {
    const updatedOrder = { ...order, status: 'Processed' };
    return this.http.put<Order>(`${this.apiUrl}/orders/${order.id}`, updatedOrder);
  }
  
}
