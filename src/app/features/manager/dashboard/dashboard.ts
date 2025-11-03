import { Component } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { Observable } from 'rxjs';
import { Order } from '../../../shared/models/product.model/product.model';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  orders$!: Observable<Order[]>;
  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.orders$ = this.orderService.getOrders();
  }

  createOrder(order: Order) {
    this.orderService.createOrder(order).subscribe();
  }

  updateOrder(id: number, order: Partial<Order>) {
    this.orderService.updateOrder(id, order).subscribe();
  }

  deleteOrder(id: number) {
    this.orderService.deleteOrder(id).subscribe();
  }

}
