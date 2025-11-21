import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../../shared/models/product.model/product.model';

@Injectable({
  providedIn: 'root'
})
export class GenerateOrderId {

    orders$!: Observable<Order[]>;
  

  private generateOrderId(orders: Order[]): string {
      if (!orders || orders.length === 0) return 'ord008';
      const ids = orders
        .map(o => {
          if (typeof o.id === 'string' && o.id.startsWith('ord')) {
            return parseInt(o.id.slice(3), 10);
          }
          return parseInt(o.id as any, 10);
        })
        .filter((n): n is number => !isNaN(n));
      const maxId = ids.length > 0 ? Math.max(...ids) : 7;
      const nextId = maxId + 1;
      return `ord${nextId.toString().padStart(3, '0')}`;
    }

    public getNewOrderId(orders: Order[]): string {
        return this.generateOrderId(orders);
    }
}
