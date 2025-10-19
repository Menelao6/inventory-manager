import { Component } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { Observable } from 'rxjs';
import { Product } from '../../../shared/models/product.model/product.model';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  products$!: Observable<Product[]>;
  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.products$ = this.productService.getProducts();
  }
}

/*constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getProducts().subscribe(data => {
      console.log(data);
    });
  } */