import { Component } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { Observable, map } from 'rxjs';
import { Order } from '../../../shared/models/product.model/product.model';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, CurrencyPipe, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  orders$!: Observable<Order[]>;
  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.orders$ = this.orderService.getOrders().pipe(
      map(orders => [...orders].sort((a,b) => +new Date(b.date) - +new Date(a.date)))
    )
  }

  createOrder(order: Order) {
    this.orderService.createOrder(order).subscribe();
  }

  updateOrder(id: number, order: Partial<Order>) {
    this.orderService.updateOrder(id, order).subscribe();
  }

  cancelOrder(id: number) {
    const confirmed = confirm('Are you sure you want to cancel this order? This action cannot be undone.');
    
    if (confirmed) {
      this.orderService.cancelOrder(id).subscribe({
        next: () => {
          console.log(`Order ${id} cancelled successfully`);
          this.orderService.cancelOrder;
          this.refresh();
        },
        error: (err) => {
          console.error('Error cancelling order:', err);
          alert('Failed to cancel order. Please try again.');
        }
      });
    }
  }

  viewDetails(order: Order) {
    this.orderService.viewDetails(order).subscribe();
  }

  processOrder(order: Order) {
    this.orderService.processOrder(order).subscribe();
    this.refresh();
  }

  private refresh() {
    this.orders$ = this.orderService.getOrders();
  }
}
