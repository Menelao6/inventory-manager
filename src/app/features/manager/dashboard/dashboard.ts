import { Component } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { Observable, map, take } from 'rxjs';
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
  
  showSellModal = false;
  showViewModal = false;
  showCancelModal = false;
  
  selectedOrder: Order | null = null;
  orderToCancel: string | null = null;

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
    });
  }

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

  sellProducts() {
    if (this.form.invalid) {
      return;
    }

    const rawProductId = this.form.get('productId')?.value;
    const rawQuantity = this.form.get('quantity')?.value;

    const productId = Number(rawProductId);
    const quantity = Number(rawQuantity);

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

    this.orders$.subscribe(currentOrders => {
      const newOrderId = this.generateOrderId(currentOrders);
      const order: Order = {
        id: newOrderId,
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

  cancelOrder(id: string) {
    this.orderToCancel = id;
    this.showCancelModal = true;
  }

  confirmCancel() {
    if (this.orderToCancel === null) return;

    // First retrieve the order details to know which product and quantity to restore
    this.orderService.getOrders().pipe(take(1)).subscribe({
      next: (orders) => {
        const order = orders.find(o => String(o.id) === this.orderToCancel);
        if (!order) {
          alert('Order not found');
          this.showCancelModal = false;
          this.orderToCancel = null;
          return;
        }

        const productId = order.productId;
        const qtyToRestore = order.quantity;

        // Cancel the order first
        this.orderService.cancelOrder(this.orderToCancel!).subscribe({
          next: () => {
            // Find product in cached list and update its quantity
            const product = this.productsList.find(p => p.id === productId);
            if (product) {
              const newQty = product.quantity + qtyToRestore;
              this.productService.updateProduct(productId, {
                quantity: newQty,
                status: this.computeStatus(newQty)
              }).subscribe({
                next: () => {
                  console.log(`Order ${this.orderToCancel} cancelled and product stock restored`);
                  this.loadOrders();
                  this.loadProducts();
                  this.showCancelModal = false;
                  this.orderToCancel = null;
                },
                error: (err) => {
                  console.error('Error updating product stock after cancel:', err);
                  alert('Order cancelled but failed to update product stock. Please check inventory.');
                  this.loadOrders();
                  this.showCancelModal = false;
                  this.orderToCancel = null;
                }
              });
            } else {
              // If product not in cache, still refresh orders and notify
              console.warn('Product not found in cache to restore quantity');
              this.loadOrders();
              this.loadProducts();
              this.showCancelModal = false;
              this.orderToCancel = null;
            }
          },
          error: (err) => {
            console.error('Error cancelling order:', err);
            alert('Failed to cancel order. Please try again.');
            this.showCancelModal = false;
          }
        });
      },
      error: (err) => {
        console.error('Error retrieving orders before cancel:', err);
        alert('Failed to retrieve order details. Please try again.');
        this.showCancelModal = false;
        this.orderToCancel = null;
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