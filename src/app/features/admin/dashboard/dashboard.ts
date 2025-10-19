import { Component } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { Observable } from 'rxjs';
import { Product } from '../../../shared/models/product.model/product.model';
import { RouterLink } from "@angular/router";
import { AsyncPipe as asyncPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [ RouterLink, asyncPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  products$!: Observable<Product[]>;
  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.products$ = this.productService.getProducts();
  }

  totalQuantity(products: Product[]): number {
    return products.reduce((total, product) => total + product.quantity, 0);
  }

  totalCost(products: Product[]): number {
    return products.reduce((total, product) => total + product.price * product.quantity, 0);
  }

  lowStockProducts(products: Product[], threshold: number = 10): Product[]  {
    return products.filter(p => p.quantity < threshold);
  }
 
}
