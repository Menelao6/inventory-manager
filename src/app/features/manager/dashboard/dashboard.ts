import { Component } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { Observable, map } from 'rxjs';
import { Order, Product } from '../../../shared/models/product.model/product.model';
import { AsyncPipe, CurrencyPipe, DatePipe, CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, CurrencyPipe, DatePipe, ReactiveFormsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  orders$!: Observable<Order[]>;
  products$!: Observable<Order[]>;
  productsList: Product[] = [];
  form!: FormGroup;
  
  // Modal states
  showSellModal = false;
  showViewModal = false;
  showCancelModal = false;
  
  // Selected items
  selectedOrder: Order | null = null;
  orderToCancel: number | null = null;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private productService: ProductService
  ) {
    this.form = this.fb.group({
      productId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    this.loadOrders();
    this.loadProducts();
  }

  private loadOrders() {
    this.orders$ = this.orderService.getOrders().pipe(
      map(orders => [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)))
    );
  }

  private loadProducts() {
    this.productService.getProducts().subscribe(products => {
      this.productsList = products;
      console.log('Products loaded:', this.productsList);
    });
  }

  // Sell Modal Functions
  openSellModal() {
    this.form.reset({ productId: null, quantity: 1 });
    this.showSellModal = true;
  }

  closeSellModal() {
    this.showSellModal = false;
    this.form.reset();
  }

  get selectedProduct(): Product | undefined {
    const productId = this.form.value.productId;
    return this.productsList.find(p => p.id === productId);
  }

  calculateTotal(): number {
    const product = this.selectedProduct;
    const quantity = this.form.value.quantity || 0;
    return product ? product.price * quantity : 0;
  }

 sellProducts() {
  if (this.form.invalid) {
    console.log('Form invalid:', this.form.value);
    return;
  }

  const rawProductId = this.form.get('productId')?.value;
  const rawQuantity = this.form.get('quantity')?.value;

  const productId = Number(rawProductId);
  const quantity = Number(rawQuantity);

  console.log('Form value:', this.form.value);
  console.log('Parsed productId, quantity:', productId, quantity);
  console.log('productsList:', this.productsList);
  console.log(
    'productsList ids:',
    this.productsList.map(p => [p.id, typeof p.id])
  );

  if (!productId || isNaN(productId)) {
    alert('Please select a product.');
    return;
  }

  const product = this.productsList.find(p => Number(p.id) === productId);

  if (!product) {
    alert('Selected product not found.');
    return;
  }

  if (quantity > product.quantity) {
    alert('Insufficient stock for the requested quantity.');
    return;
  }

  const order: Order = {
    id: 0, // JSON Server will assign
    productId: product.id,
    productName: product.name,
    quantity,
    unitPrice: product.price,
    total: product.price * quantity,
    status: 'pending',
    createdAt: new Date().toISOString(),
    customer: 'Walk-in Customer'
  };

  const newQty = product.quantity - quantity;

  this.orderService.createOrder(order).subscribe({
    next: () => {
      this.productService.updateProduct(product.id, {
        quantity: newQty,
        status: this.computeStatus(newQty)
      }).subscribe({
        next: () => {
          console.log('Order created and product stock updated successfully');
          this.loadOrders();
          this.loadProducts();
          this.closeSellModal();
        },
        error: (err) => {
          console.error('Error updating product stock:', err);
          alert('Order created but failed to update product stock. Please check inventory.');
        }
      });
    },
    error: (err) => {
      console.error('Error creating order:', err);
      alert('Failed to create order. Please try again.');
    }
  });
}


  viewDetails(order: Order) {
    this.selectedOrder = order;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedOrder = null;
  }

  cancelOrder(id: number) {
    this.orderToCancel = id;
    this.showCancelModal = true;
  }

  confirmCancel() {
    if (this.orderToCancel === null) return;

    this.orderService.cancelOrder(this.orderToCancel).subscribe({
      next: () => {
        console.log(`Order ${this.orderToCancel} cancelled successfully`);
        this.loadOrders();
        this.showCancelModal = false;
        this.orderToCancel = null;
      },
      error: (err) => {
        console.error('Error cancelling order:', err);
        alert('Failed to cancel order. Please try again.');
        this.showCancelModal = false;
      }
    });
  }

  processOrder(order: Order) {
    this.orderService.processOrder(order).subscribe({
      next: () => {
        console.log('Order processed successfully');
        this.loadOrders();
      },
      error: (err) => {
        console.error('Error processing order:', err);
        alert('Failed to process order. Please try again.');
      }
    });
  }

  private computeStatus(qty: number): 'in-stock' | 'low-stock' | 'out-of-stock' {
    if (qty <= 0) return 'out-of-stock';
    if (qty < 10) return 'low-stock';
    return 'in-stock';
  }
}